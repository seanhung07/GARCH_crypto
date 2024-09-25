export async function fetchSymbols() {
    try {
      const response = await fetch('https://www.okx.com/api/v5/public/instruments?instType=SWAP');
      const data = await response.json();
      
      // Extract symbols (instrument IDs)
      const symbols = data.data.map(instrument => instrument.instId);
      return symbols;
    } catch (error) {
      console.error('Error fetching symbols:', error);
    }
  }
  

export async function fetchOHLCV(symbol) {
    try {
      const response = await fetch(`https://www.okx.com/api/v5/market/candles?instId=${symbol}&bar=30m&limit=1000`);
      const data = await response.json();
  
      if (!data || !data.data || data.data.length === 0) {
        console.error(`No data available for symbol ${symbol}`);
        return [];
      }
  
      // Extract OHLC data from the response
      const ohlcData = data.data.map(candle => ({
        time: candle[0],    // Timestamp
        open: parseFloat(candle[1]), // Open price
        high: parseFloat(candle[2]), // High price
        low: parseFloat(candle[3]),  // Low price
        close: parseFloat(candle[4]), // Close price
      }));
  
      return ohlcData;
    } catch (error) {
      console.error(`Error fetching OHLCV data for symbol ${symbol}:`, error);
      return []; 
    }
}

  
export function calculateLogReturns(prices) {
    if (!prices || prices.length < 2) {
      return []; 
    }
  
    const logReturns = [];
    for (let i = 1; i < prices.length; i++) {
      const logReturn = Math.log(prices[i] / prices[i - 1]);
      logReturns.push(logReturn);
    }
    return logReturns;
  }
  
// GARCH(1,1) model implementation
// GARCH(1,1) model implementation
export function garch(logReturns, omega = 0.00001, alpha = 0.1, beta = 0.85) {
    const variances = [];
    const epsilonSquared = [];

    // Initialize first variance with a starting value
    let variance = omega / (1 - alpha - beta); // Initial unconditional variance
    variances.push(variance);

    // Check if logReturns is valid and has enough data points
    if (!logReturns || logReturns.length < 2) {
        return {
            predictedVolatility: 0,
            volatilitySeries: [], // Return an empty array to avoid errors
        };
    }

    // Calculate epsilon squared (logReturns squared)
    logReturns.forEach((r, i) => {
        if (i > 0) {
            epsilonSquared.push(logReturns[i - 1] ** 2);
        }
    });

    // Apply GARCH(1,1) to calculate variances
    for (let i = 1; i < logReturns.length; i++) {
        variance = omega + alpha * epsilonSquared[i - 1] + beta * variances[i - 1];
        variances.push(variance);
    }

    // Calculate volatility (square root of variance) for the series
    const volatilitySeries = variances.map(variance => Math.sqrt(variance));

    // The last volatility is the predicted volatility for the next period
    const predictedVolatility = volatilitySeries[volatilitySeries.length - 1];

    return {
        predictedVolatility,
        volatilitySeries,
    };
}

