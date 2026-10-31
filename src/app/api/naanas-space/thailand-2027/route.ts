import { NextRequest, NextResponse } from "next/server";

const REDIS_KEY = "naanas_space_thailand_2027_v1";

function getKvCredentials(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), token };
}

export async function GET() {
  const creds = getKvCredentials();
  if (!creds) {
    return NextResponse.json(
      {
        configured: false,
        state: null,
        message:
          "Vercel KV / Upstash Redis environment variables not yet configured.",
      },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(creds.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", REDIS_KEY]),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { configured: true, state: null, error: "Failed to read from KV" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as { result?: string | null };
    if (!data.result) {
      return NextResponse.json(
        { configured: true, state: null },
        { status: 200 }
      );
    }

    const parsed =
      typeof data.result === "string" ? JSON.parse(data.result) : data.result;

    return NextResponse.json(
      { configured: true, state: parsed },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        state: null,
        error: error instanceof Error ? error.message : "Unknown KV error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const creds = getKvCredentials();
  if (!creds) {
    return NextResponse.json(
      {
        configured: false,
        saved: false,
        message:
          "Vercel KV / Upstash Redis environment variables not yet configured.",
      },
      { status: 200 }
    );
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.state) {
      return NextResponse.json(
        { configured: true, saved: false, error: "Invalid state payload" },
        { status: 400 }
      );
    }

    const payload = {
      ...body.state,
      updatedAt: body.state.updatedAt || Date.now(),
    };

    const response = await fetch(creds.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", REDIS_KEY, JSON.stringify(payload)]),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { configured: true, saved: false, error: "Failed to write to KV" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { configured: true, saved: true, updatedAt: payload.updatedAt },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        saved: false,
        error: error instanceof Error ? error.message : "Unknown KV error",
      },
      { status: 500 }
    );
  }
}
