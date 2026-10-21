const LABELS: Record<string, string> = {
  ai: "AI",
  api: "API",
  mcp: "MCP",
  llm: "LLM",
  ui: "UI",
  sdk: "SDK",
  cli: "CLI",
  ide: "IDE",
};

/** "ai" → "AI", "workflows" → "Workflows", "agent-service" → "Agent Service". */
export function formatArea(value: string): string {
  return value
    .split(/[-_/]/)
    .map((part) => LABELS[part.toLowerCase()] ?? part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
