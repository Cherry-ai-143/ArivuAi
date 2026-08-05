'use client';

import { Download, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      name: 'Monthly Performance Report',
      date: 'December 2024',
      type: 'Performance',
      size: '2.4 MB',
    },
    {
      id: 2,
      name: 'Student Progress Summary',
      date: 'December 2024',
      type: 'Progress',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'Assessment Results',
      date: 'December 2024',
      type: 'Assessments',
      size: '3.1 MB',
    },
    {
      id: 4,
      name: 'Engagement Analytics',
      date: 'November 2024',
      type: 'Engagement',
      size: '2.0 MB',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
        <p className="text-muted-foreground">Download and manage all your reports</p>
      </div>

      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-gray-200">
        <Filter className="w-4 h-4 text-gray-600" />
        <select className="flex-1 outline-none bg-transparent text-sm">
          <option>All Reports</option>
          <option>Performance</option>
          <option>Progress</option>
          <option>Assessments</option>
          <option>Engagement</option>
        </select>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div>
              <p className="font-semibold text-foreground">{report.name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {report.date}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                  {report.type}
                </span>
                <span>{report.size}</span>
              </div>
            </div>
            <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}


