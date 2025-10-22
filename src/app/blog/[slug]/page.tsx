import { getBlogSlugs } from "@/lib/mdx";
import { redirect } from "next/navigation";

interface BlogPostRedirectPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostRedirectPage({
  params,
}: BlogPostRedirectPageProps) {
  redirect(`/writing/${params.slug}`);
}
