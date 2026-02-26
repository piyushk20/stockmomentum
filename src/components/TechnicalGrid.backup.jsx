import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const IndicatorCard = ({ title, value, status, subValue }) => {
    let statusColor = 'text-gray-500';
    let Icon = Minus;

    if (status === 'Bullish' || status === 'Overbought') {
        statusColor = 'text-green-600';
        Icon = ArrowUp;
    } else if (status === 'Bearish' || status === 'Oversold') {
        statusColor = 'text-red-600';
        Icon = ArrowDown;
    }

    return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</div>
            <div className="flex items-end justify-between mb-1">
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <Icon className={`w-5 h-5 ${statusColor}`} />
            </div>
            <div className={`text-xs font-medium ${statusColor}`}>{status}</div>
            {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
        </div>
    );
};

const TechnicalGrid = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const { rsi, macd, sma50, sma200, pivots, currentPrice, ema9, ema20, ema200, crossoverType, crossoverDate } = data;

    // RSI Status
    let rsiStatus = 'Neutral';
    if (rsi > 70) rsiStatus = 'Overbought';
    else if (rsi < 30) rsiStatus = 'Oversold';

    // MACD Status
    const macdStatus = macd.macd > macd.signal ? 'Bullish' : 'Bearish';

    // SMA Status
    const smaStatus = sma50 > sma200 ? 'Golden Cross' : sma50 < sma200 ? 'Death Cross' : 'Neutral';
    const priceVsSma = currentPrice > sma50 ? 'Above 50-SMA' : 'Below 50-SMA';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <IndicatorCard
                    title="RSI (14)"
                    value={rsi.toFixed(2)}
                    status={rsiStatus}
                />

                <IndicatorCard
                    title="MACD (12, 26, 9)"
                    value={macd.macd.toFixed(2)}
                    status={macdStatus}
                    subValue={`Signal: ${macd.signal.toFixed(2)}`}
                />

                <IndicatorCard
                    title="Moving Averages"
                    value={`50: ₹${sma50?.toFixed(0)}`}
                    status={smaStatus}
                    subValue={`200: ₹${sma200?.toFixed(0)}`}
                />

                <IndicatorCard
                    title="Exponential MA"
                    value={`20: ₹${ema20?.toFixed(0)}`}
                    status={crossoverType.includes('Bullish') ? 'Bullish' : crossoverType.includes('Bearish') ? 'Bearish' : 'Neutral'}
                    subValue={`200: ₹${ema200?.toFixed(0)} | 9: ₹${ema9?.toFixed(0)}`}
                />

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Support & Resistance</div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-red-500 font-medium">R1</span>
                            <span className="font-mono">₹{pivots.r1.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-blue-500 font-medium">Pivot</span>
                            <span className="font-mono">₹{pivots.pivot.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-green-500 font-medium">S1</span>
                            <span className="font-mono">₹{pivots.s1.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TechnicalGrid;
