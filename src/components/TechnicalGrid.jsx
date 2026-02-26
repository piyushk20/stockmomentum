import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const IndicatorCard = ({ title, value, status, subValue }) => {
    let badgeColor = 'bg-slate-100 text-slate-600';
    let Icon = Minus;

    if (status === 'Bullish' || status === 'Overbought' || status === 'Golden Cross' || status === 'PASS') {
        badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        Icon = ArrowUp;
    } else if (status === 'Bearish' || status === 'Oversold' || status === 'Death Cross' || status === 'FAIL') {
        badgeColor = 'bg-rose-50 text-rose-700 border border-rose-100';
        Icon = ArrowDown;
    }

    return (
        <div className="card p-5 flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
                    <div className={`badge ${badgeColor} flex items-center gap-1`}>
                        {status === 'Bullish' || status === 'Bearish' ? <Icon className="w-3 h-3" /> : null}
                        {status}
                    </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{value}</div>
            </div>
            {subValue && <div className="text-xs font-medium text-slate-400 mt-3 pt-3 border-t border-slate-50">{subValue}</div>}
        </div>
    );
};

const TechnicalGrid = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const { rsi, rsiWeekly, rsiMonthly, macd, sma50, sma200, pivots, ema9, ema20, ema200, crossoverType, crossoverDate, minervini, symbol } = data;

    // Formatting helpers
    const formatRSILabel = (val) => {
        if (!val) return '--';
        if (val >= 70) return <span className="text-rose-600 font-bold">{val.toFixed(1)}</span>;
        if (val <= 30) return <span className="text-emerald-600 font-bold">{val.toFixed(1)}</span>;
        return <span className="text-slate-700">{val.toFixed(1)}</span>;
    };

    // RSI Status
    let rsiStatus = 'Neutral';
    if (rsi > 70) rsiStatus = 'Overbought';
    else if (rsi < 30) rsiStatus = 'Oversold';

    // MACD Status
    const macdStatus = macd.macd > macd.signal ? 'Bullish' : 'Bearish';

    // SMA Status
    const smaStatus = sma50 > sma200 ? 'Golden Cross' : sma50 < sma200 ? 'Death Cross' : 'Neutral';

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                Technical Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IndicatorCard
                    title="RSI (Daily, Weekly, Monthly)"
                    value={`D: ${rsi.toFixed(1)}`}
                    status={rsiStatus}
                    subValue={
                        <div className="flex justify-between w-full mt-1 border-t border-slate-100 pt-1.5">
                            <span className="text-[11px] font-medium text-slate-500">W: {formatRSILabel(rsiWeekly)}</span>
                            <span className="text-[11px] font-medium text-slate-500">M: {formatRSILabel(rsiMonthly)}</span>
                        </div>
                    }
                />

                <IndicatorCard
                    title="MACD (12, 26, 9)"
                    value={macd.macd.toFixed(2)}
                    status={macdStatus}
                    subValue={`Signal: ${macd.signal.toFixed(2)}`}
                />

                <IndicatorCard
                    title="Moving Averages"
                    value={`50: ${formatCurrency(symbol, sma50)}`}
                    status={smaStatus}
                    subValue={`200: ${formatCurrency(symbol, sma200)}`}
                />

                <IndicatorCard
                    title="Exponential MA"
                    value={`20: ${formatCurrency(symbol, ema20)}`}
                    status={crossoverType.includes('Bullish') ? 'Bullish' : crossoverType.includes('Bearish') ? 'Bearish' : 'Neutral'}
                    subValue={
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between">
                                <span>200: ${formatCurrency(symbol, ema200)}</span>
                                <span>9: ${formatCurrency(symbol, ema9)}</span>
                            </div>
                            {crossoverDate && (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${crossoverType.includes('Bullish') ? 'bg-emerald-50 text-emerald-700' : crossoverType.includes('Bearish') ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-500'}`}>
                                    {crossoverType.includes('Bullish') ? 'Bullish' : 'Bearish'} Cross: {crossoverDate}
                                </span>
                            )}
                        </div>
                    }
                />

                <div className="card p-5 flex flex-col justify-between h-full">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Support & Resistance</div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded text-xs">R1</span>
                            <span className="font-mono font-medium text-slate-700">{formatCurrency(symbol, pivots.r1)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">Pivot</span>
                            <span className="font-mono font-medium text-slate-700">{formatCurrency(symbol, pivots.pivot)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">S1</span>
                            <span className="font-mono font-medium text-slate-700">{formatCurrency(symbol, pivots.s1)}</span>
                        </div>
                    </div>
                </div>

                <IndicatorCard
                    title="Minervini Template"
                    value={minervini?.passed ? "PASS" : "FAIL"}
                    status={minervini?.passed ? "PASS" : "FAIL"}
                    subValue={
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                                <span>Trend (9&gt;20&gt;50&gt;200)</span>
                                <span className={minervini?.criteria.trendAligned ? "text-emerald-600 font-bold" : "text-rose-400"}>{minervini?.criteria.trendAligned ? "✓" : "✗"}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                                <span>200 EMA Rising</span>
                                <span className={minervini?.criteria.ema200Rising ? "text-emerald-600 font-bold" : "text-rose-400"}>{minervini?.criteria.ema200Rising ? "✓" : "✗"}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                                <span>Price &gt; 2x Low</span>
                                <span className={minervini?.criteria.priceAboveLow ? "text-emerald-600 font-bold" : "text-rose-400"}>{minervini?.criteria.priceAboveLow ? "✓" : "✗"}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                                <span>Near 52W High</span>
                                <span className={minervini?.criteria.near52WeekHigh ? "text-emerald-600 font-bold" : "text-rose-400"}>{minervini?.criteria.near52WeekHigh ? "✓" : "✗"}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 border-t border-slate-100 pt-2">
                                <span>VCP (Tight & Contracted)</span>
                                <span className={minervini?.criteria.vcpPattern ? "text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded" : "text-slate-300"}>{minervini?.criteria.vcpPattern ? "YES" : "-"}</span>
                            </div>
                        </div>
                    }
                />

            </div>
        </div>
    );
};

export default TechnicalGrid;
