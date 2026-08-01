import type ptMessages from "@/messages/pt.json";

type DocsMessages = (typeof ptMessages)["Docs"];
type DocMessageKey = keyof Omit<DocsMessages, "sidebarTitle" | "sections">;
type SectionKey = keyof DocsMessages["sections"];

export type DocNavItem = {
	slug: string;
	title: string;
	description: string;
	section: string;
};

const DOC_ENTRIES: ReadonlyArray<{
	slug: string;
	key: DocMessageKey;
	sectionKey: SectionKey;
}> = [
	{ slug: "introducao", key: "intro", sectionKey: "start" },
	{ slug: "quickstart", key: "quickstart", sectionKey: "start" },
	{ slug: "cli", key: "cli", sectionKey: "reference" },
	{ slug: "api", key: "api", sectionKey: "reference" },
	{ slug: "desktop", key: "desktop", sectionKey: "product" },
	{ slug: "skill", key: "skill", sectionKey: "product" },
	{ slug: "configuracao", key: "config", sectionKey: "ops" },
	{ slug: "arquitetura", key: "architecture", sectionKey: "ops" },
	{ slug: "seguranca", key: "security", sectionKey: "ops" },
];

export const DOC_SLUGS = DOC_ENTRIES.map((entry) => entry.slug);

async function loadDocsMessages(locale: string): Promise<DocsMessages> {
	const resolved =
		locale === "en" || locale === "es" || locale === "pt" ? locale : "pt";
	const messages = (await import(`@/messages/${resolved}.json`)).default;
	return messages.Docs as DocsMessages;
}

export async function getDocNav(locale: string): Promise<DocNavItem[]> {
	const docs = await loadDocsMessages(locale);
	return DOC_ENTRIES.map(({ slug, key, sectionKey }) => ({
		slug,
		title: docs[key].title,
		description: docs[key].description,
		section: docs.sections[sectionKey],
	}));
}

export async function getDoc(locale: string, slug: string) {
	const nav = await getDocNav(locale);
	return nav.find((d) => d.slug === slug) ?? null;
}

export async function groupedDocs(locale: string) {
	const nav = await getDocNav(locale);
	const map = new Map<string, DocNavItem[]>();
	for (const item of nav) {
		const list = map.get(item.section) ?? [];
		list.push(item);
		map.set(item.section, list);
	}
	return [...map.entries()];
}
