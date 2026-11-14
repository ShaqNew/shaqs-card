import { NextRequest, NextResponse } from "next/server";
import { execKvCommand } from "../../kv";

const REDIS_IMAGE_KEY_PREFIX = "naanas_space_thailand_2027_img_";
const IMAGE_ID_REGEX = /^[a-zA-Z0-9_-]{4,80}$/;
const DATA_URL_REGEX =
  /^data:(image\/(?:webp|jpeg|png|avif));base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_DATA_URL_LENGTH = 450_000;

function isValidImageId(id: string): boolean {
  return IMAGE_ID_REGEX.test(id);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isValidImageId(id)) {
    return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
  }

  const kvRes = await execKvCommand<string | null>([
    "GET",
    `${REDIS_IMAGE_KEY_PREFIX}${id}`,
  ]);

  if (!kvRes.ok) {
    if (kvRes.reason === "unconfigured") {
      return NextResponse.json(
        { configured: false, error: kvRes.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { configured: true, error: kvRes.message },
      { status: 502 }
    );
  }

  if (!kvRes.result || typeof kvRes.result !== "string") {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const match = kvRes.result.match(DATA_URL_REGEX);
  if (!match) {
    return NextResponse.json(
      { error: "Stored image payload is malformed" },
      { status: 500 }
    );
  }

  const [, mimeType, base64Data] = match;
  const binary = Buffer.from(base64Data, "base64");

  return new NextResponse(binary, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isValidImageId(id)) {
    return NextResponse.json(
      { configured: true, saved: false, error: "Invalid image ID" },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as { dataUrl?: unknown };
    if (typeof body?.dataUrl !== "string") {
      return NextResponse.json(
        { configured: true, saved: false, error: "Missing dataUrl payload" },
        { status: 400 }
      );
    }

    if (body.dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return NextResponse.json(
        {
          configured: true,
          saved: false,
          error: "Compressed photo exceeds 450KB limit",
        },
        { status: 413 }
      );
    }

    if (!DATA_URL_REGEX.test(body.dataUrl)) {
      return NextResponse.json(
        {
          configured: true,
          saved: false,
          error: "Unsupported image format (must be WebP, JPEG, PNG, or AVIF base64)",
        },
        { status: 400 }
      );
    }

    const kvRes = await execKvCommand([
      "SET",
      `${REDIS_IMAGE_KEY_PREFIX}${id}`,
      body.dataUrl,
    ]);

    if (!kvRes.ok) {
      if (kvRes.reason === "unconfigured") {
        return NextResponse.json(
          { configured: false, saved: false, message: kvRes.message },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { configured: true, saved: false, error: kvRes.message },
        { status: kvRes.reason === "http-error" ? 502 : 500 }
      );
    }

    return NextResponse.json(
      {
        configured: true,
        saved: true,
        id,
        imageUrl: `/api/naanas-space/thailand-2027/wardrobe-image/${id}`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        saved: false,
        error: error instanceof Error ? error.message : "Invalid request",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isValidImageId(id)) {
    return NextResponse.json(
      { configured: true, deleted: false, error: "Invalid image ID" },
      { status: 400 }
    );
  }

  const kvRes = await execKvCommand([
    "DEL",
    `${REDIS_IMAGE_KEY_PREFIX}${id}`,
  ]);

  if (!kvRes.ok) {
    if (kvRes.reason === "unconfigured") {
      return NextResponse.json(
        { configured: false, deleted: false, message: kvRes.message },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { configured: true, deleted: false, error: kvRes.message },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { configured: true, deleted: true, id },
    { status: 200 }
  );
}
