export const calculateMinerviniSetup = (closes, highs, lows, volumes, ema9, ema20, ema50, ema200, ema200Array) => {
    if (!closes || closes.length < 260) {
        return { passed: false, reason: 'Insufficient Data (Need ~1 year)', criteria: {} };
    }

    const currentPrice = closes[closes.length - 1];
    const prevPrice = closes[closes.length - 2];
    const currentVolume = volumes[volumes.length - 1];

    // 1. Trend Alignment: 9 > 20 > 50 > 200
    const trendAligned = ema9 > ema20 && ema20 > ema50 && ema50 > ema200;

    // 2. 200 EMA Rising for at least 3 months (approx 60 trading days)
    // We check if current 200 EMA > 200 EMA 60 days ago
    // Ideally, we'd check slope, but a simple comparison is a good proxy for "rising"
    const ema200_60daysAgo = ema200Array[ema200Array.length - 61];
    const ema200Rising = ema200 > ema200_60daysAgo;

    // 3. 50 EMA > 200 EMA (Already covered in trendAligned, but explicit check)
    const sma50Above200 = ema50 > ema200;

    // 4. Current Price > 100% from 52 week low
    // Get 52 week low (approx last 250 trading days)
    const recentLows = lows.slice(-250);
    const low52Week = Math.min(...recentLows);
    const priceAboveLow = currentPrice >= (low52Week * 2); // 100% increase = 2x

    // 5. Stock made 52 week high in past 3-4 months (approx 80 days)
    const recentHighs = highs.slice(-250);
    const high52Week = Math.max(...recentHighs);

    // Check if the 52-week high occurred within the last 80 days
    // We need to find the index of the high in the sliced array
    const last80Highs = highs.slice(-80);
    const highInLast80 = Math.max(...last80Highs);
    // If the max of last 80 days is close to the 52-week high (within 2%), we consider it "made" recently
    const near52WeekHigh = highInLast80 >= (high52Week * 0.98);

    // 6. Stock moving up with good volume
    // Price > Prev Close AND Volume > 50-day Average Volume
    const volSMA50 = volumes.slice(-50).reduce((a, b) => a + b, 0) / 50;
    const goodVolumeMove = currentPrice > prevPrice && currentVolume > volSMA50;

    // 7. VCP Pattern Heuristic (Volatility Contraction & Tightness)
    // Helper to calculate Standard Deviation
    const calculateStdDev = (arr) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
    };

    const last10Closes = closes.slice(-10);
    const last50Closes = closes.slice(-50);

    const vol10 = calculateStdDev(last10Closes);
    const vol50 = calculateStdDev(last50Closes);

    // Contraction: Recent volatility is lower than historical
    const volatilityContraction = vol10 < vol50;

    // Tightness: Range of last 10 days is narrow (< 8% of price)
    const last10Highs = highs.slice(-10);
    const last10Lows = lows.slice(-10);
    const range10Day = Math.max(...last10Highs) - Math.min(...last10Lows);
    const tightness = (range10Day / currentPrice) < 0.08;

    const vcpPattern = volatilityContraction && tightness;

    const criteria = {
        trendAligned,
        ema200Rising,
        sma50Above200,
        priceAboveLow,
        near52WeekHigh,
        goodVolumeMove,
        vcpPattern
    };

    const passed =
        trendAligned &&
        ema200Rising &&
        sma50Above200 &&
        priceAboveLow &&
        near52WeekHigh &&
        goodVolumeMove; // VCP is often a setup within the trend, not a hard requirement for "Minervini Trend Template" itself, but good to show.

    return { passed, criteria, low52Week, high52Week };
};
