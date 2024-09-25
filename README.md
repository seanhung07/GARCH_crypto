# OKX Futures GARCH Volatility Prediction

This project is a web-based tool designed to fetch financial data from the OKX Futures exchange and predict volatility using the GARCH(1,1) model. It allows users to interactively select futures symbols, view historical price data, and predict volatility trends over time using a graphical interface. The project primarily focuses on volatility analysis for various futures contracts using real-time financial data.

## Key Features

### 1. **Symbol Fetching**
   The application fetches a list of all available futures symbols (instruments) from the OKX exchange. This allows users to select from a wide range of trading pairs for analysis.

### 2. **Fetching OHLCV Data**
   The app retrieves historical price data, including Open, High, Low, Close, and Volume (OHLCV), for selected futures symbols. This data is essential for analyzing price movements and calculating volatility.

### 3. **Log Returns Calculation**
   For each selected symbol, the application calculates log returns based on the close prices. Log returns are a measure of the rate of return of a security and are used to assess its price changes over time.

### 4. **GARCH(1,1) Volatility Model**
   The app implements the GARCH(1,1) model, which is widely used in finance to predict volatility. The model takes log returns as input and generates a predicted volatility series, which helps forecast future price fluctuations. The last value of the volatility series is used as the predicted volatility for the next period.

### 5. **Interactive Charts**
   Users can visualize the volatility trends through dynamic line charts. The charts display the variance and volatility series over time, allowing users to assess how the volatility of the selected symbol changes over different intervals.

### 6. **K-line (Candlestick) Chart Popups**
   When users hover over a symbol in the data table, a candlestick chart (K-line) pops up, displaying the price movements (open, high, low, and close) for that symbol. This offers a quick visual representation of historical price trends alongside the volatility data.

### 7. **Data Table with Sorting**
   The app features an interactive data table where users can see the current volatility and predicted volatility for each symbol. The table allows sorting by symbol name, current volatility, or predicted volatility, making it easier to find and compare specific futures contracts.

### 8. **Progressive Data Loading**
   To avoid overloading the system with too many requests, the app implements a throttling mechanism to progressively fetch and calculate volatility data. A progress bar indicates how much data has been processed, along with an estimate of the time remaining to complete the calculations.

## How It Works

1. **Symbol Selection**: Users select a symbol from the dropdown, which fetches and displays the historical price data for that symbol.
2. **Volatility Calculation**: The system calculates log returns from the close prices of the selected symbol. The GARCH(1,1) model then uses these log returns to generate a volatility series.
3. **Chart Visualization**: Users can view the volatility series on a line chart, and if they hover over a symbol in the data table, a candlestick chart will appear for quick price reference.
4. **Predicted Volatility**: The last value in the volatility series is displayed as the predicted volatility for the next period, helping users anticipate future market behavior.

## Technologies Used

- **React**: The app’s frontend is built using React for a dynamic and responsive user interface.
- **Chart.js**: For rendering financial charts, including line charts for volatility trends and K-line candlestick charts.
- **MUI (Material UI)**: Provides a sleek and user-friendly design for tables, popovers, and progress indicators.
- **OKX API**: Fetches real-time market data, including symbols and OHLCV price data, directly from the OKX Futures exchange.

## Setup & Usage

1. **Clone the repository** and install dependencies using `npm install`.
2. **Start the app** using `npm start`, which will run the app on `localhost:3000`.
3. **Select a futures symbol** from the dropdown to fetch its historical data and calculate its volatility using the GARCH(1,1) model.
4. **View volatility trends** on the interactive charts and hover over symbols in the table for candlestick chart popups.

## Future Improvements

- **Additional Volatility Models**: Implementing alternative models for volatility prediction such as EWMA (Exponentially Weighted Moving Average) or ARCH.
- **More Data Sources**: Integrating other financial data sources or exchanges for broader market coverage.
- **Advanced Sorting & Filtering**: Adding more advanced options for sorting and filtering the data table based on various market parameters.

## License

This project is open-source and available under the MIT License.
