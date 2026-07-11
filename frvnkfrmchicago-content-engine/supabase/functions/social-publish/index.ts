// =============================================================================
// supabase/functions/social-publish/index.ts
// Edge Function: Publish a post to one or more social platforms.
// =============================================================================
// Receives: POST { post_id: string, platforms: string[] }
// Platforms: "linkedin", "threads", "instagram", "facebook"
//
// Each platform is published independently. One failure does not block
// the others. Results are returned per-platform and written back to the
// post's platform_post_ids column.
//
// Secrets required (set via `supabase secrets set`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN
//   THREADS_ACCESS_TOKEN, THREADS_USER_ID
//   INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ID
//   FACEBOOK_PAGE_TOKEN, FACEBOOK_PAGE_ID
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { waitAndPublish as threadsWaitAndPublish } from "../_shared/threads.ts";
import { createLinkedInPost } from "../_shared/linkedin.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PublishRequest {
  post_id: string;
  platforms: string[];
}

interface PlatformResult {
  platform: string;
  status: "success" | "error";
  postId?: string;
  error?: string;
}

interface PostRow {
  id: string;
  headline: string;
  caption: string | null;
  image_url: string | null;
  tags: string[];
  platform_post_ids: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Platform publishers
// ---------------------------------------------------------------------------

async function publishToLinkedIn(post: PostRow): Promise<PlatformResult> {
  const token = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  const authorUrn = Deno.env.get("LINKEDIN_AUTHOR_URN");

  if (!token || !authorUrn) {
    return { platform: "linkedin", status: "error", error: "Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN" };
  }

  const text = formatPostText(post);
  const result = await createLinkedInPost(token, authorUrn, text, post.image_url || undefined);

  if (result.success) {
    return { platform: "linkedin", status: "success", postId: result.postId };
  }
  return { platform: "linkedin", status: "error", error: result.error };
}

async function publishToThreads(post: PostRow): Promise<PlatformResult> {
  const token = Deno.env.get("THREADS_ACCESS_TOKEN");
  const userId = Deno.env.get("THREADS_USER_ID");

  if (!token || !userId) {
    return { platform: "threads", status: "error", error: "Missing THREADS_ACCESS_TOKEN or THREADS_USER_ID" };
  }

  const text = formatPostText(post);
  const result = await threadsWaitAndPublish(userId, token, text, post.image_url || undefined);

  if (result.success) {
    return { platform: "threads", status: "success", postId: result.postId };
  }
  return { platform: "threads", status: "error", error: result.error };
}

async function publishToInstagram(post: PostRow): Promise<PlatformResult> {
  const token = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  const businessId = Deno.env.get("INSTAGRAM_BUSINESS_ID");

  if (!token || !businessId) {
    return { platform: "instagram", status: "error", error: "Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ID" };
  }

  if (!post.image_url) {
    return { platform: "instagram", status: "error", error: "Instagram requires an image. No image_url on post." };
  }

  try {
    // Step 1: Create media container
    const caption = formatPostText(post);
    const containerParams = new URLSearchParams({
      access_token: token,
      image_url: post.image_url,
      caption,
    });

    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${businessId}/media?${containerParams.toString()}`,
      { method: "POST" },
    );

    if (!containerRes.ok) {
      const body = await containerRes.text();
      return { platform: "instagram", status: "error", error: `IG container error (${containerRes.status}): ${body}` };
    }

    const containerData = await containerRes.json() as { id: string };

    // Step 2: Wait for processing, then publish
    // Instagram also needs a brief wait for media processing.
    const maxAttempts = 12;
    const pollInterval = 5000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, pollInterval));

      // Check container status
      const statusParams = new URLSearchParams({
        access_token: token,
        fields: "status_code",
      });
      const statusRes = await fetch(
        `https://graph.facebook.com/v19.0/${containerData.id}?${statusParams.toString()}`,
      );

      if (statusRes.ok) {
        const statusData = await statusRes.json() as { status_code?: string };
        if (statusData.status_code === "FINISHED") {
          break;
        }
        if (statusData.status_code === "ERROR") {
          return { platform: "instagram", status: "error", error: "IG media container processing failed" };
        }
      }
    }

