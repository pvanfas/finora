import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  RefreshCw,
  Send,
  FileText,
  BarChart3,
  Headphones,
  Settings,
  Bell,
  User,
} from 'lucide-react';
import { NavItem } from '@/types/navigation';

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Budget', href: '/budget', icon: Wallet },
  { label: 'Expenses', href: '/expenses', icon: ShoppingCart },
  { label: 'Recurring', href: '/recurring', icon: RefreshCw },
  { label: 'Goals', href: '/goals', icon: Send },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Insights', href: '/insights', icon: BarChart3 },
  { label: 'Help & Support', href: '/help', icon: Headphones },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Notifications', href: '/notifications', icon: Bell, badge: '2' },
  { label: 'Profile', href: '/profile', icon: User },
];
