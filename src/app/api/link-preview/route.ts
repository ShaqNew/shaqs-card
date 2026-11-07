import { NextRequest, NextResponse } from "next/server";
import {
  extractOpenGraphFromHtml,
  inferRetailerSource,
  isGooglePhotosUrl,
  isPrivateGooglePhotosUrl,
  isPrivateOrLocalHostname,
} from "@/app/naanas-space/thailand-2027/utils/wardrobe";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const BOT_USER_AGENT =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

async function fetchHtmlWithUserAgent(targetUrl: string, userAgent: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function handleLinkPreview(rawUrl: string | null) {
  if (!rawUrl || !rawUrl.trim()) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json(
      { error: "Only HTTP and HTTPS URLs are supported" },
      { status: 400 }
    );
  }

  if (isPrivateOrLocalHostname(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: "Private or local network URLs are not permitted" },
      { status: 400 }
    );
  }

  const { siteName: inferredSite, fallbackTitle } =
    inferRetailerSource(parsedUrl);

  if (isPrivateGooglePhotosUrl(parsedUrl.toString())) {
    return NextResponse.json({
      url: parsedUrl.toString(),
      title: fallbackTitle,
      imageUrl: null,
      siteName: "Google Photos",
      warning:
        "Private Google Photos link detected. Open the photo in Google Photos and tap Share → Create link (photos.app.goo.gl) so the thumbnail can load.",
    });
  }

  // Direct image URLs can be used immediately as the visual thumbnail
  if (/\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(parsedUrl.pathname)) {
    return NextResponse.json({
      url: parsedUrl.toString(),
      title: fallbackTitle,
      imageUrl: parsedUrl.toString(),
      siteName: inferredSite,
    });
  }

  try {
    // Google Photos short links (photos.app.goo.gl) serve a client-side JS interstitial
    // to desktop browser User-Agents, but 302-redirect directly to the OpenGraph share page
    // when requested with a link-preview crawler User-Agent.
    const preferBotUa =
      isGooglePhotosUrl(parsedUrl.toString()) ||
      parsedUrl.hostname.endsWith(".goo.gl") ||
      parsedUrl.hostname.includes("pin.it");

    const primaryUa = preferBotUa ? BOT_USER_AGENT : BROWSER_USER_AGENT;
    const response = await fetchHtmlWithUserAgent(
      parsedUrl.toString(),
      primaryUa
    );

    const contentType = response.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      return NextResponse.json({
        url: parsedUrl.toString(),
        title: fallbackTitle,
        imageUrl: parsedUrl.toString(),
        siteName: inferredSite,
      });
    }

    if (response.ok) {
      const finalUrl = response.url || parsedUrl.toString();
      if (finalUrl.includes("accounts.google.com")) {
        return NextResponse.json({
          url: parsedUrl.toString(),
          title: fallbackTitle,
          imageUrl: null,
          siteName: inferredSite,
          warning:
            "This Google link requires sign-in. In Google Photos, tap Share → Create link (photos.app.goo.gl) to generate a shareable preview.",
        });
      }
      const html = await response.text();
      let extracted = extractOpenGraphFromHtml(html, finalUrl);

      // Fallback: if the browser UA received a JS shell without og:image, retry with bot UA
      if (!extracted.imageUrl && !preferBotUa) {
        try {
          const retryRes = await fetchHtmlWithUserAgent(
            parsedUrl.toString(),
            BOT_USER_AGENT
          );
          if (retryRes.ok) {
            const retryFinalUrl = retryRes.url || parsedUrl.toString();
            const retryHtml = await retryRes.text();
            const retryExtracted = extractOpenGraphFromHtml(
              retryHtml,
              retryFinalUrl
            );
            if (retryExtracted.imageUrl) {
              extracted = retryExtracted;
            }
          }
        } catch {
          // Keep primary extraction result
        }
      }

      return NextResponse.json({
        url: parsedUrl.toString(),
        title: extracted.title || fallbackTitle,
        imageUrl: extracted.imageUrl,
        siteName: extracted.siteName || inferredSite,
      });
    }
  } catch {
    // Graceful fallback when retailer blocks automated scraping or offline
  }

  return NextResponse.json({
    url: parsedUrl.toString(),
    title: fallbackTitle,
    imageUrl: null,
    siteName: inferredSite,
  });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  return handleLinkPreview(url);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };
    return handleLinkPreview(body?.url || null);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }
}
