import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SPONSOR_URL } from "@/modules/support/public";

type Props = { params: Promise<{ locale: string }> };

const REASON_KEYS = ["pace", "value", "transparent"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "SupportPage" });
	return {
		title: t("metadataTitle"),
		description: t("metadataDesc"),
	};
}

export default async function SupportPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("SupportPage");

	return (
		<div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
			<div className="max-w-2xl">
				<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--amber)]">
					{t("eyebrow")}
				</p>
				<h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em] md:text-5xl">
					{t("title")}
				</h1>
				<p className="mt-4 text-lg text-[color:var(--muted)]">{t("subtitle")}</p>
			</div>

			<div className="mt-10 grid gap-4 md:grid-cols-3">
				{REASON_KEYS.map((key) => (
					<div
						key={key}
						className="rounded-[22px] border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.55)] p-5"
					>
						<h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]">
							{t(`reasons.${key}.title`)}
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
							{t(`reasons.${key}.body`)}
						</p>
					</div>
				))}
			</div>

			<section className="mt-12 overflow-hidden rounded-[28px] border border-[color:rgba(255,200,87,0.28)] bg-[linear-gradient(135deg,rgba(255,200,87,0.1),rgba(6,9,18,0.7))] p-6 shadow-[var(--shadow)] md:p-10">
				<h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em] md:text-3xl">
					{t("sponsorsTitle")}
				</h2>
				<p className="mt-3 max-w-2xl text-[color:var(--muted)]">
					{t("sponsorsBody")}
				</p>
				<div className="mt-7 flex flex-wrap gap-3">
					<a
						href={SPONSOR_URL}
						target="_blank"
						rel="noreferrer"
						className="btn btn-primary"
					>
						{t("openSponsors")}
					</a>
					<Link href="/docs" className="btn btn-ghost">
						{t("backDocs")}
					</Link>
				</div>
				<p className="mt-6 text-xs text-[color:var(--muted)]">
					{t("linkLabel")}{" "}
					<a
						href={SPONSOR_URL}
						target="_blank"
						rel="noreferrer"
						className="text-[color:var(--cyan)] underline-offset-2 hover:underline"
					>
						{SPONSOR_URL}
					</a>
				</p>
			</section>
		</div>
	);
}
