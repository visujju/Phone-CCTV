"use client";

import { memo, type ReactNode } from "react";

interface Props {
  label: string;
  rowKey: string;
  children: ReactNode;
}

function BookmarkRow({ label, rowKey, children }: Props) {
  return (
    <section className="relative z-10 mt-6" data-row={rowKey}>
      <div className="mb-2.5 flex items-center gap-3 px-6">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex gap-5 overflow-x-auto px-6 pb-2 pt-2">{children}</div>
    </section>
  );
}

export default memo(BookmarkRow);
