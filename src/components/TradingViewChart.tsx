"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    currentContainer.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: '1',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      backgroundColor: '#05080a',
      gridColor: 'rgba(240, 243, 250, 0.04)'
    });

    currentContainer.appendChild(widgetDiv);
    currentContainer.appendChild(script);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div 
      className="tradingview-widget-container" 
      ref={containerRef} 
      style={{ height: '100%', width: '100%' }}
    />
  );
}

export default memo(TradingViewChart);