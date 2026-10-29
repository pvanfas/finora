import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  FileText,
  Bell,
  User,
} from 'lucide-react';
import { NavItem } from '@/types/navigation';

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: ShoppingCart },
  { label: 'Incomes', href: '/incomes', icon: TrendingUp },
  { label: 'Reports', href: '/reports', icon: FileText },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Notifications', href: '/notifications', icon: Bell, badge: '2' },
  { label: 'Profile', href: '/profile', icon: User },
];
