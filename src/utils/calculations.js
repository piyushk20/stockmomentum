// TSMOM Calculation
export const calculateMomentum = (currentPrice, oldPrice) => {
    if (!oldPrice) return 0;
    return ((currentPrice / oldPrice) - 1) * 100;
};

// RSI Calculation
export const calculateRSI = (prices, period = 14) => {
    if (prices.length < period + 1) return 50; // Insufficient data

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Smoothed averages for subsequent periods
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;

        avgGain = ((avgGain * (period - 1)) + gain) / period;
        avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    }

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

// SMA Calculation
export const calculateSMA = (prices, period) => {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + (b || 0), 0);
    return sum / period;
};

// EMA Calculation (helper for MACD)
// EMA Calculation (returns array)
export const calculateEMAArray = (prices, period) => {
    const k = 2 / (period + 1);
    const emas = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
        emas.push((prices[i] * k) + (emas[i - 1] * (1 - k)));
    }
    return emas;
};

// EMA Calculation (helper for single value, deprecated but kept for compatibility if needed)


// MACD Calculation
export const calculateMACD = (prices) => {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

    // Calculate EMAs
    // We need to calculate EMA over the whole series for accuracy
    // But for simplicity and performance on client side, we can approximate or use a sufficient window
    // Here we'll just calculate the last values

    // A proper EMA implementation requires the previous EMA value.
    // We'll calculate the EMA arrays first.

    const getEMAArray = (data, period) => {
        const k = 2 / (period + 1);
        const emas = [data[0]];
        for (let i = 1; i < data.length; i++) {
            emas.push((data[i] * k) + (emas[i - 1] * (1 - k)));
        }
        return emas;
    };

    const ema12 = getEMAArray(prices, 12);
    const ema26 = getEMAArray(prices, 26);

    const macdLine = ema12.map((v, i) => v - ema26[i]);

    // Signal line is 9-day EMA of MACD line
    // We need at least 9 points of MACD line
    const signalLine = getEMAArray(macdLine, 9);

    const currentMACD = macdLine[macdLine.length - 1];
    const currentSignal = signalLine[signalLine.length - 1];

    return {
        macd: currentMACD,
        signal: currentSignal,
        histogram: currentMACD - currentSignal
    };
};

// ATR Calculation
export const calculateATR = (highs, lows, closes, period = 14) => {
    if (highs.length < period + 1) return 0;

    let trs = [];
    // First TR is High - Low
    trs.push(highs[0] - lows[0]);

    for (let i = 1; i < highs.length; i++) {
        const hl = highs[i] - lows[i];
        const hc = Math.abs(highs[i] - closes[i - 1]);
        const lc = Math.abs(lows[i] - closes[i - 1]);
        trs.push(Math.max(hl, hc, lc));
    }

    // Calculate ATR (Smoothed Moving Average of TR)
    // Initial ATR is simple average of first 'period' TRs
    let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Subsequent ATRs: (Previous ATR * (n-1) + Current TR) / n
    for (let i = period; i < trs.length; i++) {
        atr = ((atr * (period - 1)) + trs[i]) / period;
    }

    return atr;
};

// Pivot Points
export const calculatePivots = (high, low, close) => {
    const pivot = (high + low + close) / 3;
    return {
        pivot,
        r1: (2 * pivot) - low,
        s1: (2 * pivot) - high,
        r2: pivot + (high - low),
        s2: pivot - (high - low)
    };
};

// Resampling Utilities for Multi-Timeframe Analysis
export const resampleToWeekly = (closes, timestamps) => {
    if (!closes || !timestamps || closes.length === 0) return [];
    
    const weeklyCloses = [];
    let currentWeekNum = -1;
    let lastCloseInWeek = null;

    for (let i = 0; i < timestamps.length; i++) {
        // Create Date object (timestamps are in seconds from Yahoo API in api.js)
        const date = new Date(timestamps[i] * 1000);
        
        // Simple week number estimation based on day of year
        const start = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil(days / 7);
        const yearWeek = `${date.getFullYear()}-${weekNum}`;

        if (yearWeek !== currentWeekNum) {
            // New week started. Pushed the last close of the PREVIOUS week.
            if (lastCloseInWeek !== null) {
                weeklyCloses.push(lastCloseInWeek);
            }
            currentWeekNum = yearWeek;
        }
        
        // Update the last close seen in the current week
        lastCloseInWeek = closes[i];
    }
    
    // Push the very last close (current active week)
    if (lastCloseInWeek !== null) {
        weeklyCloses.push(lastCloseInWeek);
    }
    
    return weeklyCloses;
};

export const resampleToMonthly = (closes, timestamps) => {
    if (!closes || !timestamps || closes.length === 0) return [];
    
    const monthlyCloses = [];
    let currentMonthStr = "";
    let lastCloseInMonth = null;

    for (let i = 0; i < timestamps.length; i++) {
        const date = new Date(timestamps[i] * 1000);
        const monthStr = `${date.getFullYear()}-${date.getMonth()}`;

        if (monthStr !== currentMonthStr) {
            if (lastCloseInMonth !== null) {
                monthlyCloses.push(lastCloseInMonth);
            }
            currentMonthStr = monthStr;
        }
        
        lastCloseInMonth = closes[i];
    }
    
    if (lastCloseInMonth !== null) {
        monthlyCloses.push(lastCloseInMonth);
    }
    
    return monthlyCloses;
};
