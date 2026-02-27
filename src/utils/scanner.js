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

                // 2. EMA 9/20 Bullish Crossover (Recent 5 days)
                const ema9Array = calculateEMAArray(closes, 9);
                const ema20Array = calculateEMAArray(closes, 20);

                let bullishDate = null;
                for (let i = ema9Array.length - 1; i >= Math.max(1, ema9Array.length - 5); i--) {
                    const curr9 = ema9Array[i];
                    const curr20 = ema20Array[i];
                    const prev9 = ema9Array[i - 1];
                    const prev20 = ema20Array[i - 1];

                    if (prev9 <= prev20 && curr9 > curr20) {
                        bullishDate = new Date(timestamps[i] * 1000).toLocaleDateString();
                        break;
                    }
                }

                if (bullishDate) {
                    results.bullishCross.push({
                        symbol,
                        price: currentPrice,
                        date: bullishDate
                    });
                }

                // 3. Death Cross (50 EMA < 200 EMA) - Recent 5 days
                const ema50Array = calculateEMAArray(closes, 50);
                const ema200Array = calculateEMAArray(closes, 200);

                let deathDate = null;
                for (let i = ema50Array.length - 1; i >= Math.max(1, ema50Array.length - 5); i--) {
                    const curr50 = ema50Array[i];
                    const curr200 = ema200Array[i];
                    const prev50 = ema50Array[i - 1];
                    const prev200 = ema200Array[i - 1];

                    if (prev50 >= prev200 && curr50 < curr200) {
                        deathDate = new Date(timestamps[i] * 1000).toLocaleDateString();
                        break;
                    }
                }

                if (deathDate) {
                    results.deathCross.push({
                        symbol,
                        price: currentPrice,
                        date: deathDate
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
