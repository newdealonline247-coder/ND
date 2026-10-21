'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle, IPriceLine, ISeriesApi } from 'lightweight-charts';

interface Trade {
  id: string;
  strikePrice: number;
  direction: 'BUY' | 'SELL';
  amount: number;
}

interface RealChartProps {
  symbol: string;
  trades: Trade[];
  onPriceTick: (price: number) => void;
}

export default function RealChart({ symbol, trades, onPriceTick }: RealChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
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

    const series = chart.addAreaSeries({
      topColor: 'rgba(182, 255, 59, 0.25)',
      bottomColor: 'rgba(182, 255, 59, 0.00)',
      lineColor: '#b6ff3b',
      lineWidth: 2,
    });
    seriesRef.current = series;

    const now = Math.floor(Date.now() / 1000);
    const initialData = [];
    let price = basePrice;

    for (let i = 120; i >= 0; i--) {
      price += (Math.random() - 0.495) * (basePrice * 0.0003);
      initialData.push({
        time: (now - i) as any,
        value: Number(price.toFixed(5)),
      });
    }

    series.setData(initialData);
    chart.timeScale().fitContent();

    const interval = setInterval(() => {
      const volatility = basePrice * 0.0002;
      const change = (Math.random() - 0.495) * volatility;
      currentPriceRef.current = Number((currentPriceRef.current + change).toFixed(5));

      const tickTime = Math.floor(Date.now() / 1000) as any;
      series.update({
        time: tickTime,
        value: currentPriceRef.current,
      });

      onPriceTick(currentPriceRef.current);
    }, 400);

    return () => {
      clearInterval(interval);
      chart.remove();
    };
  }, [symbol, onPriceTick]);

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
