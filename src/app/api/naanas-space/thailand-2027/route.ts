import { NextRequest, NextResponse } from "next/server";
import { execKvCommand } from "./kv";

const REDIS_KEY = "naanas_space_thailand_2027_v1";

export async function GET() {
  const kvRes = await execKvCommand<string | Record<string, unknown> | null>([
    "GET",
    REDIS_KEY,
  ]);

  if (!kvRes.ok) {
    if (kvRes.reason === "unconfigured") {
      return NextResponse.json(
        {
          configured: false,
          state: null,
          message: kvRes.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        configured: true,
        state: null,
        error:
          kvRes.reason === "http-error" ? "Failed to read from KV" : kvRes.message,
      },
      { status: kvRes.reason === "http-error" ? 502 : 500 }
    );
  }

  try {
    if (!kvRes.result) {
      return NextResponse.json(
        { configured: true, state: null },
        { status: 200 }
      );
    }

    const parsed =
      typeof kvRes.result === "string"
        ? JSON.parse(kvRes.result)
        : kvRes.result;

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

    const kvRes = await execKvCommand([
      "SET",
      REDIS_KEY,
      JSON.stringify(payload),
    ]);

    if (!kvRes.ok) {
      if (kvRes.reason === "unconfigured") {
        return NextResponse.json(
          {
            configured: false,
            saved: false,
            message: kvRes.message,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          configured: true,
          saved: false,
          error:
            kvRes.reason === "http-error"
              ? "Failed to write to KV"
              : kvRes.message,
        },
        { status: kvRes.reason === "http-error" ? 502 : 500 }
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
