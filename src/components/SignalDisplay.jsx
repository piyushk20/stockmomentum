import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const SignalDisplay = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="card p-8 mb-8 animate-pulse flex flex-col items-center justify-center h-48">
                <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
                <div className="h-10 bg-slate-200 rounded w-48"></div>
            </div>
        );
    }

    if (!data) return null;

    const { signal, currentPrice, momentum, symbol } = data;

    let bgGradient = 'bg-gradient-to-br from-slate-100 to-slate-200';
    let textColor = 'text-slate-600';
    let Icon = Minus;
    let subText = 'Neutral Momentum';
    let shadowColor = 'shadow-slate-500/10';

    if (signal === 'BUY') {
        bgGradient = 'bg-gradient-to-br from-emerald-500 to-teal-600';
        textColor = 'text-white';
        Icon = TrendingUp;
        subText = 'Strong Bullish Momentum';
        shadowColor = 'shadow-emerald-500/30';
    } else if (signal === 'SELL') {
        bgGradient = 'bg-gradient-to-br from-rose-500 to-pink-600';
        textColor = 'text-white';
        Icon = TrendingDown;
        subText = 'Bearish Momentum Detected';
        shadowColor = 'shadow-rose-500/30';
    }

    return (
        <div className={`rounded-3xl p-8 mb-8 shadow-xl ${shadowColor} ${bgGradient} text-center transform transition-all hover:scale-[1.01]`}>
            <div className="flex flex-col items-center justify-center">
                <div className={`p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-inner`}>
                    <Icon className={`w-12 h-12 ${textColor}`} />
                </div>

                <h2 className={`text-sm font-bold uppercase tracking-[0.2em] mb-2 ${textColor} opacity-90`}>
                    {symbol.replace('.NS', '')} Signal
                </h2>

                <div className={`text-5xl md:text-6xl font-black mb-2 tracking-tight ${textColor}`}>
                    {signal}
                </div>

                <p className={`text-lg font-medium ${textColor} opacity-90 mb-6`}>
                    {subText}
                </p>

                <div className="flex items-center gap-8 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10">
                    <div className="text-center">
                        <div className={`text-xs font-bold uppercase tracking-wider ${textColor} opacity-70 mb-1`}>Price</div>
                        <div className={`text-2xl font-bold ${textColor}`}>{formatCurrency(symbol, currentPrice)}</div>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div className="text-center">
                        <div className={`text-xs font-bold uppercase tracking-wider ${textColor} opacity-70 mb-1`}>Momentum</div>
                        <div className={`text-2xl font-bold ${textColor}`}>
                            {momentum > 0 ? '+' : ''}{momentum.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignalDisplay;
