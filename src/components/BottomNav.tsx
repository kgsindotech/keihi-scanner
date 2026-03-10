'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { ScanIcon, DashboardIcon, ListIcon, SettingsIcon } from './Icons';

export function BottomNav() {
  const pathname = usePathname();
  const { locale } = useApp();

  const links = [
    { href: '/', label: t(locale, 'navScan'), Icon: ScanIcon },
    { href: '/dashboard', label: t(locale, 'navDashboard'), Icon: DashboardIcon },
    { href: '/expenses', label: t(locale, 'navExpenses'), Icon: ListIcon },
    { href: '/settings', label: t(locale, 'navSettings'), Icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {active && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
              )}
              <link.Icon size={22} className={active ? 'text-blue-600' : ''} />
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : ''}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
