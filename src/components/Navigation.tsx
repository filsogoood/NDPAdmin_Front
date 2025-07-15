'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Server, BarChart3, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/lib/auth';
import { useState } from 'react';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      name: '대시보드',
      href: '/dashboard',
      icon: BarChart3,
    },
    {
      name: '노드 관리',
      href: '/nodes',
      icon: Server,
    },
  ];

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  return (
    <nav className={cn('bg-gray-800 border-b border-gray-700', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-gray-100">NDP Admin</span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-100 p-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
