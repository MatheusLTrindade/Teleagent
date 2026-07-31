import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DocBody } from "@/app/docs/_components/doc-bodies";
import { DocsSidebar } from "@/app/docs/_components/docs-sidebar";
import { DOC_NAV, getDoc } from "@/modules/docs/public";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
	return DOC_NAV.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const doc = getDoc(slug);
	if (!doc) return { title: "Docs" };
	return {
		title: doc.title,
		description: doc.description,
	};
}

export default async function DocPage({ params }: Props) {
	const { slug } = await params;
	const doc = getDoc(slug);
	if (!doc) redirect("/docs/introducao");

	const index = DOC_NAV.findIndex((d) => d.slug === slug);
	const prev = index > 0 ? DOC_NAV[index - 1] : null;
	const next = index >= 0 && index < DOC_NAV.length - 1 ? DOC_NAV[index + 1] : null;

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[220px_minmax(0,1fr)] md:px-8 md:py-14 lg:grid-cols-[240px_minmax(0,1fr)]">
			<DocsSidebar active={slug} />
			<article>
				<p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--cyan)]">
					{doc.section}
				</p>
				<h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em]">
					{doc.title}
				</h1>
				<p className="mt-3 max-w-2xl text-[color:var(--muted)]">{doc.description}</p>
				<div className="mt-8">
					<DocBody slug={slug} />
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
