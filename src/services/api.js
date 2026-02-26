/**
 * Fetches historical stock data from Yahoo Finance API
 * @param {string} symbol - Stock symbol (e.g., RELIANCE.NS)
 * @param {number} days - Number of days of history to fetch
 * @returns {Promise<Object>} - Object containing price arrays and timestamps
 */
export const fetchStockData = async (symbol, days = 250) => {
    try {
        const endDate = Math.floor(Date.now() / 1000);
        // Add extra buffer to ensure we have enough trading days (weekends/holidays)
        // 1.5 multiplier is usually safe for trading days vs calendar days
        const startDate = endDate - (days * 1.5 * 24 * 60 * 60);

        // Using a CORS proxy if direct access fails would be the next step, 
        // but we'll try direct first as requested.
        // Note: In a real production app, this should go through a backend.
        // Use local proxy to avoid CORS issues
        const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${Math.floor(startDate)}&period2=${endDate}&interval=1d`;

        let response = await fetch(url);

        if (!response.ok) {
            // Fallback to v7 API if v8 fails
            console.warn(`v8 API failed for ${symbol}, trying v7...`);
            const v7Url = `/api/yahoo/v7/finance/chart/${encodeURIComponent(symbol)}?period1=${Math.floor(startDate)}&period2=${endDate}&interval=1d`;
            response = await fetch(v7Url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();
        const result = data.chart.result?.[0];

        if (!result) {
            throw new Error('No data found for symbol');
        }

        const quote = result.indicators.quote[0];

        // Filter out null values (days with no trading data)
        const cleanData = result.timestamp.map((time, i) => ({
            time,
            close: quote.close[i],
            high: quote.high[i],
            low: quote.low[i],
            open: quote.open[i],
            volume: quote.volume[i]
        })).filter(day => day.close !== null && day.high !== null && day.low !== null);

        return {
            symbol: result.meta.symbol,
            timestamps: cleanData.map(d => d.time),
            closes: cleanData.map(d => d.close),
            highs: cleanData.map(d => d.high),
            lows: cleanData.map(d => d.low),
            opens: cleanData.map(d => d.open),
            volumes: cleanData.map(d => d.volume)
        };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
};
