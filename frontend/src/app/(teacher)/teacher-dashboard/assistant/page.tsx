'use client';

import { Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIAssistantPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">Get AI-powered help with your teaching tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generate Quiz */}
        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground">Generate Quiz</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Create a quiz from any course material or topic
          </p>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            Start Generating
          </Button>
        </div>

        {/* Generate Questions */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground">Generate Questions</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Generate specific types of questions with custom difficulty
          </p>
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            Generate Questions
          </Button>
        </div>

        {/* Analyze Content */}
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground">Analyze Content</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Get insights on teaching materials and learning objectives
          </p>
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
            Analyze Now
          </Button>
        </div>

        {/* Create Assignment */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground">Create Assignment</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Generate assignments with auto-grading rubrics
          </p>
          <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
            Create Assignment
          </Button>
        </div>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-foreground mb-3">Recent AI Activities</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
            <div>
              <p className="text-sm font-medium text-foreground">Generated 5 quiz questions</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Completed</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
            <div>
              <p className="text-sm font-medium text-foreground">Analyzed Python course materials</p>
              <p className="text-xs text-muted-foreground">5 hours ago</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Completed</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
            <div>
              <p className="text-sm font-medium text-foreground">Created assignment with rubric</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}


