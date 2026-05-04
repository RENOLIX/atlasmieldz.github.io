import { fetchMetaPixelSettings } from "@/lib/supabase";
import type { MetaPixelSettings } from "@/types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const fallbackSettings: MetaPixelSettings = {
  enabled: true,
  pixelId: "801705945953894",
};

let cachedSettings: MetaPixelSettings | null = null;
let settingsPromise: Promise<MetaPixelSettings> | null = null;
let scriptInjected = false;
let initializedPixelId = "";

async function loadSettings() {
  if (cachedSettings) return cachedSettings;
  if (!settingsPromise) {
    settingsPromise = fetchMetaPixelSettings()
      .catch(() => fallbackSettings)
      .then((settings) => {
        cachedSettings = settings.pixelId ? settings : fallbackSettings;
        return cachedSettings;
      });
  }
  return settingsPromise;
}

function injectScript() {
  if (scriptInjected || typeof document === "undefined") return;
  if (document.getElementById("atlas-meta-pixel")) {
    scriptInjected = true;
    return;
  }

  const script = document.createElement("script");
  script.id = "atlas-meta-pixel";
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  scriptInjected = true;
}

function ensureFbqStub() {
  if (typeof window === "undefined" || window.fbq) return;

  const fbq = function (...args: unknown[]) {
    (fbq as unknown as { queue?: unknown[][] }).queue ??= [];
    (fbq as unknown as { queue: unknown[][] }).queue.push(args);
  };

  (fbq as unknown as { push?: (...args: unknown[]) => void }).push = fbq;
  (fbq as unknown as { loaded?: boolean }).loaded = true;
  (fbq as unknown as { version?: string }).version = "2.0";
  (fbq as unknown as { queue?: unknown[][] }).queue = [];
  window.fbq = fbq as unknown as typeof window.fbq;
  window._fbq = window.fbq;
}

export async function ensurePixelReady() {
  const settings = await loadSettings();
  if (!settings.enabled || !settings.pixelId || typeof window === "undefined") {
    return null;
  }

  ensureFbqStub();
  injectScript();

  if (initializedPixelId !== settings.pixelId && window.fbq) {
    window.fbq("set", "autoConfig", false, settings.pixelId);
    window.fbq("init", settings.pixelId);
    initializedPixelId = settings.pixelId;
  }

  return settings;
}

export async function trackPixel(
  eventName: "PageView" | "ViewContent" | "Purchase",
  params?: Record<string, unknown>,
  meta?: Record<string, unknown>,
) {
  const settings = await ensurePixelReady();
  if (!settings || !window.fbq) return false;

  console.log("[MetaPixel track]", {
    event: eventName,
    url: typeof window !== "undefined" ? window.location.href : "",
    ...meta,
    params,
  });

  if (eventName === "PageView") {
    window.fbq("track", "PageView");
  } else {
    window.fbq("track", eventName, params ?? {});
  }

  return true;
}

export function resetPixelCache() {
  cachedSettings = null;
  settingsPromise = null;
}
