const methodColors: Record<string, string> = {
  get: "text-sky-400",
  post: "text-emerald-400",
  put: "text-amber-400",
  patch: "text-yellow-300",
  delete: "text-red-400",
};

export function ApiMethod({ method }: { method: string }) {
  return (
    <span
      className={`ml-auto shrink-0 font-mono text-[10px] font-bold uppercase ${
        methodColors[method.toLowerCase()] ?? "text-[var(--text-muted)]"
      }`}
    >
      {method === "delete" ? "del" : method}
    </span>
  );
}
