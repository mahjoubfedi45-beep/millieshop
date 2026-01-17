// Currency Configuration
export const CURRENCY_CONFIG = {
  // Current currency
  code: 'TND',
  symbol: 'TND',
  name: 'Dinar Tunisien',
  
  // Formatting options
  decimals: 2,
  position: 'after', // 'before' or 'after' the amount
  
  // Available currencies for admin
  available: [
    { code: 'TND', symbol: 'TND', name: 'Dinar Tunisien' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar US' },
    { code: 'MAD', symbol: 'MAD', name: 'Dirham Marocain' },
    { code: 'DZD', symbol: 'DZD', name: 'Dinar Algérien' }
  ]
};

// Format price with currency
export const formatPrice = (amount, currency = CURRENCY_CONFIG) => {
  const formattedAmount = parseFloat(amount).toFixed(currency.decimals);
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${currency.symbol}`;
  }
};

// Get currency symbol
export const getCurrencySymbol = () => CURRENCY_CONFIG.symbol;

// Get currency code
export const getCurrencyCode = () => CURRENCY_CONFIG.code;

export default CURRENCY_CONFIG;