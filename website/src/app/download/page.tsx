import type { Metadata } from "next";
import Link from "next/link";
import {
	fetchLatestRelease,
	formatBytes,
	pickAssets,
	RELEASES_URL,
} from "@/modules/releases/public.server";

export const metadata: Metadata = {
	title: "Download",
	description: "Baixe o Teleagent para Windows ou clone a CLI.",
};

export default async function DownloadPage() {
	const release = await fetchLatestRelease();
	const { setup, portable, tag } = pickAssets(release);

	return (
		<div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
			<div className="max-w-2xl">
				<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--mint)]">
					Download
				</p>
				<h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em] md:text-5xl">
					Leve o bridge para a bandeja.
				</h1>
				<p className="mt-4 text-lg text-[color:var(--muted)]">
					Instalador com auto-update, portable sem instalação, ou CLI via npm
					para qualquer OS com Node 20+.
				</p>
				{tag ? (
					<p className="mt-4 text-sm text-[color:var(--cyan)]">
						Última release:{" "}
						<a
							href={release?.html_url}
							target="_blank"
							rel="noreferrer"
							className="underline-offset-2 hover:underline"
						>
							{tag}
						</a>
						{release?.published_at
							? ` · ${new Date(release.published_at).toLocaleDateString("pt-BR")}`
							: null}
					</p>
				) : (
					<p className="mt-4 text-sm text-[color:var(--amber)]">
						Não foi possível ler a última release agora. Use o{" "}
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
						Recomendado
					</p>
					<h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em]">
						Instalador NSIS
					</h2>
					<p className="mt-2 text-sm text-[color:var(--muted)]">
						Teleagent-Setup — bandeja, hub e auto-update via GitHub Releases.
					</p>
					<p className="mt-6 text-sm font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--cyan)]">
						{setup
							? `Baixar ${setup.name} · ${formatBytes(setup.size)}`
							: "Abrir releases →"}
					</p>
				</a>

				<a
					href={portable?.browser_download_url ?? RELEASES_URL}
					className="rounded-[24px] border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.65)] p-6 transition hover:-translate-y-0.5 hover:border-[color:rgba(93,255,168,0.35)]"
				>
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--mint)]">
						Portable
					</p>
					<h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em]">
						EXE portátil
					</h2>
					<p className="mt-2 text-sm text-[color:var(--muted)]">
						Sem instalador e sem auto-update. Ideal para testar rápido.
					</p>
					<p className="mt-6 text-sm font-semibold">
						{portable
							? `Baixar ${portable.name} · ${formatBytes(portable.size)}`
							: "Abrir releases →"}
					</p>
				</a>
			</div>

			<section className="mt-12 rounded-[24px] border border-[color:var(--line)] bg-[color:rgba(6,9,18,0.55)] p-6 md:p-8">
				<h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.03em]">
					CLI (qualquer OS)
				</h2>
				<p className="mt-2 max-w-2xl text-[color:var(--muted)]">
					Node.js 20+, clone o repo, build e link global.
				</p>
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
						Guia rápido
					</Link>
					<a
						href={RELEASES_URL}
						target="_blank"
						rel="noreferrer"
						className="btn btn-ghost"
					>
						Todas as releases
					</a>
				</div>
			</section>
		</div>
	);
}
