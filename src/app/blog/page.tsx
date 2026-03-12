import { Suspense } from "react";
import { getSiteData } from "../actions";
import BlogClient from "./BlogClient";
import { PageSkeleton } from "../components/LoadingSkeleton";

export const revalidate = 60;

async function BlogContent() {
    const data = await getSiteData();
    const posts = data.blogPosts || [];
    const content = data.content || {};

    return <BlogClient posts={posts} content={content} />;
}

export default function BlogPage() {
    return (
        <Suspense fallback={<PageSkeleton type="grid" />}>
            <BlogContent />
        </Suspense>
    );
}
