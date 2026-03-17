import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoredThemeMode, setThemeMode, ThemeMode } from '@/lib/theme';

type ThemeToggleProps = {
  size?: 'sm' | 'icon';
};

const ThemeToggle = ({ size = 'icon' }: ThemeToggleProps) => {
  const current = getStoredThemeMode();

  const handleToggle = () => {
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  return (
    <Button variant="outline" size={size} onClick={handleToggle} aria-label="Toggle theme">
      {current === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
};

export default ThemeToggle;
