"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CopyCode({ code }: { code: string }) {
	const t = useTranslations("CopyCode");
	const [copied, setCopied] = useState(false);

	return (
		<div className="group relative">
			<pre>
				<code>{code}</code>
			</pre>
			<button
				type="button"
				className="absolute right-3 top-3 rounded-lg border border-[color:var(--line)] bg-[color:rgba(12,18,32,0.9)] px-2.5 py-1 text-xs text-[color:var(--muted)] opacity-100 transition hover:text-[color:var(--ink)] md:opacity-0 md:group-hover:opacity-100"
				onClick={async () => {
					await navigator.clipboard.writeText(code);
					setCopied(true);
					window.setTimeout(() => setCopied(false), 1400);
				}}
			>
				{copied ? t("copied") : t("copy")}
			</button>
		</div>
	);
}
