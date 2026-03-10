import { getSiteData } from "../actions";
import BlogClient from "./BlogClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
    const data = await getSiteData();
    const posts = data.blogPosts || [];
    const content = data.content || {};

    return <BlogClient posts={posts} content={content} />;
}
