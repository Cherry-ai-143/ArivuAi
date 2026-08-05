import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccountSettings() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-2xl text-white">
              👩‍🏫
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Change Avatar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <Input placeholder="Dr." defaultValue="Sarah" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input placeholder="Johnson" defaultValue="Johnson" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input type="email" placeholder="sarah@example.com" defaultValue="sarah@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Tell us about yourself..."
              defaultValue="Passionate educator with 10+ years of experience in computer science"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Display name publicly</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Allow students to message me</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          Save Changes
        </Button>
        <Button variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}


