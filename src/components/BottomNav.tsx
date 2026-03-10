'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';

export function BottomNav() {
  const pathname = usePathname();
  const { locale } = useApp();

  const links = [
    { href: '/', label: t(locale, 'navScan'), icon: '📸' },
    { href: '/dashboard', label: t(locale, 'navDashboard'), icon: '📊' },
    { href: '/expenses', label: t(locale, 'navExpenses'), icon: '📋' },
    { href: '/settings', label: t(locale, 'navSettings'), icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                active ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-0.5">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
