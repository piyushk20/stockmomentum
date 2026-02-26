/**
 * Calculates trade parameters based on signal and technical levels
 * @param {string} signal - 'BUY' | 'SELL' | 'NEUTRAL'
 * @param {number} currentPrice - Current market price
 * @param {Object} levels - Support/Resistance levels { s1, r1, s2, r2 }
 * @param {number} atr - Average True Range
 * @returns {Object} - { entry, target, stopLoss, riskReward }
 */
export const calculateTradeParams = (signal, currentPrice, levels, atr) => {
    if (signal === 'NEUTRAL') {
        return {
            entry: 0,
            target: 0,
            stopLoss: 0,
            riskReward: '0:0'
        };
    }

    let entry = currentPrice;
    let target = 0;
    let stopLoss = 0;

    if (signal === 'BUY') {
        // Target: Resistance 1
        target = levels.r1;
        // Stop Loss: Support 1 or Entry - 2*ATR
        // We'll use the tighter of the two to be safe, or as per requirements:
        // Req: Stop Loss = Support 1
        // Req: Alternative = Entry - 2*ATR
        // Let's use S1 but ensure it's below entry. If S1 > Entry (weird but possible if price dropped fast), use ATR.
        stopLoss = levels.s1 < entry ? levels.s1 : entry - (2 * atr);

        // Ensure Target is above Entry
        if (target <= entry) {
            target = entry + (2 * atr); // Fallback target
        }
    } else if (signal === 'SELL') {
        // Target: Support 1
        target = levels.s1;
        // Stop Loss: Resistance 1
        stopLoss = levels.r1 > entry ? levels.r1 : entry + (2 * atr);

        // Ensure Target is below Entry
        if (target >= entry) {
            target = entry - (2 * atr); // Fallback target
        }
    }

    const riskPerShare = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    const ratio = riskPerShare === 0 ? 0 : (reward / riskPerShare).toFixed(2);

    // Calculate Targets based on Risk:Reward
    // Target 1: 1:1.5
    // Target 2: 1:2.5
    let target1 = 0;
    let target2 = 0;

    if (signal === 'BUY') {
        target1 = entry + (riskPerShare * 1.5);
        target2 = entry + (riskPerShare * 2.5);
    } else if (signal === 'SELL') {
        target1 = entry - (riskPerShare * 1.5);
        target2 = entry - (riskPerShare * 2.5);
    }

    // Position Sizing (Risk 1000 INR)
    const riskAmount = 1000;
    const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;

    return {
        entry,
        target, // Original target (S1/R1)
        target1,
        target2,
        stopLoss,
        riskReward: `1:${ratio}`,
        riskPerShare,
        positionSize
    };
};
