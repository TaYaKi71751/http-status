import { NextRequest, NextResponse } from "next/server";
import type { IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import {
  createBrotliDecompress,
  createGunzip,
  createInflate
} from "node:zlib";

export const runtime = "nodejs";

const GALLERY_URL_PATTERN = /^https?:\/\/(?:www\.)?nhentai\.net\/g\/(\d+)\/?$/i;
const NUMERIC_ID_PATTERN = /^\d+$/;

type SuccessResponse = {
  galleryId: string;
  mediaId: string;
  source: "html";
};

type ErrorResponse = {
  error: string;
};

type HtmlLookupRequest = {
  url?: string;
};

function json(status: number): NextResponse;
function json(
  body: SuccessResponse | ErrorResponse,
  status?: number
): NextResponse;
function json(
  bodyOrStatus: SuccessResponse | ErrorResponse | number,
  status = 200
): NextResponse {
  const headers = {
    "Cache-Control": "max-age=0"
  };

  if (typeof bodyOrStatus === "number") {
    return new NextResponse(null, { status: bodyOrStatus, headers });
  }

  return NextResponse.json(bodyOrStatus, {
    status,
    headers
  });
}

async function parseJsonBody(request: NextRequest): Promise<HtmlLookupRequest | null> {
  try {
    return (await request.json()) as HtmlLookupRequest;
  } catch {
    return null;
  }
}

type TextResponse = {
  body: string;
  status: number;
};

function requestHeaders(accept: string): Record<string, string> {
  return {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:151.0) Gecko/20100101 Firefox/151.0",
    Accept: accept,
    "Accept-Language": "ko-KR",
    "Accept-Encoding": "gzip, deflate, br",
    DNT: "1",
    Priority: "u=0, i"
  };
}

function decodeResponse(response: IncomingMessage) {
  const headers = response.headers;
  const encoding = headers["content-encoding"];
  const contentEncoding = Array.isArray(encoding) ? encoding[0] : encoding;

  if (contentEncoding === "gzip") {
    return response.pipe(createGunzip());
  }

  if (contentEncoding === "deflate") {
    return response.pipe(createInflate());
  }

  if (contentEncoding === "br") {
    return response.pipe(createBrotliDecompress());
  }

  return response;
}

function requestText(url: string, headers: Record<string, string>): Promise<TextResponse> {
  return new Promise((resolve, reject) => {
    const outgoingRequest = httpsRequest(url, { headers }, (incomingResponse) => {
      const stream = decodeResponse(incomingResponse);
      let body = "";

      stream.setEncoding("utf8");
      stream.on("data", (chunk) => {
        body += chunk;
      });
      stream.on("end", () => {
        resolve({
          body,
          status: incomingResponse.statusCode ?? 0
        });
      });
      stream.on("error", reject);
    });

    outgoingRequest.setTimeout(15000, () => {
      outgoingRequest.destroy(new Error("Request timed out."));
    });
    outgoingRequest.on("error", reject);
    outgoingRequest.end();
  });
}

async function getStatus(url: string) {
  const response = await requestText(url, {
    ...requestHeaders(
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    ),
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none"
  });

  return { status: response.status };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return json(
      {
        error:
          "Pass a valid nhentai gallery URL with ?url="
      },
      400
    );
  }

  const result = await getStatus(url);

  return json(
    result.status
  );
}

export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request);
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!url) {
    return json(400);
  }

  const result = await getStatus(url);
  return json(result.status);
}
