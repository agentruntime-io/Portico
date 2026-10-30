"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/status-page";
import { useSiteName } from "@/components/site-name-provider";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const siteName = useSiteName();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return <StatusPage kind="error" siteName={siteName} standalone error={error} reset={reset} />;
}
