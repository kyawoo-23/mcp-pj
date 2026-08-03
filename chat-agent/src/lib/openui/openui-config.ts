/**
 * Feature flag + shared constants for the render-only OpenUI integration.
 *
 * When disabled (default), the chat agent behaves exactly as before: assistant
 * replies render as Markdown only. When enabled, the model may additionally
 * emit a fenced OpenUI Lang block that we render with the OpenUI Renderer.
 *
 * The flag is `NEXT_PUBLIC_*` so both the API route (server) and the message
 * component (client) can read the same value.
 */
export const OPENUI_RENDERING_ENABLED =
  process.env.NEXT_PUBLIC_OPENUI_RENDERING === "true";

/** Info string used to tag OpenUI Lang fenced code blocks. */
export const OPENUI_FENCE_LANG = "openui";
