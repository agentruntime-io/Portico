import type { ReactNode } from "react";

/** Numbered steps: 30px counter circles joined by a 1px connector, bold run-in title. */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="ds-steps" role="list">
      {children}
    </ol>
  );
}

export function Step({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="ds-step">
      <div className="ds-step-body">
        <strong className="ds-step-title">{title}</strong> {children}
      </div>
    </li>
  );
}
