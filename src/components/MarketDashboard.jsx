import React, { useState } from 'react';
import { scanMarket } from '../utils/scanner';
import { STOCK_LIST } from '../data/stocks';
import { formatCurrency } from '../utils/format';

const MarketDashboard = ({ onStockSelect }) => {
    const [activeTab, setActiveTab] = useState('momentum');
    const [results, setResults] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleScan = async () => {
        setScanning(true);
        setProgress(0);

        // Flatten stock list to get symbols
        // We want Indices, Sectoral Indices, and Large Cap stocks
        const indicesGroup = STOCK_LIST.find(g => g.label === 'Indices');
        const sectoralIndicesGroup = STOCK_LIST.find(g => g.label === 'Sectoral Indices');
        const nse100Group = STOCK_LIST.find(g => g.label === 'NSE 100 (Large Cap)');

        const indices = indicesGroup ? indicesGroup.options : [];
        const sectoralIndices = sectoralIndicesGroup ? sectoralIndicesGroup.options : [];
        const nse100 = nse100Group ? nse100Group.options : [];

        // Combine them (using .value for the symbol)
        const symbolsToScan = [
            ...indices.map(s => s.value),
            ...sectoralIndices.map(s => s.value),
            ...nse100.map(s => s.value)
        ];

        try {
            const data = await scanMarket(symbolsToScan, (p) => setProgress(p));
            setResults(data);
        } catch (error) {
            console.error("Scan failed", error);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="card p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Market Dashboard</h2>
                {!scanning && !results && (
                    <button
                        onClick={handleScan}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Scan Market
                    </button>
                )}
            </div>

            {scanning && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Scanning Market...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            <div className="flex border-b border-slate-100 mb-6 gap-2">
                <button
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'momentum' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('momentum')}
                >
                    Top Momentum
                </button>
                <button
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'bullish' ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('bullish')}
                >
                    Bullish Cross (9 &gt; 20)
                </button>
                <button
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'death' ? 'text-rose-600 border-rose-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('death')}
                >
                    Death Cross (50 &lt; 200)
                </button>
            </div>

            <div className="min-h-[200px]">
                {!results && !scanning && (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="font-medium">Click "Scan Market" to analyze trends across Nifty 50 & Indices.</p>
                    </div>
                )}

                {results && activeTab === 'momentum' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Top 7 Stocks</h3>
                            <div className="space-y-3">
                                {results.momentum.filter(i => i.type === 'Stock').slice(0, 7).map((item, idx) => (
                                    <div key={item.symbol} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-blue-100 cursor-pointer transition-all group" onClick={() => onStockSelect(item.symbol)}>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${idx < 3 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</span>
                                            <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.symbol.replace('.NS', '')}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-emerald-600 font-bold">+{item.momentum.toFixed(2)}%</div>
                                            <div className="text-xs text-slate-400">{formatCurrency(item.symbol, item.price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Top 3 Indices</h3>
                            <div className="space-y-3">
                                {results.momentum.filter(i => i.type === 'Index').slice(0, 3).map((item, idx) => (
                                    <div key={item.symbol} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-blue-100 cursor-pointer transition-all group" onClick={() => onStockSelect(item.symbol)}>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700">{idx + 1}</span>
                                            <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.symbol}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-emerald-600 font-bold">+{item.momentum.toFixed(2)}%</div>
                                            <div className="text-xs text-slate-400">{formatCurrency(item.symbol, item.price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {results && activeTab === 'bullish' && (
                    <div>
                        {results.bullishCross.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">No stocks found with Bullish Crossover today.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {results.bullishCross.map(item => (
                                    <div key={item.symbol} className="p-5 border border-emerald-100 bg-emerald-50/50 rounded-2xl cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group" onClick={() => onStockSelect(item.symbol)}>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.symbol.replace('.NS', '')}</span>
                                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] rounded-full font-bold tracking-wide">BUY</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-1">Crossed on {item.date}</div>
                                        <div className="text-xl font-black text-slate-900">{formatCurrency(item.symbol, item.price)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {results && activeTab === 'death' && (
                    <div>
                        {results.deathCross.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">No stocks found with Death Cross today.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {results.deathCross.map(item => (
                                    <div key={item.symbol} className="p-5 border border-rose-100 bg-rose-50/50 rounded-2xl cursor-pointer hover:shadow-md hover:border-rose-200 transition-all group" onClick={() => onStockSelect(item.symbol)}>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-bold text-slate-800 group-hover:text-rose-700 transition-colors">{item.symbol.replace('.NS', '')}</span>
                                            <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[10px] rounded-full font-bold tracking-wide">SELL</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-1">Crossed on {item.date}</div>
                                        <div className="text-xl font-black text-slate-900">{formatCurrency(item.symbol, item.price)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketDashboard;
