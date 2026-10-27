"use client";

import React, { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol: string;
}

function TradingViewChartComponent({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget script
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_side_toolbar: false, // ENABLES LEFT DRAWING TOOLBAR
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
      backgroundColor: "#05080a",
      gridColor: "rgba(24, 34, 40, 0.4)",
      hide_top_toolbar: false,
      save_image: true,
      container_id: "tradingview_chart_container",
    });

    const widgetContainer = document.createElement("div");
    widgetContainer.id = "tradingview_chart_container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#05080a] relative overflow-hidden"
    />
  );
}

export default memo(TradingViewChartComponent);