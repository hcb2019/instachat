export function GET() {
  return Response.json({ status: "ok", service: "instachat" }, { headers: { "Cache-Control": "no-store" } });
}
