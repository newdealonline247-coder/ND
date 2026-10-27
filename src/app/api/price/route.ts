import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "EURUSD";

  const cleanSymbol = symbol.replace("OANDA:", "").replace("BINANCE:", "").replace("_", "");

  // 1. Fetch real-time OANDA/Yahoo Forex & Commodity spot prices (matching TradingView)
  try {
    const yahooSymbol = cleanSymbol === "XAUUSD" ? "XAUUSD=X" : `${cleanSymbol}=X`;
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`;

    const res = await fetch(yahooUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice || meta?.chartPreviousClose;

      if (typeof price === "number" && price > 0) {
        return NextResponse.json({
          price,
          timestamp: Date.now(),
          source: "yahoo_spot",
        });
      }
    }
  } catch (err) {
    console.error("Yahoo spot price error:", err);
  }

  // 2. Fallback to Finnhub Quote API
  try {
    const finnhubToken = process.env.FINNHUB_API_KEY || "sandbox_c0123456789";
    const base = cleanSymbol.slice(0, 3);
    const quote = cleanSymbol.slice(3);
    const fhSymbol = cleanSymbol === "XAUUSD" ? "OANDA:XAU_USD" : `OANDA:${base}_${quote}`;

    const fhRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${fhSymbol}&token=${fhSymbol}`, { cache: "no-store" });
    if (fhRes.ok) {
      const fhData = await fhRes.json();
      if (typeof fhData.c === "number" && fhData.c > 0) {
        return NextResponse.json({
          price: fhData.c,
          timestamp: Date.now(),
          source: "finnhub",
        });
      }
    }
  } catch (err) {
    console.error("Finnhub price error:", err);
  }

  return NextResponse.json({ error: "Price unavailable" }, { status: 500 });
}