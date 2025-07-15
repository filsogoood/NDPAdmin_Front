import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge';
  className?: string;
}

export function StatusBadge({ 
  status, 
  size = 'md', 
  variant = 'badge',
  className 
}: StatusBadgeProps) {
  const statusText = status === 'online' ? '온라인' : 
                    status === 'offline' ? '오프라인' : 
                    status === 'maintenance' ? '점검중' : 
                    status === 'error' ? '오류' : status;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'online':
        return {
          dot: 'bg-green-500',
          text: 'text-green-400',
          bg: 'bg-green-500/20 text-green-400'
        };
      case 'offline':
        return {
          dot: 'bg-red-500',
          text: 'text-red-400',
          bg: 'bg-red-500/20 text-red-400'
        };
      default:
        return {
          dot: 'bg-gray-500',
          text: 'text-gray-400',
          bg: 'bg-gray-500/20 text-gray-400'
        };
    }
  };

  const statusClasses = getStatusClasses(status);

  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div 
          className={cn(
            'rounded-full',
            statusClasses.dot,
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-3 h-3',
            size === 'lg' && 'w-4 h-4'
          )}
        />
        <span className={cn('text-sm', statusClasses.text)}>
          {statusText}
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        statusClasses.bg,
        className
      )}
    >
      {statusText}
    </span>
  );
}
