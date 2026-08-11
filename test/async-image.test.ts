import {
  formatGeneratedImageMessage,
  getAsyncImageTaskError,
  getAsyncImageTaskUrl,
  getRightApiBaseUrl,
  isPendingAsyncImageTask,
} from "../app/utils/async-image";
import { isImageGenerationModel } from "../app/utils";

describe("RightAPI asynchronous image helpers", () => {
  test("routes RightAPI task polling through the same-origin proxy", () => {
    expect(
      getAsyncImageTaskUrl(
        "https://www.rightapi.ai/draw/v1/images/generations",
        "task_123",
      ),
    ).toBe("/api/proxy/rightapi/tasks/task_123");
  });

  test("encodes RightAPI task IDs in the proxy URL", () => {
    expect(
      getAsyncImageTaskUrl(
        "https://rightapi.ai/draw/v1/images/generations",
        "task/with spaces",
      ),
    ).toBe("/api/proxy/rightapi/tasks/task%2Fwith%20spaces");
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

  test("formats completed images for the chat Markdown renderer", () => {
    expect(formatGeneratedImageMessage("https://cdn.example.com/image.png"))
      .toBe("![Generated image](https://cdn.example.com/image.png)");
    expect(() => formatGeneratedImageMessage("")).toThrow(
      "Image generation completed without an image",
    );
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
