import { api } from "@/server/api";

// Wrapped rather than exported directly so `this` stays bound to the instance.
const handle = (request: Request) => api.handle(request);

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
