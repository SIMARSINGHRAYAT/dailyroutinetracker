const DEVICE_ID_KEY = "drt-device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "default";
  }

  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id || id.trim().length === 0) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }

    // Mirror to cookie so server requests or future extensions can access it
    document.cookie = `${DEVICE_ID_KEY}=${encodeURIComponent(id)}; path=/; max-age=315360000; SameSite=Lax`;
    return id;
  } catch {
    return "default";
  }
}
