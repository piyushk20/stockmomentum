import React from 'react';
import { Search, RefreshCw, Clock, Save, Star } from 'lucide-react';
import { STOCK_LIST } from '../data/stocks';

const TIMEFRAMES = [5, 10, 20, 50, 100];

const Controls = ({
    selectedStock,
    onStockChange,
    timeframe,
    onTimeframeChange,
    onAnalyze,
    loading,
    autoRefresh,
    onToggleAutoRefresh,
    lastUpdated,
    onSave,
    onAddToWatchlist
}) => {
    return (
        <div className="card p-5 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between">
                {/* Stock Selection */}
                <div className="w-full lg:w-auto flex-1 max-w-md">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                        Select Asset
                    </label>
                    <div className="relative group">
                        <select
                            value={selectedStock}
                            onChange={(e) => onStockChange(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 pr-10 font-medium transition-all hover:border-slate-300"
                        >
                            {STOCK_LIST.map((group) => (
                                <optgroup key={group.label} label={group.label} className="font-bold text-slate-900">
                                    {group.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Timeframe Selection */}
                <div className="w-full lg:w-auto">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                        Timeframe (Days)
                    </label>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
                        {TIMEFRAMES.map((t) => (
                            <button
                                key={t}
                                onClick={() => onTimeframeChange(t)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${timeframe === t
                                    ? 'bg-white text-blue-600 shadow-sm scale-100'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full lg:w-auto flex items-center gap-3">
                    <button
                        onClick={onAnalyze}
                        disabled={loading}
                        className="btn-primary flex-1 lg:flex-none flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                <span>Analyze</span>
                            </>
                        )}
                    </button>

                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        {onSave && (
                            <button
                                onClick={onSave}
                                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                title="Save Analysis"
                            >
                                <Save className="w-5 h-5" />
                            </button>
                        )}

                        {onAddToWatchlist && (
                            <button
                                onClick={onAddToWatchlist}
                                className="p-2.5 text-slate-500 hover:text-amber-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                title="Add to Watchlist"
                            >
                                <Star className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <label className="flex items-center cursor-pointer bg-slate-100 px-3 py-2 rounded-xl hover:bg-slate-200/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={onToggleAutoRefresh}
                            className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ms-2 text-xs font-bold text-slate-600">Auto</span>
                    </label>
                </div>
            </div>

            {lastUpdated && (
                <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        Last Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Controls;
