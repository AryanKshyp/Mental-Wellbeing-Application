'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, MessageSquare, Bot, Menu, X } from 'lucide-react';

type NavLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: 'TalkSpace',
      href: '/dashboard/talkspace',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      name: 'AI Buddy',
      href: '/dashboard/buddy',
      icon: <Bot className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Project Haven
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                             (link.href !== '/dashboard' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm hover:shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <span className="mr-2 group-hover:scale-110 transition-transform">{link.icon}</span>
                  {link.name}
                  {isActive && (
                    <span className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-slate-600" />
            ) : (
              <Menu className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isMenuOpen ? 'max-h-96 py-2 border-t border-gray-100' : 'max-h-0 py-0'
        )}>
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href))
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100',
                )}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
