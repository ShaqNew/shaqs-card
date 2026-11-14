jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    private bodyText: string;
    constructor(url: string, init?: { method?: string; body?: string }) {
      this.url = url;
      this.method = init?.method || "GET";
      this.bodyText = init?.body || "";
    }
    async json() {
      return JSON.parse(this.bodyText);
    }
  },
  NextResponse: class MockNextResponse {
    body: unknown;
    status: number;
    headers: Map<string, string>;
    constructor(
      body: unknown,
      init?: { status?: number; headers?: Record<string, string> }
    ) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
    static json(
      data: unknown,
      init?: { status?: number; headers?: Record<string, string> }
    ) {
      const res = new MockNextResponse(JSON.stringify(data), init);
      (res as unknown as { _json: unknown })._json = data;
      return res;
    }
    async json() {
      return (this as unknown as { _json: unknown })._json;
    }
  },
}));

import { NextRequest } from "next/server";
import { GET, PUT, DELETE } from "../route";

describe("/api/naanas-space/thailand-2027/wardrobe-image/[id]", () => {
  const origEnv = process.env;
  const origFetch = global.fetch;

  beforeEach(() => {
    process.env = {
      ...origEnv,
      KV_REST_API_URL: "https://kv.example.test",
      KV_REST_API_TOKEN: "test-token",
    };
  });

  afterEach(() => {
    process.env = origEnv;
    global.fetch = origFetch;
  });

  it("validates id format and rejects oversized or malformed payloads", async () => {
    const badIdRes = await GET(
      new NextRequest("http://localhost/api/naanas-space/thailand-2027/wardrobe-image/bad!"),
      { params: Promise.resolve({ id: "bad!" }) }
    );
    expect(badIdRes.status).toBe(400);

    const badPayloadReq = new NextRequest(
      "http://localhost/api/naanas-space/thailand-2027/wardrobe-image/img_valid_1",
      {
        method: "PUT",
        body: JSON.stringify({ dataUrl: "not-a-data-url" }),
      }
    );
    const badPayloadRes = await PUT(badPayloadReq, {
      params: Promise.resolve({ id: "img_valid_1" }),
    });
    expect(badPayloadRes.status).toBe(400);
  });

  it("stores, serves binary image bytes with immutable Cache-Control, and deletes by key", async () => {
    const store = new Map<string, string>();

    global.fetch = jest.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const cmd = JSON.parse(String(init?.body || "[]")) as string[];
      if (cmd[0] === "SET") {
        store.set(cmd[1], cmd[2]);
        return {
          ok: true,
          json: async () => ({ result: "OK" }),
        } as Response;
      }
      if (cmd[0] === "GET") {
        return {
          ok: true,
          json: async () => ({ result: store.get(cmd[1]) ?? null }),
        } as Response;
      }
      if (cmd[0] === "DEL") {
        store.delete(cmd[1]);
        return {
          ok: true,
          json: async () => ({ result: 1 }),
        } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    }) as unknown as typeof fetch;

    const samplePng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const putRes = await PUT(
      new NextRequest(
        "http://localhost/api/naanas-space/thailand-2027/wardrobe-image/img_test_99",
        {
          method: "PUT",
          body: JSON.stringify({ dataUrl: samplePng }),
        }
      ),
      { params: Promise.resolve({ id: "img_test_99" }) }
    );
    expect(putRes.status).toBe(200);
    await expect(putRes.json()).resolves.toMatchObject({
      configured: true,
      saved: true,
      id: "img_test_99",
      imageUrl: "/api/naanas-space/thailand-2027/wardrobe-image/img_test_99",
    });

    const getRes = await GET(
      new NextRequest(
        "http://localhost/api/naanas-space/thailand-2027/wardrobe-image/img_test_99"
      ),
      { params: Promise.resolve({ id: "img_test_99" }) }
    );
    expect(getRes.status).toBe(200);
    expect(getRes.headers.get("Content-Type")).toBe("image/png");
    expect(getRes.headers.get("Cache-Control")).toBe(
      "public, max-age=31536000, immutable"
    );

    const delRes = await DELETE(
      new NextRequest(
        "http://localhost/api/naanas-space/thailand-2027/wardrobe-image/img_test_99",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ id: "img_test_99" }) }
    );
    expect(delRes.status).toBe(200);
    await expect(delRes.json()).resolves.toMatchObject({
      configured: true,
      deleted: true,
      id: "img_test_99",
    });
    expect(store.size).toBe(0);
  });
});
