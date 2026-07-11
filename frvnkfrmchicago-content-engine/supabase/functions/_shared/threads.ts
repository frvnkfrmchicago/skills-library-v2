// =============================================================================
// supabase/functions/_shared/threads.ts
// Threads API helpers for the 2-step publish flow.
// =============================================================================
// Meta Threads uses a two-step process:
//   1. Create a media container (POST /threads)
//   2. Wait for processing (~30s)
//   3. Publish the container (POST /threads_publish)
//
// Reference: https://developers.facebook.com/docs/threads/posts
// =============================================================================

const THREADS_API_BASE = "https://graph.threads.net/v1.0";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThreadsContainerResponse {
  id: string;
}

export interface ThreadsPublishResponse {
  id: string;
}

export interface ThreadsStatusResponse {
  id: string;
  status: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
  error_message?: string;
}

export interface ThreadsResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Create a media container
// ---------------------------------------------------------------------------

export async function createThreadsContainer(
  userId: string,
  accessToken: string,
  text: string,
  imageUrl?: string,
): Promise<ThreadsContainerResponse> {
  const params = new URLSearchParams({
    access_token: accessToken,
    text,
    media_type: imageUrl ? "IMAGE" : "TEXT",
  });

  if (imageUrl) {
    params.set("image_url", imageUrl);
  }

  const response = await fetch(
    `${THREADS_API_BASE}/${userId}/threads?${params.toString()}`,
    { method: "POST" },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Threads container creation failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<ThreadsContainerResponse>;
}

// ---------------------------------------------------------------------------
// Check container status
// ---------------------------------------------------------------------------

async function checkContainerStatus(
  containerId: string,
  accessToken: string,
): Promise<ThreadsStatusResponse> {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "id,status,error_message",
  });

  const response = await fetch(
    `${THREADS_API_BASE}/${containerId}?${params.toString()}`,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Threads status check failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<ThreadsStatusResponse>;
}

// ---------------------------------------------------------------------------
// Publish a processed container
// ---------------------------------------------------------------------------

export async function publishThreadsContainer(
  userId: string,
  accessToken: string,
  containerId: string,
): Promise<ThreadsPublishResponse> {
  const params = new URLSearchParams({
    access_token: accessToken,
    creation_id: containerId,
  });

  const response = await fetch(
    `${THREADS_API_BASE}/${userId}/threads_publish?${params.toString()}`,
    { method: "POST" },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Threads publish failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<ThreadsPublishResponse>;
}

// ---------------------------------------------------------------------------
// Wait for container processing and publish
// ---------------------------------------------------------------------------
// Polls the container status every 5 seconds for up to 60 seconds.
// The Threads API documentation recommends waiting ~30 seconds before
// attempting to publish, but processing time varies.

export async function waitAndPublish(
  userId: string,
  accessToken: string,
  text: string,
  imageUrl?: string,
): Promise<ThreadsResult> {
  try {
    // Step 1: Create container
    const container = await createThreadsContainer(userId, accessToken, text, imageUrl);

    // Step 2: Poll until FINISHED or timeout
    const maxAttempts = 12; // 12 * 5s = 60s max wait
    const pollIntervalMs = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      const status = await checkContainerStatus(container.id, accessToken);

      if (status.status === "FINISHED") {
        // Step 3: Publish
        const published = await publishThreadsContainer(userId, accessToken, container.id);
        return { success: true, postId: published.id };
      }

      if (status.status === "ERROR" || status.status === "EXPIRED") {
        return {
          success: false,
          error: `Container ${status.status}: ${status.error_message || "unknown error"}`,
        };
      }

      // IN_PROGRESS -- keep polling
    }

    return { success: false, error: "Container processing timed out after 60 seconds" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
