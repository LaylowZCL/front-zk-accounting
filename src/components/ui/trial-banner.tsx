import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCashierTrialStatus, getCashierPlans, startCashierCheckout } from '@/lib/cashier-api';
import { toast } from 'sonner';

interface TrialBannerProps {
  onUpgrade?: () => void;
}

const TrialBanner = ({ onUpgrade }: TrialBannerProps) => {
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadTrialStatus = async () => {
      try {
        const response = await getCashierTrialStatus();
        if (response.ok && response.data) {
          setTrialStatus(response.data);
        }
      } catch (error) {
        // Silently fail - don't show error for trial banner
        console.error('Failed to load trial status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrialStatus();
  }, []);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('trial-banner-dismissed');
    if (dismissed) {
      setDismissed(true);
    }
  }, []);

  if (isLoading || dismissed || !trialStatus?.is_active) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('trial-banner-dismissed', 'true');
  };

  const handleUpgrade = async () => {
    try {
      // Get available plans
      const plansResponse = await getCashierPlans();
      if (plansResponse.ok && plansResponse.data.length > 0) {
        // Start checkout with the first available plan
        const checkoutResponse = await startCashierCheckout(plansResponse.data[0].id);
        if (checkoutResponse.ok && checkoutResponse.data.checkout_url) {
          window.location.href = checkoutResponse.data.checkout_url;
        } else {
          toast.error('Failed to start checkout');
        }
      } else {
        toast.error('No plans available');
      }
    } catch (error) {
      toast.error('Failed to start checkout');
    }
  };

  const daysRemaining = trialStatus.days_remaining;
  const urgencyColor = daysRemaining <= 3 ? 'bg-red-50 border-red-200 text-red-800' : 
                      daysRemaining <= 7 ? 'bg-orange-50 border-orange-200 text-orange-800' : 
                      'bg-blue-50 border-blue-200 text-blue-800';

  return (
    <div className={`border-b ${urgencyColor} px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold">
            Trial: {daysRemaining} dias restantes
          </span>
          <span className="text-sm opacity-75">
            Seu trial termina em {new Date(trialStatus.trial_ends_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleUpgrade}
            className="border-current hover:bg-current hover:text-white"
          >
            Assinar Agora
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="p-1 h-auto hover:bg-black/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;
