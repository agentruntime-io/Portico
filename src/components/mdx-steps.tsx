import type { ReactNode } from "react";

export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="my-6 list-none space-y-5 border-l-2 border-emerald-500/30 pl-4 sm:space-y-6 sm:pl-6">
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
    <li className="relative">
      <span className="absolute -left-[calc(1rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 sm:-left-[calc(1.5rem+5px)]" />
      <p className="font-semibold text-[var(--text-main)]">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] [&>p:first-child]:mt-0">
        {children}
      </div>
    </li>
  );
}
