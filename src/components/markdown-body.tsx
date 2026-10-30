import { DocProse } from "@/components/doc-prose";

/**
 * Class string for prose containers. Typography lives in src/styles/doc.css under
 * `.doc-prose`; `prose` only supplies baseline list/blockquote/hr defaults.
 * Keep the `prose-h1:hidden` token: prose-page-layout strips it for chrome-less pages.
 */
const proseClasses = "doc-prose prose max-w-none min-w-0 prose-h1:hidden";

export function MarkdownBody({ html }: { html: string }) {
  return (
    <DocProse className={proseClasses}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </DocProse>
  );
}

export { proseClasses as docProseClasses };
