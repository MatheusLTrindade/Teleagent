import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="mt-24 border-t border-[color:var(--line)]">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
				<div>
					<p className="font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.04em]">
						Teleagent
					</p>
					<p className="mt-2 max-w-md text-sm text-[color:var(--muted)]">
						Bridge local entre agentes de IA e Telegram. Sem VPS. Sem webhook
						público. Só você no loop.
					</p>
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--muted)]">
					<Link href="/download" className="hover:text-[color:var(--ink)]">
						Download
					</Link>
					<Link href="/docs" className="hover:text-[color:var(--ink)]">
						Documentação
					</Link>
					<a
						href="https://github.com/MatheusLTrindade/Teleagent/releases"
						target="_blank"
						rel="noreferrer"
						className="hover:text-[color:var(--ink)]"
					>
						Releases
					</a>
					<a
						href="https://github.com/MatheusLTrindade/Teleagent"
						target="_blank"
						rel="noreferrer"
						className="hover:text-[color:var(--ink)]"
					>
						Código
					</a>
				</div>
			</div>
			<div className="border-t border-[color:var(--line)]">
				<p className="mx-auto max-w-6xl px-5 py-4 text-xs text-[color:var(--muted)] md:px-8">
					MIT © MatheusLTrindade · Local-first human-in-the-loop
				</p>
			</div>
		</footer>
	);
}
