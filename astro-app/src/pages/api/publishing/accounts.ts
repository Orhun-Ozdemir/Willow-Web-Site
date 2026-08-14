import type { APIRoute } from "astro";
import { withAdminAuth, jsonResponse } from "@/lib/admin-auth";
import { listPublishingAccounts } from "@/lib/publishing";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => withAdminAuth(request, "publishing.read", async () => {
  const accounts = await listPublishingAccounts();
  return jsonResponse({
    ok: true,
    accounts,
    missingPlatforms: ["linkedin", "instagram", "x"].filter(
      (platform) => !accounts.some((account) => account.platform === platform && account.status === "connected"),
    ),
  });
});
