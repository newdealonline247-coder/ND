"use client";

import { useEffect, useRef } from "react";

type Candle = { o: number; h: number; l: number; c: number };

const COUNT = 96;
const TICK_MS = 140;
const NEW_CANDLE_TICKS = 7;

export function HeroChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Seed candles with a gentle upward drift.
    let price = 100;
    const candles: Candle[] = [];
    for (let i = 0; i < COUNT; i++) {
      const open = price;
      const drift = 0.06 + (Math.random() - 0.5) * 1.6;
      const close = open + drift;
      candles.push({
        o: open,
        c: close,
        h: Math.max(open, close) + Math.random() * 0.55,
        l: Math.min(open, close) - Math.random() * 0.55,
      });
      price = close;
    }

    let tickCount = 0;
    let lastTick = performance.now();

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (now - lastTick < TICK_MS) return;
      lastTick = now;
      tickCount++;

      const live = candles[candles.length - 1];
      const delta = 0.05 + (Math.random() - 0.5) * 1.15;
      live.c = live.c + delta;
      live.h = Math.max(live.h, live.c);
      live.l = Math.min(live.l, live.c);

      if (tickCount % NEW_CANDLE_TICKS === 0) {
        candles.push({
          o: live.c,
          c: live.c,
          h: live.c,
          l: live.c,
        });
        candles.shift();
      }

      // Draw
      ctx.clearRect(0, 0, width, height);
      let min = Infinity;
      let max = -Infinity;
      for (const c of candles) {
        min = Math.min(min, c.l);
        max = Math.max(max, c.h);
      }
      const pad = (max - min) * 0.15 || 1;
      min -= pad;
      max += pad;
      const scaleY = (v: number) => height - ((v - min) / (max - min)) * height;

      // Grid
      ctx.strokeStyle = "rgba(182, 255, 59, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        const y = (height / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const slot = width / COUNT;
      const bodyW = Math.max(2, slot * 0.55);

      candles.forEach((c, i) => {
        const x = i * slot + slot / 2;
        const up = c.c >= c.o;
        const isLive = i === candles.length - 1;
        const alpha = isLive ? 0.85 : 0.4;
        ctx.strokeStyle = up
          ? `rgba(43, 217, 138, ${alpha})`
          : `rgba(255, 77, 103, ${alpha})`;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 1;

        // Wick
        ctx.beginPath();
        ctx.moveTo(x, scaleY(c.h));
        ctx.lineTo(x, scaleY(c.l));
        ctx.stroke();

        // Body
        const top = scaleY(Math.max(c.o, c.c));
        const bottom = scaleY(Math.min(c.o, c.c));
        ctx.fillRect(x - bodyW / 2, top, bodyW, Math.max(1.5, bottom - top));
      });

      // Live price line
      const livePrice = candles[candles.length - 1].c;
      const ly = scaleY(livePrice);
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = "rgba(182, 255, 59, 0.35)";
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(width, ly);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-60 [mask-image:radial-gradient(120%_90%_at_50%_10%,black_30%,transparent_75%)]"
      aria-hidden="true"
    />
  );
}
