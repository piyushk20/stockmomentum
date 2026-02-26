import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Line
} from 'recharts';
import { formatCurrency } from '../utils/format';

// Custom tooltip to format currency
const CustomTooltip = ({ active, payload, label, symbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-lg shadow-xl text-sm z-50">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {payload.map((entry, index) => (
                     <div key={index} className="flex justify-between items-center gap-4 mb-1">
                         <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                             <span className="text-slate-600 font-medium">
                                 {entry.name === 'price' ? 'Close' : entry.name === 'sma50' ? 'EMA 50' : 'EMA 200'}
                             </span>
                         </div>
                         <span className="font-bold font-mono" style={{ color: entry.name === 'price' ? '#0f172a' : entry.color }}>
                             {formatCurrency(symbol, entry.value)}
                         </span>
                     </div>
                ))}
            </div>
        );
    }
    return null;
};

const StockChart = ({ data, loading }) => {
    if (loading || !data || !data.chartData || data.chartData.length === 0) {
        return (
            <div className="card p-6 mb-8 text-center py-16 text-slate-400 bg-slate-50 flex items-center justify-center min-h-[300px]">
                <p className="font-medium animate-pulse">Loading Chart Data...</p>
            </div>
        );
    }

    const { symbol, chartData } = data;

    return (
        <div className="card p-6 mb-8 mt-8 border-t-4 border-t-blue-600">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-xl font-bold text-slate-800">Price History (6 Months)</h2>
                   <p className="text-sm text-slate-500 mt-1">Daily Closes & Moving Averages</p>
                </div>
            </div>

            <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            minTickGap={30}
                            dy={10}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip symbol={symbol} />} />
                        
                        <Line type="monotone" dataKey="sma200" stroke="#f43f5e" strokeWidth={1.5} dot={false} opacity={0.7} />
                        <Line type="monotone" dataKey="sma50" stroke="#eab308" strokeWidth={1.5} dot={false} opacity={0.8} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#2563eb" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex gap-4 mt-6 items-center justify-center text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-600" /> Price</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-yellow-500" /> EMA 50</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-rose-500" /> EMA 200</div>
            </div>
        </div>
    );
};

export default StockChart;
