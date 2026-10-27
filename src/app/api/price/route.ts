import { NextResponse } from "next/server";

const SYMBOL_MAP: Record<string, string> = {
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  GBPAUD: "GBPAUD=X",
  USDJPY: "USDJPY=X",
  USDCHF: "USDCHF=X",
  AUDUSD: "AUDUSD=X",
  USDCAD: "USDCAD=X",
  NZDUSD: "NZDUSD=X",
  EURGBP: "EURGBP=X",
  EURJPY: "EURJPY=X",
  GBPJPY: "GBPJPY=X",
  AUDJPY: "AUDJPY=X",
  EURAUD: "EURAUD=X",
  EURCAD: "EURCAD=X",
  GBPCHF: "GBPCHF=X",
  CADJPY: "CADJPY=X",
  CHFJPY: "CHFJPY=X",
  NZDJPY: "NZDJPY=X",
  EURNZD: "EURNZD=X",
  AUDCAD: "AUDCAD=X",
  BTCUSDT: "BTC-USD",
  ETHUSDT: "ETH-USD",
  XAUUSD: "GC=F",
};

const BASELINE_PRICES: Record<string, number> = {
  EURUSD: 1.11572,
  GBPUSD: 1.33207,
  GBPAUD: 1.96750,
  USDJPY: 154.230,
  USDCHF: 0.86510,
  AUDUSD: 0.65820,
  USDCAD: 1.36740,
  NZDUSD: 0.59730,
  EURGBP: 0.85210,
  EURJPY: 164.850,
  GBPJPY: 195.420,
  AUDJPY: 99.640,
  EURAUD: 1.63410,
  EURCAD: 1.48920,
  GBPCHF: 1.11320,
  CADJPY: 109.800,
  CHFJPY: 172.150,
  NZDJPY: 91.350,
  EURNZD: 1.86810,
  AUDCAD: 0.90350,
  BTCUSDT: 91450.00,
  ETHUSDT: 3350.25,
  XAUUSD: 2685.50,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "EURUSD";
  const yahooSymbol = SYMBOL_MAP[symbol] || `${symbol}=X`;

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice || meta?.chartPreviousClose;
      if (typeof price === "number" && price > 0) {
        return NextResponse.json({ symbol, price });
      }
    }
  } catch (e) {
    console.error("Price fetch error:", e);
  }

  const fallbackPrice = BASELINE_PRICES[symbol] || 1.0;
  return NextResponse.json({ symbol, price: fallbackPrice });
}