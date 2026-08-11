export const ASYNC_IMAGE_POLL_INTERVAL_MS = 2000;
export const ASYNC_IMAGE_TIMEOUT_MS = 10 * 60 * 1000;

export interface AsyncImageTaskResponse {
  task_id?: string;
  status?: "queued" | "processing" | "in_progress" | "completed" | "failed";
  progress?: number;
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: { message?: string; code?: string };
  [key: string]: unknown;
}

/**
 * RightAPI submits images below /draw, but exposes task queries at site level.
 * Browser requests must use our same-origin proxy because RightAPI's task
 * response does not include CORS headers.
 */
export function getAsyncImageTaskUrl(
  imageGenerationUrl: string,
  taskId: string,
): string {
  const encodedTaskId = encodeURIComponent(taskId);
  const generationPath = /\/v1\/images\/generations\/?(?:\?.*)?$/;

  if (!generationPath.test(imageGenerationUrl)) {
    throw new Error("Invalid image generation URL");
  }

  const taskUrl = imageGenerationUrl.replace(
    generationPath,
    `/v1/tasks/${encodedTaskId}`,
  );

  if (/^https?:\/\/(?:www\.)?rightapi\.ai\/draw\/v1\/tasks\//i.test(taskUrl)) {
    return `/api/proxy/rightapi/tasks/${encodedTaskId}`;
  }

  return taskUrl;
}

export function isPendingAsyncImageTask(status?: string): boolean {
  return ["queued", "processing", "in_progress"].includes(status ?? "");
}

export function getAsyncImageTaskError(task: AsyncImageTaskResponse): string {
  return task.error?.message || "Image generation task failed";
}

export function formatGeneratedImageMessage(url: string): string {
  if (!url) {
    throw new Error("Image generation completed without an image");
  }

  return `![Generated image](${getGeneratedImageUrl(url)})`;
}

/**
 * RightAPI may ignore response_format and return an image on a CDN that is
 * unreachable from the browser. Only that known CDN family is sent through
 * our same-origin image proxy; all other providers keep their original URL.
 */
export function getGeneratedImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "https:" &&
      /^file\d+\.aitohumanize\.com$/i.test(parsed.hostname)
    ) {
      return `/api/rightapi-image?url=${encodeURIComponent(parsed.href)}`;
    }
  } catch {
    // Preserve non-URL values so existing providers keep their behavior.
  }

  return url;
}

/** Route RightAPI's OpenAI-compatible requests to the correct product prefix. */
export function getRightApiBaseUrl(baseUrl: string, apiPath: string): string {
  if (
    !/^https?:\/\/(?:www\.)?rightapi\.ai\/(?:codex|draw)\/?$/i.test(baseUrl)
  ) {
    return baseUrl;
  }

  if (apiPath === "v1/images/generations") {
    return baseUrl.replace(/\/codex\/?$/i, "/draw");
  }

  if (apiPath === "v1/chat/completions") {
    return baseUrl.replace(/\/draw\/?$/i, "/codex");
  }

  return baseUrl;
}
