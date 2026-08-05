import { useQuery } from '@tanstack/react-query'
import { getAllAssessments, getAssessmentById } from '@/lib/services/assessment.service'
import { getStoredToken } from '@/lib/api/axios'

export function useAssessments(courseId?: number) {
  const token = typeof window !== 'undefined' ? getStoredToken() : null

  return useQuery({
    queryKey: ['assessments', courseId || 'all'],
    queryFn: () => getAllAssessments(courseId),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAssessment(id?: number) {
  const token = typeof window !== 'undefined' ? getStoredToken() : null

  return useQuery({
    queryKey: ['assessment', id],
    queryFn: () => getAssessmentById(id!),
    enabled: Boolean(token && id && id > 0),
    staleTime: 1000 * 60 * 2,
  })
}
