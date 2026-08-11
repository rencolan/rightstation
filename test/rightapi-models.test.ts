import {
  isRightApiModel,
  RIGHTAPI_CUSTOM_MODELS,
  RIGHTAPI_IMAGE_MODELS,
  RIGHTAPI_TEXT_MODELS,
} from "../app/utils/rightapi-models";

describe("RightAPI model defaults", () => {
  test("uses the requested text and image defaults", () => {
    expect(RIGHTAPI_TEXT_MODELS).toContain("gpt-5.5");
    expect(RIGHTAPI_IMAGE_MODELS).toContain("gpt-image-2");
    expect(RIGHTAPI_CUSTOM_MODELS).toContain("gpt-5.5@OpenAI");
  });

  test("separates RightAPI and other-interface models", () => {
    expect(
      isRightApiModel({
        name: "runtime-model",
        provider: { providerType: "rightapi" },
      }),
    ).toBe(true);
    expect(isRightApiModel({ name: "gpt-image-2" })).toBe(true);
    expect(isRightApiModel({ name: "legacy-model" })).toBe(false);
  });
});
