import { env } from "@/lib/env";
import { createDeletionConfirmation, deleteMetaDerivedData, verifyMetaSignedRequest } from "@/server/meta-user-data";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 12_000) return Response.json({ error: "Payload too large" }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const signedRequest = form?.get("signed_request");
  const payload = typeof signedRequest === "string" ? verifyMetaSignedRequest(signedRequest) : null;
  if (!payload?.user_id) return Response.json({ error: "Invalid signed request" }, { status: 401 });
  await deleteMetaDerivedData(payload.user_id);
  const confirmationCode = createDeletionConfirmation();
  return Response.json({
    url: `${env.APP_ORIGIN.replace(/\/$/, "")}/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  }, { headers: { "Cache-Control": "no-store" } });
}
