// API data utilities for external APIs

export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  currencies?: { [key: string]: { name: string; symbol: string } };
}

export interface State {
  id: number;
  name: string;
  country_code?: string;
}

export interface Industry {
  id: string;
  name: string;
  description?: string;
}

// Static industries data (since free industry APIs are limited)
export const INDUSTRIES: Industry[] = [
  { id: 'technology', name: 'Technology' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'finance', name: 'Finance' },
  { id: 'education', name: 'Education' },
  { id: 'retail', name: 'Retail' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'construction', name: 'Construction' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'energy', name: 'Energy' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'hospitality', name: 'Hospitality' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'telecommunications', name: 'Telecommunications' },
  { id: 'pharmaceutical', name: 'Pharmaceutical' },
  { id: 'design', name: 'Design' },
  { id: 'consulting', name: 'Consulting' },
  { id: 'legal', name: 'Legal' },
  { id: 'media', name: 'Media' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'aerospace', name: 'Aerospace' },
  { id: 'chemical', name: 'Chemical' },
  { id: 'food-beverage', name: 'Food & Beverage' },
  { id: 'textiles', name: 'Textiles' },
  { id: 'mining', name: 'Mining' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'insurance', name: 'Insurance' },
  { id: 'non-profit', name: 'Non-Profit' },
  { id: 'government', name: 'Government' },
  { id: 'other', name: 'Other' },
];

// Currency options with symbols
export const CURRENCIES = [
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
];

// Fetch countries from REST Countries API
export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,currencies');
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const data = await response.json();
    return data.sort((a: Country, b: Country) => a.name.common.localeCompare(b.name.common));
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Fallback to some common countries
    return [
      { name: { common: 'Mozambique', official: 'Republic of Mozambique' }, cca2: 'MZ', cca3: 'MOZ' },
      { name: { common: 'United States', official: 'United States of America' }, cca2: 'US', cca3: 'USA' },
      { name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' }, cca2: 'GB', cca3: 'GBR' },
      { name: { common: 'Portugal', official: 'Portuguese Republic' }, cca2: 'PT', cca3: 'PRT' },
      { name: { common: 'Brazil', official: 'Federative Republic of Brazil' }, cca2: 'BR', cca3: 'BRA' },
      { name: { common: 'South Africa', official: 'Republic of South Africa' }, cca2: 'ZA', cca3: 'ZAF' },
    ];
  }
};

// Fetch states/provinces for a country (using a mock implementation since free APIs are limited)
export const fetchStates = async (countryCode: string): Promise<State[]> => {
  // Mock data for some countries. In a real implementation, you'd use a proper API
  const mockStates: { [key: string]: State[] } = {
    'MZ': [
      { id: 1, name: 'Maputo Province' },
      { id: 2, name: 'Maputo City' },
      { id: 3, name: 'Gaza' },
      { id: 4, name: 'Inhambane' },
      { id: 5, name: 'Manica' },
      { id: 6, name: 'Sofala' },
      { id: 7, name: 'Tete' },
      { id: 8, name: 'Zambézia' },
      { id: 9, name: 'Nampula' },
      { id: 10, name: 'Niassa' },
      { id: 11, name: 'Cabo Delgado' },
    ],
    'US': [
      { id: 1, name: 'Alabama' },
      { id: 2, name: 'Alaska' },
      { id: 3, name: 'Arizona' },
      { id: 4, name: 'Arkansas' },
      { id: 5, name: 'California' },
      { id: 6, name: 'Colorado' },
      { id: 7, name: 'Connecticut' },
      { id: 8, name: 'Delaware' },
      { id: 9, name: 'Florida' },
      { id: 10, name: 'Georgia' },
      { id: 11, name: 'Hawaii' },
      { id: 12, name: 'Idaho' },
      { id: 13, name: 'Illinois' },
      { id: 14, name: 'Indiana' },
      { id: 15, name: 'Iowa' },
      { id: 16, name: 'Kansas' },
      { id: 17, name: 'Kentucky' },
      { id: 18, name: 'Louisiana' },
      { id: 19, name: 'Maine' },
      { id: 20, name: 'Maryland' },
      { id: 21, name: 'Massachusetts' },
      { id: 22, name: 'Michigan' },
      { id: 23, name: 'Minnesota' },
      { id: 24, name: 'Mississippi' },
      { id: 25, name: 'Missouri' },
      { id: 26, name: 'Montana' },
      { id: 27, name: 'Nebraska' },
      { id: 28, name: 'Nevada' },
      { id: 29, name: 'New Hampshire' },
      { id: 30, name: 'New Jersey' },
      { id: 31, name: 'New Mexico' },
      { id: 32, name: 'New York' },
      { id: 33, name: 'North Carolina' },
      { id: 34, name: 'North Dakota' },
      { id: 35, name: 'Ohio' },
      { id: 36, name: 'Oklahoma' },
      { id: 37, name: 'Oregon' },
      { id: 38, name: 'Pennsylvania' },
      { id: 39, name: 'Rhode Island' },
      { id: 40, name: 'South Carolina' },
      { id: 41, name: 'South Dakota' },
      { id: 42, name: 'Tennessee' },
      { id: 43, name: 'Texas' },
      { id: 44, name: 'Utah' },
      { id: 45, name: 'Vermont' },
      { id: 46, name: 'Virginia' },
      { id: 47, name: 'Washington' },
      { id: 48, name: 'West Virginia' },
      { id: 49, name: 'Wisconsin' },
      { id: 50, name: 'Wyoming' },
    ],
    'BR': [
      { id: 1, name: 'São Paulo' },
      { id: 2, name: 'Rio de Janeiro' },
      { id: 3, name: 'Minas Gerais' },
      { id: 4, name: 'Bahia' },
      { id: 5, name: 'Paraná' },
      { id: 6, name: 'Rio Grande do Sul' },
      { id: 7, name: 'Pernambuco' },
      { id: 8, name: 'Ceará' },
      { id: 9, name: 'Pará' },
      { id: 10, name: 'Santa Catarina' },
      { id: 11, name: 'Goiás' },
      { id: 12, name: 'Maranhão' },
      { id: 13, name: 'Amazonas' },
      { id: 14, name: 'Espírito Santo' },
      { id: 15, name: 'Mato Grosso' },
      { id: 16, name: 'Mato Grosso do Sul' },
      { id: 17, name: 'Distrito Federal' },
      { id: 18, name: 'Alagoas' },
      { id: 19, name: 'Rio Grande do Norte' },
      { id: 20, name: 'Piauí' },
      { id: 21, name: 'Acre' },
      { id: 22, name: 'Amapá' },
      { id: 23, name: 'Rondônia' },
      { id: 24, name: 'Roraima' },
      { id: 25, name: 'Tocantins' },
      { id: 26, name: 'Sergipe' },
    ],
    'PT': [
      { id: 1, name: 'Lisbon' },
      { id: 2, name: 'Porto' },
      { id: 3, name: 'Setúbal' },
      { id: 4, name: 'Braga' },
      { id: 5, name: 'Aveiro' },
      { id: 6, name: 'Faro' },
      { id: 7, name: 'Coimbra' },
      { id: 8, name: 'Leiria' },
      { id: 9, name: 'Azores' },
      { id: 10, name: 'Madeira' },
    ],
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStates[countryCode] || []);
    }, 300); // Simulate API delay
  });
};
