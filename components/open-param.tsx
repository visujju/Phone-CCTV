"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Reads ?open=ID and reports it once on mount (PWA shortcut deep links). */
export default function OpenParam({ onOpen }: { onOpen: (id: string | null) => void }) {
  const params = useSearchParams();
  useEffect(() => {
    onOpen(params.get("open"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
