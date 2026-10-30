"use client";

import { CopyPageButton } from "@/components/copy-page-button";
import { EditPageButton } from "@/components/edit-page-button";

export function PageActions({ editUrl }: { editUrl?: string }) {
  return (
    <div className="-ml-2 flex flex-wrap items-center gap-1">
      <CopyPageButton />
      {editUrl ? <EditPageButton url={editUrl} /> : null}
    </div>
  );
}
