import { MetadataRoute } from 'next'
import { getSiteData } from './actions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.parksidevillakitui.com';
    const data = await getSiteData();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/facilities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/dining`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ];

    const roomRoutes: MetadataRoute.Sitemap = data.rooms.map((room: any) => ({
        url: `${baseUrl}/rooms/${room.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    const facilityRoutes: MetadataRoute.Sitemap = data.facilities.map((fac: any) => ({
        url: `${baseUrl}/facilities/${fac.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const blogRoutes: MetadataRoute.Sitemap = data.blogPosts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...roomRoutes, ...facilityRoutes, ...blogRoutes];
}
