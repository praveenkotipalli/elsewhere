// Liveness probe for Docker / load balancers. Deliberately touches nothing external.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true });
}
