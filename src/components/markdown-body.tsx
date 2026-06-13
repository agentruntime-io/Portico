import { DocProse } from "@/components/doc-prose";

const proseClasses =
  "doc-prose prose prose-zinc max-w-none min-w-0 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:tracking-tight prose-h1:hidden prose-h2:mt-10 prose-h2:text-xl prose-h3:mt-8 prose-h3:text-lg sm:prose-h2:mt-14 sm:prose-h2:text-2xl sm:prose-h3:mt-9 sm:prose-h3:text-xl prose-p:leading-7 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:border-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-xs sm:prose-pre:text-sm prose-table:my-0";

export function MarkdownBody({ html }: { html: string }) {
  return (
    <DocProse className={proseClasses}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </DocProse>
  );
}

export { proseClasses as docProseClasses };
