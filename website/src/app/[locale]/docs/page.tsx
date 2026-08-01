import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function DocsIndexPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	redirect({ href: "/docs/introducao", locale });
}
