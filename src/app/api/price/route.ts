import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "EURUSD";

  const cleanSymbol = symbol.replace("OANDA:", "").replace("BINANCE:", "").replace("_", "");

  // 1. Finnhub Quote API (Real-time OANDA rates)
  try {
    const token = process.env.FINNHUB_API_KEY || "cu3p311r01qhk64s39g0";
    let fhSymbol = `OANDA:${cleanSymbol.slice(0, 3)}_${cleanSymbol.slice(3)}`;
    if (cleanSymbol === "XAUUSD") fhSymbol = "OANDA:XAU_USD";
    if (cleanSymbol === "BTCUSDT") fhSymbol = "BINANCE:BTCUSDT";
    if (cleanSymbol === "ETHUSDT") fhSymbol = "BINANCE:ETHUSDT";

    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${fhSymbol}&token=${token}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof data.c === "number" && data.c > 0) {
        return NextResponse.json({
          price: data.c,
          timestamp: Date.now(),
        });
      }
    }
  } catch (e) {
    console.error("Finnhub quote error", e);
  }

  // 2. Fallback Yahoo Quote API
  try {
    const yahooSymbol = cleanSymbol === "XAUUSD" ? "XAUUSD=X" : `${cleanSymbol}=X`;
    const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}`, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    if (res.ok) {
      const data = await res.json();
      const quote = data?.quoteResponse?.result?.[0];
      const price = quote?.regularMarketPrice || quote?.bid || quote?.ask;
      if (typeof price === "number" && price > 0) {
        return NextResponse.json({ price, timestamp: Date.now() });
      }
    }
  } catch (e) {
    console.error("Yahoo quote error", e);
  }

  return NextResponse.json({ error: "Price unavailable" }, { status: 500 });
}