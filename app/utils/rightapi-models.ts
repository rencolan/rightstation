export const RIGHTAPI_TEXT_MODELS = [
  "codex-auto-review",
  "gpt-5.4",
  "gpt-5.4-mini",
  "gpt-5.5",
  "gpt-5.5-openai-compact",
  "gpt-5.6-luna",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
] as const;

export const RIGHTAPI_IMAGE_MODELS = [
  "gpt-image-2",
  "gpt-image-2-vip",
  "nano-banana",
  "nano-banana-2",
  "nano-banana-2-lite",
  "nano-banana-pro",
] as const;

export const RIGHTAPI_FALLBACK_MODELS = [
  ...RIGHTAPI_TEXT_MODELS,
  ...RIGHTAPI_IMAGE_MODELS,
];

const fallbackNames = new Set<string>(RIGHTAPI_FALLBACK_MODELS);

export function isRightApiModel(model: {
  name: string;
  provider?: { providerType?: string };
}) {
  return (
    model.provider?.providerType === "rightapi" || fallbackNames.has(model.name)
  );
}

export const RIGHTAPI_CUSTOM_MODELS = RIGHTAPI_FALLBACK_MODELS.map(
  (name) => `${name}@OpenAI`,
).join(",");
