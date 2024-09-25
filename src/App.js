import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  fetchSymbols,
  fetchOHLCV,
  calculateLogReturns,
  garch,
} from "./ccxt-browser";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  LinearProgress,
  Container,
} from "@mui/material";
import "chartjs-adapter-date-fns";

Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [ohlcData, setOhlcData] = useState([]);
  const [closePrices, setClosePrices] = useState([]);
  const [predictedVolatility, setPredictedVolatility] = useState(null);
  const [volatilitySeries, setvolatilitySeries] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [volatilityData, setVolatilityData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "symbol",
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllSymbols = async () => {
      const allSymbols = await fetchSymbols();
      setSymbols(
        allSymbols.map((symbol) => ({ label: symbol, value: symbol }))
      );
      fetchVolatilityData(allSymbols);
    };

    fetchAllSymbols();
  }, []);

  const fetchVolatilityData = async (allSymbols) => {
    const symbolVolatilityData = [];
    const startTime = Date.now();

    for (let i = 0; i < allSymbols.length; i++) {
      const symbol = allSymbols[i];
      const prices = await fetchOHLCV(symbol);
      if (prices.length < 2) continue; // Skip if not enough data
      const closePrices = prices.map((candle) => candle.close);
      const logReturns = calculateLogReturns(closePrices);
      const currentVolatility = Math.sqrt(
        logReturns.reduce((acc, r) => acc + r * r, 0) / logReturns.length
      );
      const { predictedVolatility } = garch(logReturns); // Run GARCH(1,1)

      symbolVolatilityData.push({
        symbol,
        currentVolatility,
        predictedVolatility,
        ohlcData: prices, // Store OHLC data for the K-line chart
      });

      setVolatilityData([...symbolVolatilityData]);
      const progressPercent = ((i + 1) / allSymbols.length) * 100;
      setProgress(progressPercent);

      const elapsedTime = Date.now() - startTime;
      const averageTimePerSymbol = elapsedTime / (i + 1);
      const remainingTime =
        averageTimePerSymbol * (allSymbols.length - (i + 1));
      setEstimatedTime(remainingTime / 1000);

      await delay(1000);
    }

    setLoading(false);
  };

  // const handleSymbolChange = async (selectedOption) => {
  //   setSelectedSymbol(selectedOption);

  //   const prices = await fetchOHLCV(selectedOption.value);
  //   setOhlcData(prices); // Store OHLC data for K-line chart
  // };
  const handleSymbolChange = async (selectedOption) => {
    setSelectedSymbol(selectedOption);

    const prices = await fetchOHLCV(selectedOption.value);
    setOhlcData(prices); // Store OHLC data for K-line chart
    setClosePrices(prices.map((candle) => candle.close));
    const now = new Date();
    const labels = prices.map(
      (_, index) =>
        new Date(now.getTime() - (prices.length - index) * 15 * 60 * 1000)
    );
    setTimeLabels(labels);

    // Calculate log returns
    const logReturns = calculateLogReturns(
      prices.map((candle) => candle.close)
    );

    // Run GARCH(1,1) model
    const { predictedVolatility, volatilitySeries } = garch(logReturns);
  
    setPredictedVolatility(predictedVolatility);
    setvolatilitySeries(volatilitySeries);
  };


  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...volatilityData].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setVolatilityData(sortedData);
  };

  const sampleData = (data, factor) => {
    const sampled = [];
    for (let i = 0; i < data.length; i += factor) {
      sampled.push(data[i]);
    }
    return sampled;
  };

  return (
    <Container>
      <div className="App">
        <h1>OKX Futures GARCH Volatility Prediction</h1>
        <Select
          options={symbols}
          onChange={handleSymbolChange}
          placeholder="Select a futures symbol..."
          isDisabled={symbols.length === 0}
        />
        {loading && (
          <div>
            <LinearProgress variant="determinate" value={progress} />
            <p>
              Loading data... {progress.toFixed(2)}% complete. Estimated time
              remaining: {estimatedTime.toFixed(2)} seconds
            </p>
          </div>
        )}
        {selectedSymbol && (
          <div>
            <h2>Selected Symbol: {selectedSymbol.label}</h2>
            {predictedVolatility && (
              <h3>
                Predicted Volatility for Next 15 Minutes:{" "}
                {predictedVolatility.toFixed(5)}
              </h3>
            )}
            {volatilitySeries.length > 0 && (
              <Line
                data={{
                  labels: timeLabels,
                  datasets: [
                    {
                      label: "GARCH Variance Over Time",
                      data: volatilitySeries,
                      borderColor: "rgba(75, 192, 192, 1)",
                      fill: false,
                    },
                  ],
                }}
                options={{
                  scales: {
                    x: {
                      type: "time",
                      time: {
                        unit: "minute",
                      },
                      title: {
                        display: true,
                        text: "Time (15 min intervals)",
                      },
                      ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Variance",
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw;
                          return `GARCH Variance Over Time: ${value.toFixed(
                            7
                          )}`;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        )}
        <h2>Volatility for All Symbols</h2>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "symbol"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("symbol")}
                  >
                    Symbol
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "currentVolatility"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("currentVolatility")}
                  >
                    Current Volatility
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "predictedVolatility"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("predictedVolatility")}
                  >
                    Predicted Volatility (GARCH)
                  </TableSortLabel>
                </TableCell>
                <TableCell>K-line Chart</TableCell> {/* New Column for K-line */}
              </TableRow>
            </TableHead>
            <TableBody>
              {volatilityData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data.symbol}</TableCell>
                  <TableCell>{data.currentVolatility.toFixed(5)}</TableCell>
                  <TableCell>{data.predictedVolatility.toFixed(5)}</TableCell>
                  <TableCell>
                    <Line
                      data={{
                        labels:
                          data.ohlcData.map((candle) => new Date(candle.time/ 1000)),
                        datasets: [
                          {
                            label: "Close Prices",
                            data:
                              data.ohlcData.map((candle) => candle.close),
                            borderColor: "rgba(255, 99, 132, 1)",
                            fill: false,
                          },
                        ],
                      }}
                      options={{
                        scales: {
                          x: {
                            type: "time",
                            time: {
                              unit: "minute",
                            },
                            ticks: {
                              autoSkip: true,
                              maxTicksLimit: 10,
                            },
                          },
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Container>
  );
}

export default App;
