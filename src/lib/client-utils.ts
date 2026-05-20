export type ActionResult = {
  ok: boolean;
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function validateContactInput(input: {
  name: string;
  email: string;
  message: string;
  website?: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (input.website?.trim()) return "Message could not be sent.";
  if (name.length < 2) return "Enter your name.";
  if (name.length > 80) return "Name must be under 80 characters.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (message.length < 10) return "Message must be at least 10 characters.";
  if (message.length > 1200) return "Message must be under 1200 characters.";
  return "";
}

export function safeExternalUrl(value?: string | null) {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function safeAssetUrl(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("/")) return value;
  return safeExternalUrl(value);
}

export async function copyText(value: string): Promise<ActionResult> {
  if (!value.trim()) return { ok: false, message: "Nothing to copy." };

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return { ok: true, message: "Copied" };
    }
  } catch {
    // Fall back below for browsers that block clipboard in this context.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied
      ? { ok: true, message: "Copied" }
      : { ok: false, message: "Copy failed" };
  } catch {
    return { ok: false, message: "Copy failed" };
  }
}

export function userSafeError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (error instanceof Error && /failed to fetch|network|timeout/i.test(error.message)) {
    return "Network request failed. Check your connection and try again.";
  }
  return fallback;
}

export function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 12000): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
  });

  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}
