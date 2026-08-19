import sys
import json
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.database.database import engine
from app.models.user import User
from app.models.course import Course
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.models.assessment import Assessment
from app.models.assessment_question import AssessmentQuestion
from app.models.assessment_attempt import AssessmentAttempt, AttemptStatus
from app.models.student_answer import StudentAnswer
from app.enums.assessment import AssessmentStatus as AssessmentStatusEnum, AssessmentType, AssessmentScope
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate
from app.schemas.assessment_attempt import AssessmentAttemptCreate, AssessmentSubmitRequest, StudentSubmitAnswerItem
from app.services.assessment import AssessmentService
from app.services.assessment_attempt import AssessmentAttemptService
from fastapi import HTTPException

def run_verification():
    print("==================================================")
    print("     ArivuAI Assessment Workflow Audit Suite       ")
    print("==================================================")
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Fetch Target Course & Teachers/Students
        course = db.query(Course).filter(Course.id == 227).first()
        if not course:
            course = db.query(Course).first()
            
        owner_teacher = db.query(User).filter(User.id == course.teacher_id).first()
        other_teacher = db.query(User).filter(User.role == "TEACHER", User.id != owner_teacher.id).first()
        
        student1 = db.query(User).filter(User.role == "STUDENT").first()
        student2 = db.query(User).filter(User.role == "STUDENT", User.id != student1.id).first()
        if not student2:
            student2 = student1
            
        print(f"Target Course: ID={course.id}, Title='{course.title}', Teacher ID={course.teacher_id}")
        print(f"Owner Teacher: ID={owner_teacher.id}, Email={owner_teacher.email}")
        if other_teacher:
            print(f"Other Teacher: ID={other_teacher.id}, Email={other_teacher.email}")
        print(f"Student 1: ID={student1.id}, Email={student1.email}")
        print(f"Student 2: ID={student2.id}, Email={student2.email}")
        
        # Ensure student1 is enrolled
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.student_id == student1.id,
            CourseEnrollment.course_id == course.id,
        ).first()
        if not enrollment:
            enrollment = CourseEnrollment(student_id=student1.id, course_id=course.id, status=EnrollmentStatus.ENROLLED)
            db.add(enrollment)
            db.commit()
            
        # Clean up old test assessments
        existing_tests = db.query(Assessment).filter(
            Assessment.course_id == course.id,
            Assessment.title.like("%Automated Audit%")
        ).all()
        for a in existing_tests:
            attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id == a.id).all()
            for att in attempts:
                db.query(StudentAnswer).filter(StudentAnswer.attempt_id == att.id).delete()
                db.delete(att)
            db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == a.id).delete()
            db.delete(a)
        db.commit()
        
        assessment_svc = AssessmentService(db)
        attempt_svc = AssessmentAttemptService(db)
        
        # --- TEST 1: Teacher Creation & Publishing ---
        print("\n--- TEST 1: Teacher Creates & Publishes Assessment ---")
        question_ids = [6, 7, 8, 9, 10]
        create_payload = AssessmentCreate(
            title="Automated Audit Software Quiz",
            description="Audit verification quiz",
            assessment_type=AssessmentType.QUIZ,
            scope=AssessmentScope.LESSON,
            status=AssessmentStatusEnum.PUBLISHED,
            course_id=course.id,
            chapter_id=48,
            lesson_id=48,
            duration_minutes=20,
            passing_score=60,
            max_attempts=2,
            shuffle_questions=True,
            shuffle_options=True,
            show_correct_answers=True,
            question_ids=question_ids,
        )
        created = assessment_svc.create_assessment(create_payload, current_user=owner_teacher)
        print(f"Created Assessment ID: {created.id}, Status: {created.status}, Total Marks: {created.total_marks}")
        assert created.id is not None
        assert created.status == AssessmentStatusEnum.PUBLISHED
        print("[OK] Assessment creation & publishing passed!")
        
        # --- TEST 2: Publish Authorization Consolidation ---
        print("\n--- TEST 2: Publish Authorization Consolidation ---")
        empty_pub_payload = AssessmentCreate(
            title="Empty Audit Quiz",
            assessment_type=AssessmentType.QUIZ,
            scope=AssessmentScope.LESSON,
            status=AssessmentStatusEnum.PUBLISHED,
            course_id=course.id,
            duration_minutes=10,
            passing_score=50,
            max_attempts=1,
            shuffle_questions=False,
            shuffle_options=False,
            show_correct_answers=True,
            question_ids=[],
        )
        try:
            assessment_svc.create_assessment(empty_pub_payload, current_user=owner_teacher)
            assert False, "Should reject empty publishing"
        except HTTPException as e:
            print(f"Caught expected rejection: {e.detail}")
            assert "Cannot publish an assessment with no questions" in str(e.detail)
            print("[OK] Empty publishing rejection passed!")
            
        # --- TEST 3: Teacher Ownership Authorization ---
        if other_teacher:
            print("\n--- TEST 3: Teacher Ownership Authorization ---")
            try:
                assessment_svc.create_assessment(create_payload, current_user=other_teacher)
                assert False, "Other teacher should not create assessment for foreign course"
            except HTTPException as e:
                print(f"Caught expected rejection: {e.detail}")
                print("[OK] Teacher course creation isolation passed!")
                
            try:
                assessment_svc.update_assessment(created.id, AssessmentUpdate(title="Hacked Title"), current_user=other_teacher)
                assert False, "Other teacher should not update foreign assessment"
            except HTTPException as e:
                print(f"Caught expected rejection: {e.detail}")
                print("[OK] Teacher assessment modification isolation passed!")
                
        # --- TEST 4: Student Take JSON Answer Key Isolation ---
        print("\n--- TEST 4: JSON Answer Key Leakage Audit ---")
        take_resp = assessment_svc.get_assessment_for_student_take(created.id, current_user=student1)
        raw_json = json.dumps(take_resp.model_dump())
        print(f"Raw JSON snippet: {raw_json[:150]}...")
        forbidden_keys = ["correct_option", "correct_answer", "explanation", "solution", "is_ai_generated"]
        for key in forbidden_keys:
            assert key not in raw_json, f"Forbidden key '{key}' found in JSON response payload!"
        print("[OK] Zero answer key leakage verified in JSON payload!")
        
        # --- TEST 5: Student Start Attempt & Resume Logic ---
        print("\n--- TEST 5: Student Start Attempt & Resume Logic ---")
        att_payload = AssessmentAttemptCreate(assessment_id=created.id)
        att1 = attempt_svc.create_attempt(att_payload, current_user=student1)
        print(f"Attempt 1 ID: {att1.id}, Status: {att1.status}")
        assert att1.status == AttemptStatus.IN_PROGRESS
        
        att1_res = attempt_svc.create_attempt(att_payload, current_user=student1)
        assert att1_res.id == att1.id
        print("[OK] Resume logic passed!")
        
        # --- TEST 6: Student Submission & Grading ---
        print("\n--- TEST 6: Atomic Submission & Grading ---")
        submit_payload = AssessmentSubmitRequest(
            answers=[
                StudentSubmitAnswerItem(question_id=6, selected_option="d"),
                StudentSubmitAnswerItem(question_id=7, selected_option="b"),
                StudentSubmitAnswerItem(question_id=8, selected_option="a"),
                StudentSubmitAnswerItem(question_id=9, selected_option="c"),
                StudentSubmitAnswerItem(question_id=10, selected_option="b"),
            ]
        )
        res = attempt_svc.submit_attempt_with_answers(att1.id, submit_payload, current_user=student1)
        print(f"Submitted Result: Score={res.score}/{res.total_marks}, Passed={res.passed}")
        assert res.score == 5
        assert res.passed == True
        print("[OK] Submission & grading passed!")
        
        # --- TEST 7: Server-side Duration Expiration Enforcement ---
        print("\n--- TEST 7: Server-side Duration Expiration Enforcement ---")
        att2 = attempt_svc.create_attempt(att_payload, current_user=student1)
        # Simulate expired started_at (1 hour ago, duration is 20 mins)
        attempt_obj = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == att2.id).first()
        attempt_obj.started_at = datetime.now(timezone.utc) - timedelta(minutes=60)
        db.commit()
        
        try:
            attempt_svc.submit_attempt_with_answers(att2.id, submit_payload, current_user=student1)
            assert False, "Should reject expired attempt submission"
        except HTTPException as e:
            print(f"Caught expected rejection: {e.detail}")
            assert "exceeded. Submission expired." in str(e.detail)
            print("[OK] Server-side duration expiration enforcement passed!")
            
        print("\n==================================================")
        print("   ALL AUDIT SUITE TESTS PASSED 100%!              ")
        print("==================================================")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_verification()
