'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Languages,
  BarChart3,
  Settings,
  Flame,
  User,
  BookOpen
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/vocab', label: 'Flashcards', icon: Languages },
  { href: '/reader', label: 'Reader', icon: BookOpen },
  { href: '/stats', label: 'Progress', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface NavigationProps {
  userName?: string;
  streak?: number;
  avatarEmoji?: string;
  avatarBgColor?: string;
}

export default function Navigation({
  userName = 'Learner',
  streak = 0,
  avatarEmoji = '😊',
  avatarBgColor = '#FFE4C4'
}: NavigationProps) {
  const pathname = usePathname();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen fixed left-0 top-0">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">SvaraLab</h1>
              <p className="text-xs text-text-secondary">English Practice</p>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <Link href="/profile" className="p-4 mx-4 mt-4 rounded-xl bg-background-alt hover:bg-border/30 transition-colors">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: avatarBgColor }}
            >
              {avatarEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                {getGreeting()}
              </p>
              <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-repeat-bg">
                <Flame className="w-4 h-4 text-repeat" />
                <span className="text-xs font-bold text-repeat">{streak}</span>
              </div>
            )}
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-background-alt hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-tertiary text-center">
            Made with love for Indonesian students
          </p>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-base font-bold text-white">S</span>
            </div>
            <span className="text-base font-bold text-text-primary">SvaraLab</span>
          </Link>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-repeat-bg">
                <Flame className="w-4 h-4 text-repeat" />
                <span className="text-xs font-bold text-repeat">{streak}</span>
              </div>
            )}
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: avatarBgColor }}
            >
              {avatarEmoji}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
