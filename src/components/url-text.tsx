import { Fragment } from "react";

/** Renders a URL with <wbr> after path separators so it wraps at boundaries, not mid-word. */
export function UrlText({ url }: { url: string }) {
  const parts = url.split(/(?<=[/.?&=_-])/);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 ? <wbr /> : null}
        </Fragment>
      ))}
    </>
  );
}
