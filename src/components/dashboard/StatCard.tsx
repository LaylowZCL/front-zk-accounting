import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'from-primary to-accent',
}: StatCardProps) => {
  return (
    <div className="p-6 rounded-[28px] glass-soft hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-2xl font-display font-bold">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm mt-1 font-medium',
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-destructive',
                changeType === 'neutral' && 'text-muted-foreground'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center', iconColor)}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
