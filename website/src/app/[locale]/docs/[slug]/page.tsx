import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import {
	DOC_SLUGS,
	DocBody,
	getDoc,
	getDocNav,
} from "@/modules/docs/public.server";
import { routing } from "@/i18n/routing";
import { DocsSidebar } from "../_components/docs-sidebar";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
	return routing.locales.flatMap((locale) =>
		DOC_SLUGS.map((slug) => ({ locale, slug })),
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params;
	setRequestLocale(locale);
	const doc = await getDoc(locale, slug);
	if (!doc) return { title: "Docs" };
	return {
		title: doc.title,
		description: doc.description,
	};
}

export default async function DocPage({ params }: Props) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const doc =
		(await getDoc(locale, slug)) ??
		redirect({ href: "/docs/introducao", locale });

	const nav = await getDocNav(locale);
	const index = nav.findIndex((d) => d.slug === slug);
	const prev = index > 0 ? nav[index - 1] : null;
	const next = index >= 0 && index < nav.length - 1 ? nav[index + 1] : null;

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[220px_minmax(0,1fr)] md:px-8 md:py-14 lg:grid-cols-[240px_minmax(0,1fr)]">
			<DocsSidebar active={slug} locale={locale} />
			<article>
				<p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--cyan)]">
					{doc.section}
				</p>
				<h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em]">
					{doc.title}
				</h1>
				<p className="mt-3 max-w-2xl text-[color:var(--muted)]">
					{doc.description}
				</p>
				<div className="mt-8">
					<DocBody slug={slug} locale={locale} />
				</div>
				<nav className="mt-14 flex flex-col gap-3 border-t border-[color:var(--line)] pt-6 sm:flex-row sm:justify-between">
					{prev ? (
						<Link
							href={`/docs/${prev.slug}`}
							className="rounded-xl border border-[color:var(--line)] px-4 py-3 text-sm text-[color:var(--muted)] transition hover:border-[color:rgba(79,209,255,0.35)] hover:text-[color:var(--ink)]"
						>
							← {prev.title}
						</Link>
					) : (
						<span />
					)}
					{next ? (
						<Link
							href={`/docs/${next.slug}`}
							className="rounded-xl border border-[color:var(--line)] px-4 py-3 text-sm text-[color:var(--muted)] transition hover:border-[color:rgba(79,209,255,0.35)] hover:text-[color:var(--ink)] sm:text-right"
						>
							{next.title} →
						</Link>
					) : null}
				</nav>
			</article>
		</div>
	);
}
