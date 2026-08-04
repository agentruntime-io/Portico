import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiSpecPicker } from "@/components/api-spec-picker";
import { DocsShell } from "@/components/docs-shell";
import { getNavigation } from "@/lib/nav";
import { resolveMainNav } from "@/lib/main-nav";
import { excerptFromBody, buildPageMetadata } from "@/lib/seo";
import { getMessages } from "@/lib/i18n";
import { loadBundledSpec } from "@/lib/openapi/core";
import { getSiteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const messages = getMessages("en");
  return buildPageMetadata({
    site,
    title: messages.api.referenceIndexTitle,
    description: messages.api.referenceIndexDescription,
    canonicalPath: "/reference",
  });
}

export default async function ReferenceIndexPage() {
  const site = await getSiteConfig();
  const specs = site.openapi.specs;

  if (specs.length === 0) redirect("/");
  if (specs.length === 1) redirect(`/reference/${specs[0]!.id}`);

  const [nav, ...docs] = await Promise.all([
    getNavigation(),
    ...specs.map((spec) => loadBundledSpec(spec.file)),
  ]);
  const mainNav = resolveMainNav(nav, site);
  const messages = getMessages("en");
  const descriptions = Object.fromEntries(
    specs.map((spec, index) => [
      spec.id,
      excerptFromBody(docs[index]?.info?.description ?? ""),
    ]),
  );

  return (
    <DocsShell
      siteName={site.name}
      nav={nav}
      activePath="/reference"
      navbar={site.navbar}
      mainNav={mainNav}
    >
      <ApiSpecPicker
        specs={specs}
        descriptions={descriptions}
        labels={{
          title: messages.api.referenceIndexTitle,
          description: messages.api.referenceIndexDescription,
          viewReference: messages.api.viewReference,
        }}
      />
    </DocsShell>
  );
}
