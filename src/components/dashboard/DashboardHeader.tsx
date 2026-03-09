import { Bell, Search, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showCreateButton?: boolean;
  createButtonLabel?: string;
  onCreateClick?: () => void;
}

const DashboardHeader = ({
  title,
  subtitle,
  showCreateButton = false,
  createButtonLabel = 'Create New',
  onCreateClick,
}: DashboardHeaderProps) => {
  return (
    <header className="px-4 lg:px-6 pt-4 lg:pt-6">
      <div className="surface-panel px-5 py-4 lg:px-6 lg:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl leading-none">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="relative flex-1 min-w-[160px] lg:min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-9 h-10 border-border/80 bg-card rounded-full"
              />
            </div>

            <Button variant="outline" size="icon" aria-label="Filters">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>

            <button className="relative h-10 w-10 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Bell className="w-4 h-4 mx-auto" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full" />
            </button>

            {showCreateButton && (
              <Button variant="default" size="default" onClick={onCreateClick}>
                <Plus className="w-4 h-4" />
                {createButtonLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
