'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  Bot,
  Puzzle,
  User 
} from 'lucide-react';

const navigation = [
  { name: 'Meetings', href: '/', icon: LayoutDashboard },
  { name: 'My Meetings', href: '/my-meetings', icon: Calendar },
  { name: 'All Meetings', href: '/all-meetings', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const comingSoon = [
  { name: 'Live Meeting Bot', icon: Bot },
  { name: 'Integrations', icon: Puzzle },
  { name: 'Team Collaboration', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Meeting Notes</h1>
        <p className="text-sm text-gray-500">AI-powered workspace</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main
          </h3>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Coming Soon
          </h3>
          {comingSoon.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                Soon
              </span>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">john@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
