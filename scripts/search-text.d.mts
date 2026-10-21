export const MAX_BODY_CHARS: number;
export function stripMarkdown(src: unknown): string;
export function extractHeadingTexts(content: unknown): string[];
export function textEntry(
  url: string,
  title: string,
  markdown: string,
  options?: { excerptLength?: number },
): {
  url: string;
  title: string;
  headings: string[];
  excerpt: string;
  body: string;
  code: string;
};
export function splitProseAndCode(markdown: unknown): { prose: string; code: string };