    // Publish
    const publishParams = new URLSearchParams({
      access_token: token,
      creation_id: containerData.id,
    });

    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${businessId}/media_publish?${publishParams.toString()}`,
      { method: "POST" },
    );

    if (!publishRes.ok) {
      const body = await publishRes.text();
      return { platform: "instagram", status: "error", error: `IG publish error (${publishRes.status}): ${body}` };
    }

    const publishData = await publishRes.json() as { id: string };
    return { platform: "instagram", status: "success", postId: publishData.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { platform: "instagram", status: "error", error: message };
  }
}

async function publishToFacebook(post: PostRow): Promise<PlatformResult> {
  const token = Deno.env.get("FACEBOOK_PAGE_TOKEN");
  const pageId = Deno.env.get("FACEBOOK_PAGE_ID");

  if (!token || !pageId) {
    return { platform: "facebook", status: "error", error: "Missing FACEBOOK_PAGE_TOKEN or FACEBOOK_PAGE_ID" };
  }

  try {
    const message = formatPostText(post);
    const params = new URLSearchParams({
      access_token: token,
      message,
    });

    if (post.image_url) {
      params.set("link", post.image_url);
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed?${params.toString()}`,
      { method: "POST" },
    );

    if (!response.ok) {
      const body = await response.text();
      return { platform: "facebook", status: "error", error: `FB error (${response.status}): ${body}` };
    }

    const data = await response.json() as { id: string };
    return { platform: "facebook", status: "success", postId: data.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { platform: "facebook", status: "error", error: message };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPostText(post: PostRow): string {
  const parts: string[] = [];

  if (post.headline) {
    parts.push(post.headline);
  }
  if (post.caption) {
    parts.push("");
    parts.push(post.caption);
  }
  if (post.tags && post.tags.length > 0) {
    parts.push("");
    parts.push(post.tags.join(" "));
  }

  return parts.join("\n");
}

const VALID_PLATFORMS = new Set(["linkedin", "threads", "instagram", "facebook"]);

const platformHandlers: Record<string, (post: PostRow) => Promise<PlatformResult>> = {
  linkedin: publishToLinkedIn,
  threads: publishToThreads,
  instagram: publishToInstagram,
  facebook: publishToFacebook,
};

// ---------------------------------------------------------------------------
// Edge Function handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  // Parse request body
  let body: PublishRequest;
  try {
    body = await req.json() as PublishRequest;
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { post_id, platforms } = body;

  if (!post_id || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "post_id and platforms[] are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate platform names
  const invalidPlatforms = platforms.filter((p) => !VALID_PLATFORMS.has(p));
  if (invalidPlatforms.length > 0) {
    return new Response(
      JSON.stringify({ success: false, error: `Invalid platforms: ${invalidPlatforms.join(", ")}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Initialize Supabase client with service role for full access
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Server misconfigured: missing Supabase credentials" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch the post
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("id, headline, caption, image_url, tags, platform_post_ids")
    .eq("id", post_id)
    .single();

  if (fetchError || !post) {
    return new Response(
      JSON.stringify({ success: false, error: fetchError?.message || "Post not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const typedPost = post as PostRow;

  // Publish to each platform concurrently
  const results = await Promise.allSettled(
    platforms.map((platform) => {
      const handler = platformHandlers[platform];
      return handler(typedPost);
    }),
  );

  // Collect results
  const platformResults: PlatformResult[] = results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      platform: platforms[index],
      status: "error" as const,
      error: result.reason?.message || "Unknown error",
    };
  });

  // Build updated platform_post_ids
  const updatedIds: Record<string, string> = { ...(typedPost.platform_post_ids || {}) };
  let anySuccess = false;

  for (const r of platformResults) {
    if (r.status === "success" && r.postId) {
      updatedIds[r.platform] = r.postId;
      anySuccess = true;
    }
  }

  // Update the post in the database
  if (anySuccess) {
    const updatePayload: Record<string, unknown> = {
      platform_post_ids: updatedIds,
      status: "published",
      published_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("posts")
      .update(updatePayload)
      .eq("id", post_id);

    if (updateError) {
      console.error("Failed to update post after publishing:", updateError.message);
    }
  }

  return new Response(
    JSON.stringify({
      success: anySuccess,
      results: platformResults,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
