export function GET() {
  return Response.json({ status: "ok", service: "vortex" }, { headers: { "Cache-Control": "no-store" } });
}
