"use client";

import { CopyPageButton } from "@/components/copy-page-button";
import { EditPageButton } from "@/components/edit-page-button";

export function PageActions({ editUrl }: { editUrl?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyPageButton />
      {editUrl ? <EditPageButton url={editUrl} /> : null}
    </div>
  );
}
