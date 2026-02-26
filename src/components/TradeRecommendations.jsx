import React from 'react';
import { Target, ShieldAlert, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const TradeRecommendations = ({ data, loading }) => {
    if (loading) return null;
    if (!data) return null;

    const { tradeParams, signal, symbol } = data;

    if (signal === 'NEUTRAL') return null;

    const isBuy = signal === 'BUY';
    const bgClass = isBuy ? 'bg-emerald-50' : 'bg-rose-50';
    const textClass = isBuy ? 'text-emerald-700' : 'text-rose-700';

    return (
        <div className={`card p-6 mb-8 border-l-4 ${isBuy ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className={`w-5 h-5 ${textClass}`} />
                Trade Setup: {symbol.replace('.NS', '')}
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3 font-bold">Parameter</th>
                            <th className="px-4 py-3 font-bold">Value</th>
                            <th className="px-4 py-3 font-bold">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="bg-white hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-slate-400" />
                                Stop Loss
                            </td>
                            <td className="px-4 py-3 font-bold text-rose-600">{formatCurrency(symbol, tradeParams.stopLoss)}</td>
                            <td className="px-4 py-3 text-slate-500">Risk: {tradeParams.riskPerShare.toFixed(2)} pts</td>
                        </tr>
                        <tr className="bg-white hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                Target 1 (1:1.5)
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600">{formatCurrency(symbol, tradeParams.target1)}</td>
                            <td className="px-4 py-3 text-slate-500">Conservative</td>
                        </tr>
                        <tr className="bg-white hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                Target 2 (1:2.5)
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600">{formatCurrency(symbol, tradeParams.target2)}</td>
                            <td className="px-4 py-3 text-slate-500">Aggressive</td>
                        </tr>
                        <tr className={`${bgClass}`}>
                            <td className="px-4 py-3 font-bold text-slate-900">Position Size</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{tradeParams.positionSize} Qty</td>
                            <td className={`px-4 py-3 ${textClass} font-medium`}>Based on {formatCurrency(symbol, 1000)} Risk</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradeRecommendations;
