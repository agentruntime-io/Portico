import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSiteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return buildPageMetadata({
    site,
    title: "API reference",
    description: "OpenAPI-powered reference documentation.",
    canonicalPath: "/reference",
  });
}

export default async function ReferenceIndexPage() {
  const site = await getSiteConfig();
  const first = site.openapi.specs[0];
  redirect(first ? `/reference/${first.id}` : "/");
}
