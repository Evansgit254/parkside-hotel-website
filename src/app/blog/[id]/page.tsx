export const revalidate = 3600;
import { getSiteData } from "../../actions";
import { notFound } from "next/navigation";
import ClientBlogPost from "./ClientBlogPost";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getSiteData();
    const post = (data.blogPosts || []).find((p: any) => p.id === id);

    if (!post) return { title: "Post Not Found | Parkside Villa Kitui" };

    return {
        title: `${post.title} | Parkside Villa Journal`,
        description: post.excerpt,
        alternates: { canonical: `/blog/${id}` },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSiteData();
    const allPosts = data.blogPosts || [];
    const post = allPosts.find((p: any) => p.id === id);

    if (!post) {
        notFound();
    }

    const relatedPosts = allPosts.filter((p: any) => p.id !== id).slice(0, 2);

    return <ClientBlogPost post={post} relatedPosts={relatedPosts} />;
}
