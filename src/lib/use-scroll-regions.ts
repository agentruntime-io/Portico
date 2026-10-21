"use client";

import { useEffect, type ReactNode, type RefObject } from "react";
import { useI18n } from "@/components/i18n-provider";

/**
 * Wide code blocks and tables become keyboard-focusable scroll containers.
 * Give each one a region role and an accessible name so it isn't an unnamed tab stop.
 */
export function useScrollRegions(
  rootRef: RefObject<HTMLElement | null>,
  deps: ReactNode,
) {
  const { t } = useI18n();
  const codeLabel = t("a11y.codeBlock");
  const tableLabel = t("a11y.table");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mark = () => {
      root.querySelectorAll<HTMLElement>("pre, .doc-table-wrap").forEach((el) => {
        const scrollable = el.scrollWidth > el.clientWidth + 1;
        if (scrollable) {
          el.tabIndex = 0;
          el.setAttribute("role", "region");
          el.setAttribute("aria-label", el.tagName === "PRE" ? codeLabel : tableLabel);
        } else if (el.getAttribute("role") === "region") {
          el.removeAttribute("role");
          el.removeAttribute("aria-label");
          if (el.getAttribute("tabindex") === "0") el.removeAttribute("tabindex");
        }
      });
    };

    mark();
    window.addEventListener("resize", mark);
    return () => window.removeEventListener("resize", mark);
  }, [rootRef, deps, codeLabel, tableLabel]);
}
