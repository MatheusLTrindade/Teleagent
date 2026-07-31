export type DocNavItem = {
	slug: string;
	title: string;
	description: string;
	section: string;
};

export const DOC_NAV: DocNavItem[] = [
	{
		slug: "introducao",
		title: "Introdução",
		description: "O que é o Teleagent e quando usar.",
		section: "Começar",
	},
	{
		slug: "quickstart",
		title: "Quickstart",
		description: "Do BotFather ao primeiro ask em minutos.",
		section: "Começar",
	},
	{
		slug: "cli",
		title: "CLI",
		description: "Comandos, flags e códigos de saída.",
		section: "Referência",
	},
	{
		slug: "api",
		title: "API local",
		description: "Endpoints HTTP em 127.0.0.1.",
		section: "Referência",
	},
	{
		slug: "desktop",
		title: "App Windows",
		description: "Hub, bandeja, autostart e auto-update.",
		section: "Produto",
	},
	{
		slug: "skill",
		title: "Skill Cursor",
		description: "Como o agent usa alert/ask no loop.",
		section: "Produto",
	},
	{
		slug: "configuracao",
		title: "Configuração",
		description: "Arquivo local, env vars e allowlist.",
		section: "Operação",
	},
	{
		slug: "arquitetura",
		title: "Arquitetura",
		description: "Componentes e fluxo de decisão.",
		section: "Operação",
	},
	{
		slug: "seguranca",
		title: "Segurança",
		description: "Localhost, allowlist e segredos.",
		section: "Operação",
	},
];

export function getDoc(slug: string) {
	return DOC_NAV.find((d) => d.slug === slug) ?? null;
}

export function groupedDocs() {
	const map = new Map<string, DocNavItem[]>();
	for (const item of DOC_NAV) {
		const list = map.get(item.section) ?? [];
		list.push(item);
		map.set(item.section, list);
	}
	return [...map.entries()];
}
