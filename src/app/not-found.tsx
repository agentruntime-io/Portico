import { headers } from "next/headers";
import { DocsShell } from "@/components/docs-shell";
import { StatusPage } from "@/components/status-page";
import { isLocale, type Locale } from "@/lib/i18n";
import { resolveMainNav } from "@/lib/main-nav";
import { getNavigation } from "@/lib/nav";
import { getSiteConfig } from "@/lib/site";

export default async function NotFound() {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get("x-doc-locale") ?? "";
  const locale: Locale = isLocale(headerLocale) ? headerLocale : "en";
  const [site, nav] = await Promise.all([getSiteConfig(), getNavigation(locale)]);

  return (
    <DocsShell
      siteName={site.name}
      nav={nav}
      activePath="/__not-found"
      navbar={site.navbar}
      mainNav={resolveMainNav(nav, site)}
    >
      <StatusPage kind="notFound" siteName={site.name} />
    </DocsShell>
  );
}
