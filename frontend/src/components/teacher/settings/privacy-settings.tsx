import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Update Password
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <Button variant="outline">Enable 2FA</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Current Session</p>
              <p className="text-sm text-gray-500">Chrome on macOS • Last active just now</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">iPhone</p>
              <p className="text-sm text-gray-500">Safari on iOS • Last active 2 days ago</p>
            </div>
            <button className="text-red-500 hover:text-red-700 text-sm font-medium">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


