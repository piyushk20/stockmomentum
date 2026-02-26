# NSE Momentum Strategy Platform

A React-based web application for analyzing NSE stocks using Time Series Momentum (TSMOM) and technical analysis.

## Project Stages

We are building this application in 5 distinct stages:

### Stage 1: Foundation & Basic Analysis (Current)
- [x] Basic React setup with Vite.
- [x] Stock data fetching (Yahoo Finance via proxy/API).
- [x] Core TSMOM calculation (Momentum).
- [x] Basic-   **Technical Indicators**: RSI, MACD, SMA (50/200), EMA (9/20/50/200), ATR, Pivot Points.
-   **Advanced Setups**:
    -   **Minervini Trend Template**: Checks for trend alignment, 200 EMA slope, and price strength.
    -   **VCP Pattern**: Heuristic detection of Volatility Contraction and Price Tightness.
-   **Market Scanner Dashboard**:
    -   **Top Momentum**: Scans Nifty 50 & Indices for top performers.
    -   **Bullish Crossover**: Detects EMA 9 > 20 crossovers.
    -   **Death Cross**: Detects EMA 50 < 200 crossovers.
-   **Risk Management**: Automated position sizing, stop-loss, and target calculations.
-   **Watchlist**: Save favorite stocks for quick access (Firebase).ign, Tailwind CSS styling.

### Stage 2: Enhanced Technicals & Visualization (In Progress)
- [ ] **EMA 9 & 20**: Short-term trend indicators.
- [ ] **Crossover Detection**: Identify Bullish/Bearish crossovers with dates.
- [ ] **Interactive Charts**: Visualizing price and indicators (using Recharts or similar).
- [ ] **Volume Analysis**: Adding volume-based indicators.

### Stage 3: User Personalization
- [ ] **Watchlist**: Save favorite stocks (Firebase integration).
- [ ] **Saved Analysis**: Store past analysis results.
- [ ] **Custom Settings**: Configurable timeframes and indicator parameters.
- [ ] **Authentication**: User login/signup (Firebase Auth).

### Stage 4: Advanced Strategy & Backtesting
- [ ] **Backtesting Engine**: Simulate strategy performance over historical data.
- [ ] **Strategy Optimization**: Find optimal parameters for specific stocks.
- [ ] **Multi-Timeframe Analysis**: Analyze weekly/monthly trends alongside daily.
- [ ] **Market Breadth**: Analyze overall market health (Nifty 50/500 breadth).

### Stage 5: Production Readiness & Deployment
- [ ] **Performance Optimization**: Code splitting, caching, fast load times.
- [ ] **Comprehensive Error Handling**: Graceful degradation and user feedback.
- [ ] **SEO & Accessibility**: Meta tags, ARIA labels, semantic HTML.
- [ ] **Deployment**: Hosting on Vercel/Netlify with CI/CD.
- [ ] **PWA Support**: Installable as a desktop/mobile app.

## Getting Started

1.  Clone the repository.
2.  Run `npm install`.
3.  Run `npm run dev` to start the local server.
