import { useEffect, useMemo, useState } from 'react';
import { Bell, Search, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/ui/theme-toggle';
import { useI18n } from '@/lib/i18n';

type HeaderFilterOption = {
  value: string;
  label: string;
};

type HeaderNotification = {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
};

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showCreateButton?: boolean;
  createButtonLabel?: string;
  onCreateClick?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  filterOptions?: HeaderFilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  notifications?: HeaderNotification[];
  onNotificationClick?: (id: string) => void;
}

const DashboardHeader = ({
  title,
  subtitle,
  showCreateButton = false,
  createButtonLabel = 'Create New',
  onCreateClick,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  filterOptions = [],
  activeFilter = 'all',
  onFilterChange,
  notifications = [],
  onNotificationClick,
}: DashboardHeaderProps) => {
  const [localSearch, setLocalSearch] = useState(searchValue ?? '');
  const { t } = useI18n();

  useEffect(() => {
    setLocalSearch(searchValue ?? '');
  }, [searchValue]);

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  return (
    <header className="px-4 lg:px-6 pt-4 lg:pt-6">
      <div className="surface-panel px-5 py-4 lg:px-6 lg:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl leading-none">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <div className="relative flex-1 min-w-[160px] lg:min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('header.search')}
                className="pl-9 h-10 border-border/80 bg-card rounded-full"
                value={localSearch}
                onChange={(event) => handleSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onSearchSubmit?.(localSearch);
                }}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Filters">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {filterOptions.length ? (
                  filterOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => onFilterChange?.(option.value)}>
                      {option.label}{activeFilter === option.value ? t('header.filters.selected') : ''}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>{t('header.filters.none')}</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Bell className="w-4 h-4 mx-auto" />
                  {(unreadCount > 0 || notifications.length > 0) && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {notifications.length ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} onClick={() => onNotificationClick?.(notification.id)}>
                      <div className="w-full">
                        <div className="text-sm font-medium">{notification.title}</div>
                        {notification.description && <div className="text-xs text-muted-foreground">{notification.description}</div>}
                        {notification.time && <div className="text-[11px] text-muted-foreground">{notification.time}</div>}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>{t('header.notifications.none')}</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
