import Script from "next/script";

type JsonLd = Record<string, unknown>;

function contentId(content: string): string {
  let hash = 0;
  for (let index = 0; index < content.length; index += 1) {
    hash = Math.imul(31, hash) + content.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

export function StructuredData({
  data,
}: {
  data: JsonLd | JsonLd[];
}) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item) => {
        const content = JSON.stringify(item).replace(/</g, "\\u003c");
        const id = `structured-data-${contentId(content)}`;
        return (
          <Script
            key={id}
            id={id}
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      })}
    </>
  );
}
