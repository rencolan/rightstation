import {
  getAsyncImageTaskError,
  getAsyncImageTaskUrl,
  getRightApiBaseUrl,
  isPendingAsyncImageTask,
} from "../app/utils/async-image";
import { isImageGenerationModel } from "../app/utils";

describe("RightAPI asynchronous image helpers", () => {
  test("builds the site-level RightAPI task URL", () => {
    expect(
      getAsyncImageTaskUrl(
        "https://www.rightapi.ai/draw/v1/images/generations",
        "task_123",
      ),
    ).toBe("https://www.rightapi.ai/v1/tasks/task_123");
  });

  test("keeps the local OpenAI proxy prefix", () => {
    expect(
      getAsyncImageTaskUrl("/api/openai/v1/images/generations", "task_123"),
    ).toBe("/api/openai/v1/tasks/task_123");
  });

  test("recognizes pending and failed task responses", () => {
    expect(isPendingAsyncImageTask("queued")).toBe(true);
    expect(isPendingAsyncImageTask("in_progress")).toBe(true);
    expect(isPendingAsyncImageTask("completed")).toBe(false);
    expect(
      getAsyncImageTaskError({ error: { message: "upstream failed" } }),
    ).toBe("upstream failed");
  });

  test("recognizes RightAPI image model families", () => {
    expect(isImageGenerationModel("nano-banana-fast")).toBe(true);
    expect(isImageGenerationModel("gpt-image-1.5-vip")).toBe(true);
    expect(isImageGenerationModel("gpt-image-2")).toBe(true);
    expect(isImageGenerationModel("gpt-4o")).toBe(false);
  });

  test("routes RightAPI text and image requests to their product prefixes", () => {
    expect(
      getRightApiBaseUrl(
        "https://www.rightapi.ai/codex",
        "v1/images/generations",
      ),
    ).toBe("https://www.rightapi.ai/draw");
    expect(
      getRightApiBaseUrl("https://www.rightapi.ai/draw", "v1/chat/completions"),
    ).toBe("https://www.rightapi.ai/codex");
  });
});
