import {

  defaultLocale,

  isLocale,

  type Locale,

} from "@/lib/i18n";



export function localeFromSlug(slug: string[]): {

  locale: Locale;

  contentSlug: string[];

} {

  if (slug.length > 0 && isLocale(slug[0])) {

    return { locale: slug[0], contentSlug: slug.slice(1) };

  }

  return { locale: defaultLocale, contentSlug: slug };

}



export function localeFromPathname(pathname: string): Locale {

  const first = pathname.split("/").filter(Boolean)[0];

  if (first && isLocale(first)) return first;

  return defaultLocale;

}



export function pagePathToHref(pagePath: string, locale: Locale = defaultLocale): string {

  const clean =

    pagePath === "index" || !pagePath ? "" : pagePath.replace(/^\//, "");

  if (locale === defaultLocale) {

    return clean ? `/${clean}` : "/";

  }

  return clean ? `/${locale}/${clean}` : `/${locale}`;

}



export function switchLocalePath(pathname: string, next: Locale): string {

  const parts = pathname.split("/").filter(Boolean);

  const rest =

    parts.length > 0 && isLocale(parts[0]) ? parts.slice(1) : parts;



  if (next === defaultLocale) {

    return rest.length ? `/${rest.join("/")}` : "/";

  }

  return rest.length ? `/${next}/${rest.join("/")}` : `/${next}`;

}



export function localizeHref(href: string, locale: Locale): string {

  if (

    !href.startsWith("/") ||

    href.startsWith("//") ||

    href.startsWith("/reference") ||

    href.startsWith("/changelog")

  ) {

    return href;

  }

  if (locale === defaultLocale) return href;

  if (href === `/${locale}` || href.startsWith(`/${locale}/`)) return href;

  return href === "/" ? `/${locale}` : `/${locale}${href}`;

}


