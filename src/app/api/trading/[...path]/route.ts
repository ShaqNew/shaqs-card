import { NextRequest, NextResponse } from "next/server";

const TRADING_API_HOST = process.env.TRADING_API_HOST;
const TRADING_API_KEY = process.env.TRADING_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (!TRADING_API_HOST || !TRADING_API_KEY) {
    return NextResponse.json(
      { error: "Trading API not configured on server" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const pathString = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  
  const dropletUrl = `http://${TRADING_API_HOST}:8080/${pathString}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const res = await fetch(dropletUrl, {
      headers: {
        "X-API-Key": TRADING_API_KEY,
      },
      // Ensure we don't cache these real-time requests
      cache: 'no-store'
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Trading Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Trading Droplet", details: error.message },
      { status: 502 }
    );
  }
}
