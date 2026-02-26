import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import SignalDisplay from './components/SignalDisplay';
import TechnicalGrid from './components/TechnicalGrid';
import MarketDashboard from './components/MarketDashboard';
import TradeRecommendations from './components/TradeRecommendations';
import StockChart from './components/StockChart';
import { fetchStockData } from './services/api';
import {
  calculateMomentum,
  calculateRSI,
  calculateSMA,
  calculateMACD,
  calculateATR,
  calculatePivots,
  calculateEMAArray,
  resampleToWeekly,
  resampleToMonthly
} from './utils/calculations';
import { calculateTradeParams } from './utils/riskManagement';
import { calculateMinerviniSetup } from './utils/minervini';

import { saveAnalysis, addToWatchlist } from './services/firebase';
import { AlertCircle } from 'lucide-react';

function App() {
  const [selectedStock, setSelectedStock] = useState('^NSEI');
  const [timeframe, setTimeframe] = useState(20);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const analyzeStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data
      // We need enough history for 200 SMA + buffer
      const historyDays = 300;
      const stockData = await fetchStockData(selectedStock, historyDays);

      const { closes, highs, lows, timestamps } = stockData;

      if (!closes || closes.length < 200) {
        throw new Error('Insufficient historical data for this asset (need 200+ days).');
      }

      const currentPrice = closes[closes.length - 1];
      const prevPrice = closes[closes.length - 1 - timeframe];

      // Multi-timeframe Resampling 
      const weeklyCloses = resampleToWeekly(closes, timestamps);
      const monthlyCloses = resampleToMonthly(closes, timestamps);

      // Calculations
      const momentum = calculateMomentum(currentPrice, prevPrice);
      
      const rsi = calculateRSI(closes);
      const rsiWeekly = calculateRSI(weeklyCloses);
      const rsiMonthly = calculateRSI(monthlyCloses);

      const sma50 = calculateSMA(closes, 50);
      const sma200 = calculateSMA(closes, 200);
      const macd = calculateMACD(closes);
      const atr = calculateATR(highs, lows, closes);
      const pivots = calculatePivots(
        highs[highs.length - 1],
        lows[lows.length - 1],
        closes[closes.length - 1]
      );

      // EMA Calculation
      const ema9Array = calculateEMAArray(closes, 9);
      const ema20Array = calculateEMAArray(closes, 20);
      const ema50Array = calculateEMAArray(closes, 50);
      const ema200Array = calculateEMAArray(closes, 200);

      const ema9 = ema9Array[ema9Array.length - 1];
      const ema20 = ema20Array[ema20Array.length - 1];
      const ema50 = ema50Array[ema50Array.length - 1];
      const ema200 = ema200Array[ema200Array.length - 1];

      // Minervini Setup Check
      const minervini = calculateMinerviniSetup(
        closes, highs, lows, stockData.volumes,
        ema9, ema20, ema50, ema200, ema200Array
      );

      // Crossover Detection
      let crossoverType = 'None';
      let crossoverDate = null;

      // Iterate backwards to find the last crossover
      for (let i = ema9Array.length - 1; i > 0; i--) {
        const prev9 = ema9Array[i - 1];
        const prev20 = ema20Array[i - 1];
        const curr9 = ema9Array[i];
        const curr20 = ema20Array[i];

        if (prev9 <= prev20 && curr9 > curr20) {
          crossoverType = 'Bullish (9 > 20)';
          crossoverDate = new Date(timestamps[i] * 1000).toLocaleDateString();
          break;
        } else if (prev9 >= prev20 && curr9 < curr20) {
          crossoverType = 'Bearish (9 < 20)';
          crossoverDate = new Date(timestamps[i] * 1000).toLocaleDateString();
          break;
        }
      }

      // Signal Logic
      let signal = 'NEUTRAL';
      if (momentum > 0) signal = 'BUY';
      else if (momentum < 0) signal = 'SELL';

      // Risk Management
      const tradeParams = calculateTradeParams(signal, currentPrice, pivots, atr);

      // Chart Data Mapping (Last 120 days to keep chart clean)
      // Extract the end of the arrays
      const chartLength = Math.min(closes.length, 120);
      const startIdx = closes.length - chartLength;
      
      const chartData = [];
      for (let i = startIdx; i < closes.length; i++) {
         chartData.push({
             date: new Date(timestamps[i] * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
             price: closes[i],
             sma50: ema50Array[i], // Sending EMA50 instead to overlay on chart
             sma200: ema200Array[i] // Sending EMA200 instead to overlay on chart
         });
      }

      setData({
        symbol: selectedStock,
        currentPrice,
        momentum,
        signal,
        rsi,
        rsiWeekly,
        rsiMonthly,
        sma50,
        sma200,
        macd,
        pivots,
        atr,
        tradeParams,
        ema9,
        ema20,
        ema50,
        ema200,
        crossoverType,
        crossoverDate,
        minervini,
        chartData
      });

      setLastUpdated(new Date());

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze stock. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedStock, timeframe]);

  // Initial load
  useEffect(() => {
    analyzeStock();
  }, [analyzeStock]);

  // Auto-refresh interval
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        analyzeStock();
      }, 300000); // 5 minutes
    }
    return () => clearInterval(interval);
  }, [autoRefresh, analyzeStock]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Controls
          selectedStock={selectedStock}
          onStockChange={setSelectedStock}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onAnalyze={analyzeStock}
          loading={loading}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
          lastUpdated={lastUpdated}
          data={data}
          onSave={async () => {
            if (!data) return;
            try {
              await saveAnalysis(data);
              alert('Analysis saved successfully!');
            } catch (error) {
              console.error(error);
              alert('Failed to save analysis. Check console for details.');
            }
          }}
          onAddToWatchlist={async () => {
            try {
              await addToWatchlist(selectedStock);
              alert(`Added ${selectedStock} to watchlist!`);
            } catch (error) {
              console.error(error);
              alert('Failed to add to watchlist. Check console for details.');
            }
          }}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}





        <SignalDisplay data={data} loading={loading} />

        <StockChart data={data} loading={loading} />

        <MarketDashboard onStockSelect={setSelectedStock} />

        <TechnicalGrid data={data} loading={loading} />

        <TradeRecommendations data={data} loading={loading} />

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>DISCLAIMER: This application is for educational purposes only. Trading financial markets involves risk.</p>
          <p className="mt-1">Data provided by Yahoo Finance. Not strictly real-time.</p>
        </div>

      </main>
    </div>
  );
}

export default App;
