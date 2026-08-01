import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
	const t = await getTranslations("Footer");

	return (
		<footer className="mt-24 border-t border-[color:var(--line)]">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
				<div>
					<p className="font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.04em]">
						Teleagent
					</p>
					<p className="mt-2 max-w-md text-sm text-[color:var(--muted)]">
						{t("tagline")}
					</p>
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--muted)]">
					<Link href="/download" className="hover:text-[color:var(--ink)]">
						{t("download")}
					</Link>
					<Link href="/docs" className="hover:text-[color:var(--ink)]">
						{t("docs")}
					</Link>
					<Link href="/apoiar" className="hover:text-[color:var(--amber)]">
						{t("support")}
					</Link>
					<a
						href="https://github.com/MatheusLTrindade/Teleagent/releases"
						target="_blank"
						rel="noreferrer"
						className="hover:text-[color:var(--ink)]"
					>
						{t("releases")}
					</a>
					<a
						href="https://github.com/MatheusLTrindade/Teleagent"
						target="_blank"
						rel="noreferrer"
						className="hover:text-[color:var(--ink)]"
					>
						{t("code")}
					</a>
				</div>
			</div>
			<div className="border-t border-[color:var(--line)]">
				<p className="mx-auto max-w-6xl px-5 py-4 text-xs text-[color:var(--muted)] md:px-8">
					{t("copyright")}
				</p>
			</div>
		</footer>
	);
}
