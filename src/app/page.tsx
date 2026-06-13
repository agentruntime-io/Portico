import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n";
import { RenderDocPage, docPageMetadata } from "@/lib/render-doc-page";

export async function generateMetadata(): Promise<Metadata> {
  return docPageMetadata([], defaultLocale);
}

export default async function HomePage() {
  return <RenderDocPage locale={defaultLocale} contentSlug={[]} />;
}

