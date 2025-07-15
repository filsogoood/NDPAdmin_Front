import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko });
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
}

export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
      return 'text-green-400';
    case 'offline':
      return 'text-red-400';
    case 'maintenance':
      return 'text-yellow-400';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-red-500';
    case 'maintenance':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-600';
    default:
      return 'bg-gray-500';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'success':
      return 'bg-green-500';
    case 'info':
      return 'bg-blue-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getPerformanceLevel(score: number): { level: string; color: string } {
  if (score >= 90) {
    return { level: 'Excellent', color: 'text-green-400' };
  }
  if (score >= 80) {
    return { level: 'Good', color: 'text-blue-400' };
  }
  if (score >= 70) {
    return { level: 'Average', color: 'text-yellow-400' };
  }
  return { level: 'Poor', color: 'text-red-400' };
}
