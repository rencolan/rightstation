import { NextResponse } from "next/server";

interface PublicModel {
  name?: string;
  is_available?: boolean;
}

interface PublicUpstream {
  prefix?: string;
  models?: PublicModel[];
}

export async function GET() {
  try {
    const response = await fetch("https://www.rightapi.ai/models/public", {
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("Unable to load RightAPI models");

    const payload = (await response.json()) as {
      upstreams?: PublicUpstream[];
    };
    const supportedPrefixes = new Set(["/codex", "/draw"]);
    const names = new Set<string>();

    for (const upstream of payload.upstreams ?? []) {
      if (!supportedPrefixes.has(upstream.prefix ?? "")) continue;
      for (const model of upstream.models ?? []) {
        if (model.name && model.is_available !== false) names.add(model.name);
      }
    }

    return NextResponse.json(
      Array.from(names).map((name, sorted) => ({
        name,
        displayName: name,
        available: true,
        sorted,
        provider: {
          id: "openai",
          providerName: "OpenAI",
          providerType: "rightapi",
          sorted: 0,
        },
      })),
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } },
    );
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}

export const runtime = "edge";
