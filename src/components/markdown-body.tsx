import { DocProse } from "@/components/doc-prose";

const proseClasses =
  "doc-prose prose max-w-none min-w-0 prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:hidden prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-9 prose-h3:text-xl sm:prose-h2:mt-16 sm:prose-h2:text-[1.625rem] sm:prose-h3:mt-10 sm:prose-h3:text-xl prose-p:my-5 prose-p:leading-7 prose-li:my-1.5 prose-li:leading-7 prose-blockquote:font-normal prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:border-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-xs sm:prose-pre:text-sm prose-table:my-0";

export function MarkdownBody({ html }: { html: string }) {
  return (
    <DocProse className={proseClasses}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </DocProse>
  );
}

export { proseClasses as docProseClasses };
