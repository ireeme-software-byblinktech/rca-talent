import { env } from "@/lib/config/env";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const backendUrl = `${env.apiUrl}/portfolio/${encodeURIComponent(slug)}/cv`;

  let response: Response;
  try {
    response = await fetch(backendUrl, { cache: "no-store" });
  } catch {
    return new Response("Unable to reach CV service", { status: 502 });
  }

  if (!response.ok) {
    const message =
      response.status === 404
        ? "CV not available"
        : "Failed to download CV";
    return new Response(message, { status: response.status });
  }

  const headers = new Headers();
  const contentType = response.headers.get("Content-Type");
  const contentDisposition = response.headers.get("Content-Disposition");
  const contentLength = response.headers.get("Content-Length");

  if (contentType) headers.set("Content-Type", contentType);
  if (contentDisposition) headers.set("Content-Disposition", contentDisposition);
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(response.body, {
    status: 200,
    headers,
  });
}
