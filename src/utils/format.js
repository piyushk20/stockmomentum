/**
 * Determines the currency symbol based on the stock/index ticker.
 * Assumes Indian assets end with .NS or start with ^NSE/^CNX/^BSESN.
 * Everything else defaults to USD for this MVP.
 */
export const formatCurrency = (symbol, value) => {
    if (!symbol) return '';
    
    const isIndian = 
        symbol.endsWith('.NS') || 
        symbol.startsWith('^NSE') || 
        symbol.startsWith('^CNX') || 
        symbol === '^BSESN' || 
        ['RELIANCE.NS', 'TCS.NS'].includes(symbol); // Quick fallbacks

    const currencySymbol = isIndian ? '₹' : '$';
    
    // Ensure value is a number and defined before formatting
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    const formattedValue = isNaN(numValue) ? '--' : numValue.toFixed(2);

    return `${currencySymbol}${formattedValue}`;
};
