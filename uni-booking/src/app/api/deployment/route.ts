import { NextResponse } from "next/server";
import { getDeploymentId } from "@/lib/deployment-id";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { id: getDeploymentId() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
