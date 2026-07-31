import Link from "next/link";
import { groupedDocs } from "@/modules/docs/public.server";

export function DocsSidebar({ active }: { active: string }) {
	return (
		<aside className="md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto">
			<p className="mb-4 font-[family-name:var(--font-display)] text-sm font-bold tracking-[-0.02em]">
				Documentação
			</p>
			<nav className="space-y-6">
				{groupedDocs().map(([section, items]) => (
					<div key={section}>
						<p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
							{section}
						</p>
						<ul className="space-y-1">
							{items.map((item) => {
								const isActive = item.slug === active;
								return (
									<li key={item.slug}>
										<Link
											href={`/docs/${item.slug}`}
											className={`block rounded-lg px-3 py-2 text-sm transition ${
												isActive
													? "bg-[rgba(79,209,255,0.12)] text-[color:var(--cyan)]"
													: "text-[color:var(--muted)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[color:var(--ink)]"
											}`}
										>
											{item.title}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>
		</aside>
	);
}
