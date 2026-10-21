'use client';

import { useEffect, useRef } from 'react';
import { 
  createChart, ColorType, LineStyle, IPriceLine, ISeriesApi, 
  CandlestickSeries, AreaSeries, LineSeries, UTCTimestamp 
} from 'lightweight-charts';

interface Trade {
  id: string;
  strikePrice: number;
  direction: 'BUY' | 'SELL';
  amount: number;
}

interface RealChartProps {
  symbol: string;
  trades: Trade[];
  chartType: 'candlestick' | 'area';
  showSMA: boolean;
  onPriceTick: (price: number) => void;
}

export default function RealChart({ symbol, trades, chartType, showSMA, onPriceTick }: RealChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const priceLinesRef = useRef<Map<string, IPriceLine>>(new Map());
  const currentPriceRef = useRef<number>(1.08500);

  useEffect(() => {
    if (!containerRef.current) return;

    let basePrice = 1.08500;
    if (symbol.includes('BTC')) basePrice = 96400.00;
    else if (symbol.includes('ETH')) basePrice = 2750.00;
    else if (symbol.includes('GOLD')) basePrice = 2650.00;
    else if (symbol.includes('JPY')) basePrice = 154.20;

    currentPriceRef.current = basePrice;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#080c11' },
        textColor: '#6b7280',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#1a2030',
      },
      rightPriceScale: {
        borderColor: '#1a2030',
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      crosshair: {
        vertLine: { color: '#b6ff3b', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#b6ff3b', width: 1, style: LineStyle.Dashed },
      },
      autoSize: true,
    });

    let mainSeries: ISeriesApi<any>;
    if (chartType === 'candlestick') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
    } else {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(182, 255, 59, 0.25)',
        bottomColor: 'rgba(182, 255, 59, 0.00)',
        lineColor: '#b6ff3b',
        lineWidth: 2,
      });
    }
    seriesRef.current = mainSeries;

    if (showSMA) {
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 1,
        title: 'SMA 20',
      });
      smaSeriesRef.current = smaSeries;
    }

    const CANDLE_DURATION = 2; // 2 second candles
    const now = Math.floor(Date.now() / 1000);
    const startTime = Math.floor(now / CANDLE_DURATION) * CANDLE_DURATION - (100 * CANDLE_DURATION);
    
    const initialData = [];
    const smaData = [];
    let lastClose = basePrice;

    for (let i = 0; i < 100; i++) {
      const cTime = (startTime + i * CANDLE_DURATION) as UTCTimestamp;
      const open = lastClose;
      const volatility = basePrice * 0.00015;
      const change = (Math.random() - 0.49) * volatility;
      const close = Number((open + change).toFixed(5));
      const high = Number((Math.max(open, close) + Math.random() * volatility * 0.3).toFixed(5));
      const low = Number((Math.min(open, close) - Math.random() * volatility * 0.3).toFixed(5));
      lastClose = close;

      if (chartType === 'candlestick') {
        initialData.push({ time: cTime, open, high, low, close });
      } else {
        initialData.push({ time: cTime, value: close });
      }

      if (showSMA) {
        smaData.push({ time: cTime, value: Number((close * 0.9998).toFixed(5)) });
      }
    }

    currentPriceRef.current = lastClose;
    mainSeries.setData(initialData);
    if (showSMA && smaSeriesRef.current) {
      smaSeriesRef.current.setData(smaData);
    }

    chart.timeScale().fitContent();

    // Proper Candle Bucket Ticker
    let activeCandleTime = (Math.floor(now / CANDLE_DURATION) * CANDLE_DURATION) as UTCTimestamp;
    let activeCandle = {
      time: activeCandleTime,
      open: lastClose,
      high: lastClose,
      low: lastClose,
      close: lastClose,
    };

    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const currentBucketTime = (Math.floor(nowSec / CANDLE_DURATION) * CANDLE_DURATION) as UTCTimestamp;

      const volatility = basePrice * 0.00012;
      const change = (Math.random() - 0.495) * volatility;
      currentPriceRef.current = Number((currentPriceRef.current + change).toFixed(5));

      if (currentBucketTime !== activeCandleTime) {
        // New Candle starts at previous close
        activeCandleTime = currentBucketTime;
        activeCandle = {
          time: currentBucketTime,
          open: currentPriceRef.current,
          high: currentPriceRef.current,
          low: currentPriceRef.current,
          close: currentPriceRef.current,
        };
      } else {
        // Update current candle OHLC
        activeCandle.high = Math.max(activeCandle.high, currentPriceRef.current);
        activeCandle.low = Math.min(activeCandle.low, currentPriceRef.current);
        activeCandle.close = currentPriceRef.current;
      }

      if (chartType === 'candlestick') {
        mainSeries.update(activeCandle);
      } else {
        mainSeries.update({ time: currentBucketTime, value: currentPriceRef.current });
      }

      if (showSMA && smaSeriesRef.current) {
        smaSeriesRef.current.update({
          time: currentBucketTime,
          value: Number((currentPriceRef.current * 0.9998).toFixed(5)),
        });
      }

      onPriceTick(currentPriceRef.current);
    }, 300);

    return () => {
      clearInterval(interval);
      chart.remove();
    };
  }, [symbol, chartType, showSMA, onPriceTick]);

  useEffect(() => {
    if (!seriesRef.current) return;

    priceLinesRef.current.forEach((line, tradeId) => {
      if (!trades.find((t) => t.id === tradeId)) {
        seriesRef.current?.removePriceLine(line);
        priceLinesRef.current.delete(tradeId);
      }
    });

    trades.forEach((trade) => {
      if (!priceLinesRef.current.has(trade.id)) {
        const line = seriesRef.current?.createPriceLine({
          price: trade.strikePrice,
          color: trade.direction === 'BUY' ? '#22c55e' : '#ef4444',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `${trade.direction} $${trade.amount}`,
        });

        if (line) {
          priceLinesRef.current.set(trade.id, line);
        }
      }
    });
  }, [trades]);

  return <div ref={containerRef} className="w-full h-full" />;
}
