import { useState, useEffect } from 'react';
import { getSettings } from '@/lib/business-api';

export interface CompanySettings {
  company_name?: string;
  tax_id?: string;
  tax_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  currency?: string;
  timezone?: string;
  language?: string;
  logo_url?: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await getSettings();
        const companyData = response.company || {};
        
        // Mapear os campos da API para o formato esperado
        const mappedSettings: CompanySettings = {
          company_name: companyData.name,
          tax_id: companyData.tax_number,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          website: (companyData as any).website,
          currency: (companyData as any).currency,
          timezone: (companyData as any).timezone,
          language: (companyData as any).language,
          logo_url: (companyData as any).logo_url,
        };
        
        setSettings(mappedSettings);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company settings');
        console.error('Error loading company settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};
