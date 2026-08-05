import { User, Lock, Bell } from 'lucide-react';

interface SettingsNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}


