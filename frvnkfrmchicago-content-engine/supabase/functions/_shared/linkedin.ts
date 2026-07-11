// =============================================================================
// supabase/functions/_shared/linkedin.ts
// LinkedIn UGC Post API helpers.
// =============================================================================
// Reference: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api
// =============================================================================

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LinkedInMediaContent {
  status: string;
  description?: {
    text: string;
  };
  media?: {
    status: string;
    originalUrl: string;
  };
  title?: {
    text: string;
  };
}

export interface LinkedInUGCPostRequest {
  author: string;
  lifecycleState: "PUBLISHED";
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: "NONE" | "IMAGE" | "ARTICLE";
      media?: Array<{
        status: string;
        originalUrl: string;
        description?: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" | "CONNECTIONS";
  };
}

export interface LinkedInPostResponse {
  id: string;
}

export interface LinkedInResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Create a LinkedIn UGC post
// ---------------------------------------------------------------------------

export async function createLinkedInPost(
  accessToken: string,
  authorUrn: string,
  text: string,
  imageUrl?: string,
): Promise<LinkedInResult> {
  try {
    const shareContent: LinkedInUGCPostRequest["specificContent"]["com.linkedin.ugc.ShareContent"] = {
      shareCommentary: { text },
      shareMediaCategory: imageUrl ? "IMAGE" : "NONE",
    };

    if (imageUrl) {
      shareContent.media = [
        {
          status: "READY",
          originalUrl: imageUrl,
        },
      ];
    }

    const body: LinkedInUGCPostRequest = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": shareContent,
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `LinkedIn API error (${response.status}): ${errorBody}`,
      };
    }

    // LinkedIn returns the post URN in the x-restli-id header or response body
    const headerUrn = response.headers.get("x-restli-id");
    let postId = headerUrn || "";

    if (!postId) {
      try {
        const data = await response.json() as LinkedInPostResponse;
        postId = data.id || "";
      } catch {
        // Some LinkedIn endpoints return 201 with no body
        postId = "created";
      }
    }

    return { success: true, postId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
