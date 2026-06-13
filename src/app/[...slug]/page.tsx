import type { Metadata } from "next";

import { listLocalizedSlugSegments } from "@/lib/locale-content";
import { localeFromSlug } from "@/lib/locale-routing";

import { RenderDocPage, docPageMetadata } from "@/lib/render-doc-page";



type Props = { params: Promise<{ slug: string[] }> };



export async function generateStaticParams() {

  const slugs = await listLocalizedSlugSegments();

  return slugs

    .filter((slug) => slug.length > 0)

    .map((slug) => ({ slug }));

}



export async function generateMetadata({ params }: Props): Promise<Metadata> {

  const { slug } = await params;

  const { locale, contentSlug } = localeFromSlug(slug);

  return docPageMetadata(contentSlug, locale);

}



export default async function DocMdxPage({ params }: Props) {

  const { slug } = await params;

  const { locale, contentSlug } = localeFromSlug(slug);

  return <RenderDocPage locale={locale} contentSlug={contentSlug} />;

}


