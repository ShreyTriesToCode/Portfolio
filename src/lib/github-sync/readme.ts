export function extractReadmeSummary(markdown: string, maxLength = 360) {
  const lines = markdown
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !/^\[!\[.*\]\(.*\)\]\(.*\)/.test(line))
    .filter((line) => !/^!\[.*\]\(.*\)/.test(line))
    .filter((line) => !/<img\b/i.test(line))
    .filter((line) => !/^\[.*badge.*\]/i.test(line));

  for (const line of lines) {
    const clean = line
      .replace(/`{1,3}/g, "")
      .replace(/\*\*/g, "")
      .replace(/__/g, "")
      .replace(/~~/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/^[-*]\s+/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (clean.length >= 40 && /[a-zA-Z]/.test(clean)) {
      return clean.length > maxLength ? `${clean.slice(0, maxLength - 1).trim()}...` : clean;
    }
  }

  return "";
}
