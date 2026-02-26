import { fetchStockData } from '../services/api';
import { calculateEMAArray } from './calculations';

export const scanMarket = async (symbols, onProgress) => {
    const results = {
        momentum: [],
        bullishCross: [],
        deathCross: []
    };

    let completed = 0;

    // Process in batches to avoid overwhelming the browser/network
    const batchSize = 5;

    for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);

        const promises = batch.map(async (symbol) => {
            try {
                // Fetch less data for scanning to be faster (e.g. 250 days)
                const data = await fetchStockData(symbol, 300);
                const { closes, timestamps } = data;

                if (!closes || closes.length < 200) return;

                const currentPrice = closes[closes.length - 1];
                const prevPrice = closes[closes.length - 21]; // Approx 1 month ago for momentum

                // 1. Momentum (1 Month Return)
                const momentum = ((currentPrice - prevPrice) / prevPrice) * 100;

                results.momentum.push({
                    symbol,
                    price: currentPrice,
                    momentum,
                    type: symbol.startsWith('^') ? 'Index' : 'Stock'
                });

                // 2. EMA 9/20 Bullish Crossover (Today)
                const ema9Array = calculateEMAArray(closes, 9);
                const ema20Array = calculateEMAArray(closes, 20);

                const curr9 = ema9Array[ema9Array.length - 1];
                const curr20 = ema20Array[ema20Array.length - 1];
                const prev9 = ema9Array[ema9Array.length - 2];
                const prev20 = ema20Array[ema20Array.length - 2];

                if (prev9 <= prev20 && curr9 > curr20) {
                    results.bullishCross.push({
                        symbol,
                        price: currentPrice,
                        date: new Date(timestamps[timestamps.length - 1] * 1000).toLocaleDateString()
                    });
                }

                // 3. Death Cross (50 SMA < 200 SMA) - Using SMA as per standard definition, or EMA if user prefers?
                // User asked for "ema 50 crossing below ema 200"
                const ema50Array = calculateEMAArray(closes, 50);
                const ema200Array = calculateEMAArray(closes, 200);

                const curr50 = ema50Array[ema50Array.length - 1];
                const curr200 = ema200Array[ema200Array.length - 1];
                const prev50 = ema50Array[ema50Array.length - 2];
                const prev200 = ema200Array[ema200Array.length - 2];

                if (prev50 >= prev200 && curr50 < curr200) {
                    results.deathCross.push({
                        symbol,
                        price: currentPrice,
                        date: new Date(timestamps[timestamps.length - 1] * 1000).toLocaleDateString()
                    });
                }

            } catch (e) {
                console.warn(`Failed to scan ${symbol}`, e);
            }
        });

        await Promise.all(promises);
        completed += batch.length;
        if (onProgress) onProgress(Math.round((completed / symbols.length) * 100));
    }

    // Sort Momentum
    results.momentum.sort((a, b) => b.momentum - a.momentum);

    return results;
};
