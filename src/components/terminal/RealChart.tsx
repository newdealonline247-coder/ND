'use client';

import { useEffect, useRef } from 'react';
import { 
  createChart, ColorType, LineStyle, IPriceLine, ISeriesApi, 
  CandlestickSeries, AreaSeries, LineSeries 
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

    const now = Math.floor(Date.now() / 1000);
    const initialData = [];
    const smaData = [];
    let price = basePrice;

    for (let i = 120; i >= 0; i--) {
      const open = price;
      const volatility = basePrice * 0.0003;
      const change = (Math.random() - 0.495) * volatility;
      const close = Number((open + change).toFixed(5));
      const high = Number((Math.max(open, close) + Math.random() * volatility * 0.5).toFixed(5));
      const low = Number((Math.min(open, close) - Math.random() * volatility * 0.5).toFixed(5));
      price = close;

      const time = (now - i) as any;

      if (chartType === 'candlestick') {
        initialData.push({ time, open, high, low, close });
      } else {
        initialData.push({ time, value: close });
      }

      if (showSMA) {
        smaData.push({ time, value: Number((close * 0.9998).toFixed(5)) });
      }
    }

    mainSeries.setData(initialData);
    if (showSMA && smaSeriesRef.current) {
      smaSeriesRef.current.setData(smaData);
    }

    chart.timeScale().fitContent();

    let currentCandleOpen = price;
    let currentCandleHigh = price;
    let currentCandleLow = price;

    const interval = setInterval(() => {
      const volatility = basePrice * 0.0002;
      const change = (Math.random() - 0.495) * volatility;
      currentPriceRef.current = Number((currentPriceRef.current + change).toFixed(5));

      currentCandleHigh = Math.max(currentCandleHigh, currentPriceRef.current);
      currentCandleLow = Math.min(currentCandleLow, currentPriceRef.current);

      const tickTime = Math.floor(Date.now() / 1000) as any;

      if (chartType === 'candlestick') {
        mainSeries.update({
          time: tickTime,
          open: currentCandleOpen,
          high: currentCandleHigh,
          low: currentCandleLow,
          close: currentPriceRef.current,
        });
      } else {
        mainSeries.update({
          time: tickTime,
          value: currentPriceRef.current,
        });
      }

      if (showSMA && smaSeriesRef.current) {
        smaSeriesRef.current.update({
          time: tickTime,
          value: Number((currentPriceRef.current * 0.9998).toFixed(5)),
        });
      }

      onPriceTick(currentPriceRef.current);
    }, 400);

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
