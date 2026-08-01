import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
	fetchLatestRelease,
	formatBytes,
	pickAssets,
	RELEASES_URL,
} from "@/modules/releases/public.server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "Download" });
	return {
		title: t("metadataTitle"),
		description: t("metadataDesc"),
	};
}

function dateLocale(locale: string) {
	if (locale === "pt") return "pt-BR";
	if (locale === "es") return "es";
	return "en";
}

export default async function DownloadPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("Download");

	const release = await fetchLatestRelease();
	const { setup, portable, tag } = pickAssets(release);

	return (
		<div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
			<div className="max-w-2xl">
				<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--mint)]">
					{t("eyebrow")}
				</p>
				<h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em] md:text-5xl">
					{t("title")}
				</h1>
				<p className="mt-4 text-lg text-[color:var(--muted)]">{t("subtitle")}</p>
				{tag ? (
					<p className="mt-4 text-sm text-[color:var(--cyan)]">
						{t("latestRelease")}{" "}
						<a
							href={release?.html_url}
							target="_blank"
							rel="noreferrer"
							className="underline-offset-2 hover:underline"
						>
							{tag}
						</a>
						{release?.published_at
							? ` · ${new Date(release.published_at).toLocaleDateString(dateLocale(locale))}`
							: null}
					</p>
				) : (
					<p className="mt-4 text-sm text-[color:var(--amber)]">
						{t("releaseFallback")}{" "}
						<a
							href={RELEASES_URL}
							target="_blank"
							rel="noreferrer"
							className="underline"
						>
							GitHub Releases
						</a>
						.
					</p>
				)}
			</div>

			<div className="mt-10 grid gap-4 md:grid-cols-2">
				<a
					href={setup?.browser_download_url ?? RELEASES_URL}
					className="group relative overflow-hidden rounded-[24px] border border-[color:rgba(79,209,255,0.35)] bg-[linear-gradient(145deg,rgba(79,209,255,0.14),rgba(6,9,18,0.7))] p-6 shadow-[var(--shadow)] transition hover:-translate-y-0.5"
				>
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--cyan)]">
						{t("recommended")}
					</p>
					<h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em]">
						{t("nsisTitle")}
					</h2>
					<p className="mt-2 text-sm text-[color:var(--muted)]">{t("nsisBody")}</p>
					<p className="mt-6 text-sm font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--cyan)]">
						{setup
							? t("downloadSetup", {
									name: setup.name,
									size: formatBytes(setup.size),
								})
							: t("openReleases")}
					</p>
				</a>

				<a
					href={portable?.browser_download_url ?? RELEASES_URL}
					className="rounded-[24px] border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.65)] p-6 transition hover:-translate-y-0.5 hover:border-[color:rgba(93,255,168,0.35)]"
				>
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--mint)]">
						{t("portable")}
					</p>
					<h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em]">
						{t("portableTitle")}
					</h2>
					<p className="mt-2 text-sm text-[color:var(--muted)]">
						{t("portableBody")}
					</p>
					<p className="mt-6 text-sm font-semibold">
						{portable
							? t("downloadPortable", {
									name: portable.name,
									size: formatBytes(portable.size),
								})
							: t("openReleases")}
					</p>
				</a>
			</div>

			<section className="mt-12 rounded-[24px] border border-[color:var(--line)] bg-[color:rgba(6,9,18,0.55)] p-6 md:p-8">
				<h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em]">
					{t("cliTitle")}
				</h2>
				<p className="mt-2 max-w-2xl text-[color:var(--muted)]">{t("cliBody")}</p>
				<pre className="mt-5 overflow-x-auto rounded-2xl border border-[color:var(--line)] bg-[#050910] p-4 text-sm text-[#d7e7ff]">
					{`git clone https://github.com/MatheusLTrindade/Teleagent.git
cd Teleagent
npm install
npm run build
npm link
teleagent setup --token <BOT_TOKEN> --allowed-user <ID>
teleagent serve`}
				</pre>
				<div className="mt-5 flex flex-wrap gap-3">
					<Link href="/docs/quickstart" className="btn btn-primary">
						{t("guide")}
					</Link>
					<a
						href={RELEASES_URL}
						target="_blank"
						rel="noreferrer"
						className="btn btn-ghost"
					>
						{t("allReleases")}
					</a>
				</div>
			</section>
		</div>
	);
}
