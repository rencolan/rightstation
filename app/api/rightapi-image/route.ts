import { NextRequest, NextResponse } from "next/server";

const RIGHTAPI_IMAGE_HOST = /^file\d+\.aitohumanize\.com$/i;

export async function GET(req: NextRequest) {
  const value = req.nextUrl.searchParams.get("url");
  if (!value) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(value);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  // Keep this allowlist deliberately narrow to prevent this route becoming
  // an open proxy or being used to access private network resources.
  if (
    imageUrl.protocol !== "https:" ||
    !RIGHTAPI_IMAGE_HOST.test(imageUrl.hostname)
  ) {
    return NextResponse.json({ error: "Image host is not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,*/*" },
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Unable to load generated image" },
        { status: upstream.status || 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return NextResponse.json(
        { error: "Upstream response is not an image" },
        { status: 502 },
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load generated image" },
      { status: 502 },
    );
  }
}

export const runtime = "edge";
