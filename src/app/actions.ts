"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { NotificationService } from "./services/mailService";
import bcrypt from "bcrypt";
import { signToken, getAuthSession as getAuthSessionLib } from "../lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";
import fs from "fs";
import path from "path";
import os from "os";

export async function getAuthSession() {
    return await getAuthSessionLib();
}
import {
    Room, Lead, User, Testimonial, BlogPost, Facility,
    MenuCategory, HeroImage, GalleryItem, Promotion, Subscriber, ContactInfo,
    SiteContent, DiningVenue, GalleryCategory
} from "@prisma/client";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function revalidateAll() {
    revalidatePath("/");
    revalidatePath("/rooms");
    revalidatePath("/dining");
    revalidatePath("/conference");
    revalidatePath("/facilities");
    revalidatePath("/gallery");
    revalidatePath("/blog");
    revalidatePath("/admin");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/dining");
    revalidatePath("/admin/dining-venues");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/facilities");
    revalidatePath("/admin/conference");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/promotions");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/blog");
    revalidatePath("/admin/gallery");
}

// ─────────────────────────────────────────────
// AUTHORIZATION HELPERS
// ─────────────────────────────────────────────

async function requireAdmin() {
    const session = await getAuthSession();
    if (!session || session.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

async function requireUser() {
    const session = await getAuthSession();
    if (!session) {
        throw new Error("Unauthorized: User access required");
    }
    return session;
}

// ─────────────────────────────────────────────
// SITE DATA (read everything in one call for legacy compatibility)
// ─────────────────────────────────────────────

import * as staticData from "../data/site-data";

export async function getSiteData() {
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production';
    const cacheFile = path.join(os.tmpdir(), 'parkside-site-data.cache.json');

    // Build-time caching to prevent 7 workers from hitting DB simultaneously
    if (isBuild) {
        try {
            if (fs.existsSync(cacheFile)) {
                const stats = fs.statSync(cacheFile);
                // Cache is valid for 5 minutes during build
                if (Date.now() - stats.mtimeMs < 5 * 60 * 1000) {
                    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                    return cached;
                }
            }
        } catch (e) {
            console.warn("Build cache read failed, falling back to DB", e);
        }

        // Staggered start: wait 0-3 seconds to avoid "thundering herd" on the DB pool
        const delay = Math.floor(Math.random() * 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
        const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Database timeout")), ms));

        const results = await Promise.race([
            Promise.all([
                prisma.heroImage.findMany({ orderBy: { order: "asc" } }),
                prisma.room.findMany({ orderBy: { createdAt: "asc" } }),
                prisma.facility.findMany(),
                prisma.testimonial.findMany({ orderBy: { createdAt: "asc" } }),
                prisma.menuCategory.findMany({ orderBy: { order: "asc" } }),
                prisma.contactInfo.findUnique({ where: { id: 1 } }),
                prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.subscriber.findMany(),
                prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.user.findMany(),
                prisma.galleryItem.findMany({
                    orderBy: { order: "asc" },
                    include: { category: true }
                }),
                prisma.conferenceHall.findMany({ orderBy: { createdAt: "asc" } }),
                prisma.siteContent.findMany(),
                prisma.diningVenue.findMany({ orderBy: { createdAt: "asc" } }),
                prisma.galleryCategory.findMany({ orderBy: { order: "asc" } }),
            ]),
            timeout(30000) // Increased to 30s
        ]) as any;

        const [
            heroImages, rooms, facilities, testimonials, menuCategories,
            contactInfoRow, blogPosts, leads, subscribers, promotions,
            users, galleryItems, conferenceHalls, siteContentRows, diningVenues, galleryCategories
        ] = results;

        const content = siteContentRows.reduce((acc: any, row: SiteContent) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        const optimizeCloudinary = (url: string | null | undefined) => {
            if (!url) return null;
            if (typeof url !== 'string') return null;
            if (!url.includes('res.cloudinary.com')) return url;

            try {
                // Ensure it's a valid URL string
                new URL(url);
                if (url.includes('upload/')) {
                    return url.replace('upload/', 'upload/f_auto,q_auto:best/');
                }
                return url;
            } catch (e) {
                console.warn("Invalid Cloudinary URL encountered:", url);
                return null;
            }
        };

        // Map DB rows to the shape the UI already expects
        const finalData = {
            heroImages: heroImages.map((h: HeroImage) => optimizeCloudinary(h.url)),
            rooms: rooms.map((r: any) => ({
                id: r.slug,
                name: r.name,
                desc: r.desc,
                price: r.price,
                image: optimizeCloudinary(r.image),
                images: (r.images || []).map((img: string) => optimizeCloudinary(img)),
                tag: r.tag ?? undefined,
                capacity: r.capacity,
            })),
            facilities: (facilities as any[]).map(f => {
                if (f.id === "conference" && conferenceHalls.length > 0) {
                    return {
                        ...f,
                        image: f.image ? optimizeCloudinary(f.image) : null,
                        features: (conferenceHalls as any[]).map(h => h.name.includes("Hall") ? h.name : `${h.name} Hall`)
                    };
                }
                return { ...f, image: f.image ? optimizeCloudinary(f.image) : null };
            }),
            conferenceHalls: (conferenceHalls as any[]).map(h => ({ ...h, image: h.image ? optimizeCloudinary(h.image) : null, images: (h.images || []).map((img: string) => optimizeCloudinary(img)) })),
            diningVenues: (diningVenues as any[]).map(v => ({ ...v, image: v.image ? optimizeCloudinary(v.image) : null, images: (v.images || []).map((img: string) => optimizeCloudinary(img)) })),
            testimonials: testimonials as Testimonial[],
            menuCategories: menuCategories as MenuCategory[],
            contactInfo: contactInfoRow ? { ...(contactInfoRow as ContactInfo), social: (contactInfoRow as ContactInfo).social || {} } : getStaticSiteData().contactInfo,
            blogPosts: (blogPosts as any[]).map(p => ({ ...p, image: p.image ? optimizeCloudinary(p.image) : "" })),
            leads: leads.map((l: Lead) => ({
                id: l.id,
                room: l.roomSlug ?? "",
            })),
            subscribers: subscribers.map((s: Subscriber) => s.email),
            promotions: promotions as Promotion[],
            users: users.map(({ password: _, ...u }: any) => u),
            galleryItems: (galleryItems as any[]).map(i => ({ ...i, url: optimizeCloudinary(i.url) })),
            galleryVideos: galleryItems.filter((i: GalleryItem) => i.type === "video").map((i: any) => ({ ...i, url: optimizeCloudinary(i.url) })),
            galleryCategories: (galleryCategories as any[]).map(c => ({
                ...c,
                items: galleryItems.filter((i: any) => i.categoryId === c.id).map((i: any) => ({ ...i, url: optimizeCloudinary(i.url) }))
            })),
            content,
        };

        // Save to build cache
        if (isBuild) {
            try {
                fs.writeFileSync(cacheFile, JSON.stringify(finalData), 'utf8');
            } catch (e) {
                console.warn("Build cache write failed", e);
            }
        }

        return finalData;
    } catch (error: any) {
        console.error("CRITICAL: Database connection failed on Vercel.", {
            message: error.message,
            stack: error.stack,
            isConfigured: isDatabaseConfigured(),
            node_env: process.env.NODE_ENV
        });
        return getStaticSiteData();
    }
}

// Public‑facing site data: Only fetches what is needed for the public UI
export async function getPublicSiteData() {
    try {
        const results = await Promise.all([
            prisma.heroImage.findMany({ orderBy: { order: "asc" } }),
            prisma.room.findMany({ orderBy: { createdAt: "asc" } }),
            prisma.facility.findMany(),
            prisma.testimonial.findMany({ where: { status: "Active" }, orderBy: { createdAt: "asc" } }),
            prisma.menuCategory.findMany({ orderBy: { order: "asc" } }),
            prisma.contactInfo.findUnique({ where: { id: 1 } }),
            prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.galleryItem.findMany({
                orderBy: { order: "asc" },
                include: { category: true }
            }),
            prisma.conferenceHall.findMany({ orderBy: { createdAt: "asc" } }),
            prisma.siteContent.findMany(),
            prisma.diningVenue.findMany({ orderBy: { createdAt: "asc" } }),
            prisma.galleryCategory.findMany({ orderBy: { order: "asc" } }),
        ]);

        const [
            heroImages, rooms, facilities, testimonials, menuCategories,
            contactInfoRow, blogPosts, galleryItems, conferenceHalls, siteContentRows, diningVenues, galleryCategories
        ] = results;

        const content = siteContentRows.reduce((acc: any, row: SiteContent) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        const optimizeCloudinary = (url: string | null | undefined) => {
            if (!url || typeof url !== 'string') return null;
            if (!url.includes('res.cloudinary.com')) return url;
            try {
                new URL(url);
                return url.includes('upload/') ? url.replace('upload/', 'upload/f_auto,q_auto:best/') : url;
            } catch (e) { return null; }
        };

        return {
            heroImages: heroImages.map((h: HeroImage) => optimizeCloudinary(h.url)),
            rooms: rooms.map((r: any) => ({
                id: r.slug,
                name: r.name,
                desc: r.desc,
                price: r.price,
                image: optimizeCloudinary(r.image),
                images: (r.images || []).map((img: string) => optimizeCloudinary(img)),
                tag: r.tag ?? undefined,
                capacity: r.capacity,
            })),
            facilities: (facilities as any[]).map(f => ({
                ...f,
                image: f.image ? optimizeCloudinary(f.image) : null,
                features: (f.id === "conference" && conferenceHalls.length > 0)
                    ? (conferenceHalls as any[]).map(h => h.name.includes("Hall") ? h.name : `${h.name} Hall`)
                    : f.features
            })),
            conferenceHalls: (conferenceHalls as any[]).map(h => ({ ...h, image: h.image ? optimizeCloudinary(h.image) : null, images: (h.images || []).map((img: string) => optimizeCloudinary(img)) })),
            diningVenues: (diningVenues as any[]).map(v => ({ ...v, image: v.image ? optimizeCloudinary(v.image) : null, images: (v.images || []).map((img: string) => optimizeCloudinary(img)) })),
            testimonials: testimonials as Testimonial[],
            menuCategories: menuCategories as MenuCategory[],
            contactInfo: contactInfoRow ? { ...(contactInfoRow as ContactInfo), social: (contactInfoRow as ContactInfo).social || {} } : getStaticSiteData().contactInfo,
            blogPosts: (blogPosts as any[]).map(p => ({ ...p, image: p.image ? optimizeCloudinary(p.image) : "" })),
            galleryItems: (galleryItems as any[]).map(i => ({ ...i, url: optimizeCloudinary(i.url) })),
            galleryVideos: galleryItems.filter((i: GalleryItem) => i.type === "video").map((i: any) => ({ ...i, url: optimizeCloudinary(i.url) })),
            galleryCategories: (galleryCategories as any[]).map(c => ({
                ...c,
                items: galleryItems.filter((i: any) => i.categoryId === c.id).map((i: any) => ({ ...i, url: optimizeCloudinary(i.url) }))
            })),
            content,
        };
    } catch (error) {
        console.error("Error fetching public site data:", error);
        return getStaticSiteData();
    }
}

export async function getDashboardStats() {
    if (!isDatabaseConfigured()) {
        return {
            rooms: 0,
            leads: 0,
            menus: 0,
            testimonials: 0,
            recentActivity: [],
            agenda: [],
            analytics: {
                revenue: "$0.00",
                conversion: "0.0%",
                chartData: [0, 0, 0, 0, 0, 0, 0]
            }
        };
    }

    try {
        await requireAdmin();
        const [roomCount, leadCount, menuCount, testimonialCount, recentLeads, recentTestimonials, upcomingLeads] = await Promise.all([
            prisma.room.count(),
            prisma.lead.count(),
            prisma.menuCategory.count(),
            prisma.testimonial.count(),
            prisma.lead.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { room: true }
            }),
            prisma.testimonial.findMany({
                take: 5,
                orderBy: { createdAt: "desc" }
            }),
            prisma.lead.findMany({
                where: {
                    date: { not: null },
                    status: "Pending" // Only show actionable tasks
                },
                take: 5,
                orderBy: { createdAt: "asc" },
                include: { room: true }
            })
        ]);

        // Merge and format activity
        const activities = [
            ...recentLeads.map(l => ({
                id: `lead-${l.id}`,
                type: "Lead",
                user: l.name,
                action: `Requested ${l.room?.name || "a room"} booking`,
                time: l.time || "Just now",
                color: "#C9A84C",
                timestamp: l.createdAt
            })),
            ...recentTestimonials.map(t => ({
                id: `test-${t.id}`,
                type: "Review",
                user: t.name,
                action: `Left a ${t.status === 'Active' ? 'published' : 'pending'} endorsement`,
                time: "Recently",
                color: "#10b981",
                timestamp: t.createdAt
            }))
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

        // Format Agenda
        const agenda = upcomingLeads.map(l => ({
            task: `${l.room?.name || "Suite"} Check-in`,
            desc: `Prep for ${l.name}`,
            time: l.date || "TBD",
            status: "Pending"
        }));

        // Calculate Analytics (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const last7DaysLeads = await prisma.lead.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            include: { room: true }
        });

        // Group by Day (0=Sun, 1=Mon, ..., 6=Sat)
        const chartData = [0, 0, 0, 0, 0, 0, 0];
        let totalPotentialRevenue = 0;

        last7DaysLeads.forEach(l => {
            const day = l.createdAt.getDay();
            chartData[day]++;

            // Extract numeric price from "$150"
            const priceStr = l.room?.price?.replace(/[^0-9.]/g, '') || "0";
            totalPotentialRevenue += parseFloat(priceStr);
        });

        // Reorder chartData to start from Monday (1, 2, 3, 4, 5, 6, 0)
        const orderedChartData = [chartData[1], chartData[2], chartData[3], chartData[4], chartData[5], chartData[6], chartData[0]];

        // Scale chart data to percentages (0-100) for the UI bars
        const maxEnquiries = Math.max(...orderedChartData, 1);
        const scaledChartData = orderedChartData.map(val => (val / maxEnquiries) * 100);

        // Conversion Rate: Total Leads / (Rooms * 10) (Simplified metric for demo)
        const conversionRate = ((leadCount / (roomCount * 5 || 1)) * 100).toFixed(1);

        return {
            rooms: roomCount,
            leads: leadCount,
            menus: menuCount,
            testimonials: testimonialCount,
            recentActivity: activities,
            agenda: agenda,
            analytics: {
                revenue: `$${totalPotentialRevenue.toLocaleString()}`,
                conversion: `${conversionRate}%`,
                chartData: scaledChartData,
                rawCounts: orderedChartData
            }
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            rooms: 0, leads: 0, menus: 0, testimonials: 0, recentActivity: [], agenda: [],
            analytics: { revenue: "$0", conversion: "0%", chartData: [0, 0, 0, 0, 0, 0, 0] }
        };
    }
}

function getStaticSiteData() {
    const optimizeCloudinary = (url: string) => {
        if (!url.includes('res.cloudinary.com')) return url;
        if (url.includes('upload/')) {
            return url.replace('upload/', 'upload/f_auto,q_auto:best/');
        }
        return url;
    };
    return {
        heroImages: staticData.heroImages.map(optimizeCloudinary),
        rooms: staticData.rooms.map(r => ({ ...r, image: optimizeCloudinary(r.image) })),
        facilities: staticData.facilities.map(f => ({ ...f, image: f.image ? optimizeCloudinary(f.image) : null })),
        testimonials: staticData.testimonials,
        menuCategories: staticData.menuCategories,
        contactInfo: staticData.contactInfo,
        blogPosts: [
            { id: "1", title: "The Art of Kenyan Hospitality", author: "Editorial Team", date: "2025-05-10", category: "Lifestyle", content: "...", excerpt: "...", image: optimizeCloudinary("https://res.cloudinary.com/dizwm3mic/image/upload/v1772373725/parkside-villa-media/EXTRA_PHOTOS/IMG_8556_ds9eib.jpg"), createdAt: new Date() },
            { id: "2", title: "Culinary Excellence at Parkside", author: "Master Chef", date: "2025-05-12", category: "Dining", content: "...", excerpt: "...", image: optimizeCloudinary("https://res.cloudinary.com/dizwm3mic/image/upload/v1772373754/parkside-villa-media/EXTRA_PHOTOS/IMG_8560_vlao4a.jpg"), createdAt: new Date() }
        ],
        leads: [],
        subscribers: [],
        promotions: [],
        users: [],
        galleryItems: [],
        galleryVideos: [],
        conferenceHalls: [],
        diningVenues: [],
        content: {}
    };
}

// ─────────────────────────────────────────────
// LEADS / BOOKINGS
// ─────────────────────────────────────────────

export async function addLead(lead: {
    name: string;
    email: string;
    phone?: string;
    date?: string;
    room?: string;
    guests?: string;
}) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        const LeadSchema = z.object({
            name: z.string().min(1).max(100),
            email: z.string().email().max(200),
            phone: z.string().max(50).optional().nullable(),
            date: z.string().max(200).optional().nullable(),
            room: z.string().max(200).optional().nullable(),
            guests: z.string().max(1000).optional().nullable(),
        });

        const validated = LeadSchema.safeParse(lead);
        if (!validated.success) {
            return { success: false, error: "Invalid enquiry details" };
        }

        const safeLead = validated.data;

        // Resolve room relation if slug provided and exists
        const roomExists = safeLead.room
            ? await prisma.room.findUnique({ where: { slug: safeLead.room } })
            : null;

        const newLead = await prisma.lead.create({
            data: {
                name: safeLead.name,
                email: safeLead.email,
                phone: safeLead.phone ?? null,
                date: safeLead.date ?? null,
                guests: safeLead.guests ?? null,
                roomSlug: roomExists ? safeLead.room! : null,
                status: "Pending",
                time: "Just now",
            },
        });

        NotificationService.notifyAdminNewLead(newLead).catch((err) =>
            console.error("Failed to notify admin:", err)
        );

        revalidatePath("/admin/leads");
        return { success: true };
    } catch (error) {
        console.error("Error adding lead:", error);
        return { success: false, error: "System error while processing reservation" };
    }
}

export async function updateLeadStatus(id: number, status: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.lead.update({ where: { id }, data: { status } });
        revalidatePath("/admin/leads");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating lead status:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function deleteLead(id: number) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.lead.delete({ where: { id } });
        revalidatePath("/admin/leads");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting lead:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function requestBookingAction(bookingId: number, type: "modify" | "cancel", reason: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        const label = type === "modify" ? "Modification" : "Cancellation";
        await prisma.lead.update({
            where: { id: bookingId },
            data: {
                status: `Request: ${label}`,
                notes: `[${new Date().toISOString()}] Request: ${type.toUpperCase()} - Reason: ${reason}`,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Error requesting booking action:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────────

export async function createRoom(newRoom: {
    id?: string;
    name: string;
    desc: string;
    price: string;
    image: string;
    tag?: string;
    capacity?: number;
}) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const slug = newRoom.id ?? newRoom.name.toLowerCase().replace(/\s+/g, "-");
        await prisma.room.create({
            data: {
                slug,
                name: newRoom.name,
                desc: newRoom.desc,
                price: newRoom.price,
                image: newRoom.image,
                images: (newRoom as any).images ?? [],
                tag: newRoom.tag ?? null,
                capacity: newRoom.capacity ?? 2,
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error creating room:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateRoom(roomId: string, updatedRoom: Partial<Room>) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.room.update({
            where: { slug: roomId },
            data: {
                name: updatedRoom.name,
                desc: updatedRoom.desc,
                price: updatedRoom.price,
                image: updatedRoom.image,
                images: (updatedRoom as any).images ?? undefined,
                tag: updatedRoom.tag ?? null,
                capacity: updatedRoom.capacity ?? 2,
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error: any) {
        console.error("Error updating room:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function deleteRoom(roomId: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.room.delete({ where: { slug: roomId } });
        revalidateAll();
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting room:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────

export async function addTestimonial(t: {
    name: string;
    title: string;
    text: string;
    status?: string;
}) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.testimonial.create({
            data: {
                name: t.name,
                title: t.title,
                text: t.text,
                status: t.status ?? "Active",
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error adding testimonial:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateTestimonial(id: number, updatedData: Partial<Testimonial>) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.testimonial.update({
            where: { id },
            data: {
                name: updatedData.name,
                title: updatedData.title,
                text: updatedData.text,
                status: updatedData.status,
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error: any) {
        console.error("Error updating testimonial:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function deleteTestimonial(id: number) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.testimonial.delete({ where: { id } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        return { success: false, error: "Database error" };
    }
}

export async function submitPublicReview(review: { name: string; title: string; text: string }) {
    const PublicReviewSchema = z.object({
        name: z.string().min(1).max(100),
        title: z.string().min(1).max(200),
        text: z.string().min(1).max(2000),
    });

    const parsed = PublicReviewSchema.safeParse(review);
    if (!parsed.success) {
        return { success: false, error: "Invalid review details" };
    }

    const safeReview = parsed.data;

    await NotificationService.sendEmail(
        "concierge@parksidevillakitui.com",
        `New Public Review: ${safeReview.name}`,
        safeReview.text
    );
    await addTestimonial({ ...safeReview, status: "Pending" });
    return { success: true };
}

// ─────────────────────────────────────────────
// DINING (Menu Categories)
// ─────────────────────────────────────────────

export async function createDiningCategory(newCategory: { name: string; items?: any[]; order?: number; id?: string }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const id = newCategory.id ?? newCategory.name.toLowerCase().replace(/\s+/g, "-");
        await prisma.menuCategory.create({
            data: { id, name: newCategory.name, items: newCategory.items ?? [], order: newCategory.order ?? 0 },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error creating dining category:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateDiningCategory(categoryId: string, updatedCategory: { name: string; items: any[] }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.menuCategory.update({
            where: { id: categoryId },
            data: { name: updatedCategory.name, items: updatedCategory.items ?? [] },
        });
        revalidateAll();
        return { success: true };
    } catch (error: any) {
        console.error("Error updating dining category:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function deleteDiningCategory(categoryId: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.menuCategory.delete({ where: { id: categoryId } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting dining category:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// FACILITIES
// ─────────────────────────────────────────────

export async function addFacility(f: Partial<Facility> & { title: string; desc: string; icon: string }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const id = f.id ?? f.title.toLowerCase().replace(/\s+/g, "-");
        await prisma.facility.create({
            data: { id, title: f.title, desc: f.desc, icon: f.icon, image: f.image ?? null, images: (f as any).images ?? [], features: f.features ?? [], highlights: f.highlights ?? [] },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error adding facility:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateFacility(facilityId: string, updatedFacility: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.facility.update({
            where: { id: facilityId },
            data: {
                title: updatedFacility.title,
                desc: updatedFacility.desc,
                icon: updatedFacility.icon,
                image: updatedFacility.image ?? null,
                images: updatedFacility.images ?? undefined,
                features: updatedFacility.features ?? [],
                highlights: updatedFacility.highlights ?? [],
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error: any) {
        console.error("Error updating facility:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function deleteFacility(facilityId: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.facility.delete({ where: { id: facilityId } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting facility:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// HERO IMAGES
// ─────────────────────────────────────────────

export async function addHeroImage(imageUrl: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();

        // Prevent duplicate hero images (P2002)
        const existing = await prisma.heroImage.findUnique({
            where: { url: imageUrl }
        });
        if (existing) return { success: true };

        const count = await prisma.heroImage.count();
        await prisma.heroImage.create({ data: { url: imageUrl, order: count } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error adding hero image:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteHeroImage(imageUrl: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.heroImage.deleteMany({ where: { url: imageUrl } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting hero image:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// CONTACT INFO
// ─────────────────────────────────────────────

export async function updateContactInfo(contactInfo: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.contactInfo.upsert({
            where: { id: 1 },
            update: {
                phone: contactInfo.phone,
                email: contactInfo.email,
                whatsapp: contactInfo.whatsapp ?? null,
                address: contactInfo.address,
                social: contactInfo.social ?? {},
            },
            create: {
                id: 1,
                phone: contactInfo.phone,
                email: contactInfo.email,
                whatsapp: contactInfo.whatsapp ?? null,
                address: contactInfo.address,
                social: contactInfo.social ?? {},
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error updating contact info:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────

export async function subscribeNewsletter(email: string) {
    if (!email || !email.includes("@")) return { success: false, error: "Valid email required" };

    if (!isDatabaseConfigured()) {
        console.warn(`Newsletter subscription (Demo Mode): ${email}`);
        return { success: true, demoMode: true };
    }

    try {
        const existing = await prisma.subscriber.findUnique({ where: { email } });
        if (existing) return { success: true, alreadyExists: true };
        await prisma.subscriber.create({ data: { email } });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Subscription failed" };
    }
}

// ─────────────────────────────────────────────
// PROMOTIONS
// ─────────────────────────────────────────────

export async function getPromotions() {
    if (!isDatabaseConfigured()) return [];
    try {
        await requireAdmin();
        return await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
    } catch (error) {
        console.error("Error getting promotions:", error);
        return [];
    }
}

export async function addPromotion(promotion: {
    code: string;
    discount: number;
    type?: string;
    validFrom?: string;
    validTo?: string;
}) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const newPromotion = await prisma.promotion.create({
            data: {
                code: promotion.code,
                discount: promotion.discount,
                type: promotion.type ?? "percentage",
                validFrom: promotion.validFrom ? new Date(promotion.validFrom) : null,
                validTo: promotion.validTo ? new Date(promotion.validTo) : null,
            },
        });
        revalidatePath("/admin/promotions");
        return { success: true, promotion: newPromotion };
    } catch (error) {
        console.error("Error adding promotion:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deletePromotion(id: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.promotion.delete({ where: { id } });
        revalidatePath("/admin/promotions");
        return { success: true };
    } catch (error) {
        console.error("Error deleting promotion:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updatePromotion(id: string, promotion: {
    code: string;
    discount: number;
    type?: string;
    validFrom?: string;
    validTo?: string;
}) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const updated = await prisma.promotion.update({
            where: { id },
            data: {
                code: promotion.code,
                discount: promotion.discount,
                type: promotion.type ?? "percentage",
                validFrom: promotion.validFrom ? new Date(promotion.validFrom) : null,
                validTo: promotion.validTo ? new Date(promotion.validTo) : null,
            },
        });
        revalidatePath("/admin/promotions");
        return { success: true, promotion: updated };
    } catch (error) {
        console.error("Error updating promotion:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// UPLOAD (Cloudinary Integration)
// ─────────────────────────────────────────────

import { v2 as cloudinary } from "cloudinary";

// Cloudinary configures itself automatically if CLOUDINARY_URL is present in the environment variables.

export async function uploadImage(formData: FormData) {
    // Keep this as fallback or for smaller files if needed, but direct upload is preferred.
    // ... logic same as before ...
    return { success: false, error: "Use client-side upload via Cloudinary signature." };
}

/**
 * Generates a Cloudinary signature for secure client-side uploads.
 * This bypasses Vercel's 4.5MB serverless function limit.
 */
export async function getCloudinarySignature() {
    try {
        await requireAdmin();

        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = {
            timestamp,
            folder: "parkside_villa"
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_URL?.split('@')[0]?.split(':').pop() || "" // Api Secret
        );

        return {
            success: true,
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_URL?.split('@').pop() || "",
            apiKey: process.env.CLOUDINARY_URL?.split(':')[1]?.replace('//', '') || "",
            folder: "parkside_villa"
        };
    } catch (error: any) {
        console.error("Signature error:", error);
        return { success: false, error: error.message };
    }
}

// ─────────────────────────────────────────────
// AUTH & PROFILE
// ─────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
    if (!isDatabaseConfigured()) return { success: false, message: "Server maintains local legacy mode. Database authentication unavailable." };
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { success: false, message: "Invalid email or password" };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: "Invalid email or password" };
        }

        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "An unexpected error occurred during login" };
    }
}

export async function loginAdmin(email: string, password: string) {
    const adminEmail = process.env.AUTH_ADMIN_EMAIL;
    const adminPass = process.env.AUTH_ADMIN_PASSWORD;

    if (!adminEmail || !adminPass) {
        const missing = [];
        if (!adminEmail) missing.push("AUTH_ADMIN_EMAIL");
        if (!adminPass) missing.push("AUTH_ADMIN_PASSWORD");
        return { success: false, message: `Server configuration error: Missing ${missing.join(" and ")}. Please add these SPECIFIC names to Vercel and redeploy.` };
    }

    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() || password !== adminPass) {
        return { success: false, message: "Invalid administrative credentials. Please check for typos and try again." };
    }

    try {
        const token = await signToken({ email, role: "admin" });
        const cookieStore = await cookies();
        cookieStore.set("admin_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 // 24 hours
        });
        return { success: true };
    } catch (tokenError: any) {
        console.error("Token signing failed:", tokenError);
        return { success: false, message: "Authentication service error. Please check server configuration." };
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0
    });
    return { success: true };
}

export async function registerUser(user: {
    name: string;
    email: string;
    password: string;
}) {
    if (!isDatabaseConfigured()) return { success: false, message: "Database not configured" };
    try {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing) return { success: false, message: "Email already registered" };

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = await prisma.user.create({
            data: { name: user.name, email: user.email, password: hashedPassword },
        });
        const { password: _, ...safeUser } = newUser;
        return { success: true, user: safeUser };
    } catch (error) {
        console.error("Register error:", error);
        return { success: false, message: "Registration error. Try again." };
    }
}

export async function updateProfile(userId: string, updates: { name?: string; email?: string }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        const session = await requireUser();
        // Ensure user can only update their own profile
        if (session.id !== userId) throw new Error("Unauthorized");
        await prisma.user.update({
            where: { id: userId },
            data: updates,
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Database error" };
    }
}

export async function getUserBookings(userId: string) {
    if (!isDatabaseConfigured()) return [];
    try {
        const session = await requireUser();
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.id !== session.id) return [];
        return await prisma.lead.findMany({
            where: { email: user.email },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error getting user bookings:", error);
        return [];
    }
}

// ─────────────────────────────────────────────
// BLOG POSTS
// ─────────────────────────────────────────────

const BlogPostSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    excerpt: z.string(),
    content: z.string(),
    date: z.string().optional(),
    author: z.string().optional(),
    category: z.string(),
    image: z.string()
});

export async function createBlogPost(post: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const validPost = BlogPostSchema.parse(post);
        const newPost = await prisma.blogPost.create({
            data: {
                id: validPost.id || validPost.title.toLowerCase().replace(/\s+/g, "-"),
                title: validPost.title,
                excerpt: validPost.excerpt,
                content: validPost.content,
                date: validPost.date || new Date().toISOString().split("T")[0],
                author: validPost.author || "Parkside Villa",
                category: validPost.category,
                image: validPost.image,
            },
        });
        revalidateAll();
        return { success: true, post: newPost };
    } catch (error) {
        console.error("Error creating blog post:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateBlogPost(id: string, post: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const validPost = BlogPostSchema.partial().parse(post);
        await prisma.blogPost.update({
            where: { id },
            data: validPost,
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error updating blog post:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteBlogPost(id: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.blogPost.delete({ where: { id } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// GALLERY
// ─────────────────────────────────────────────

export async function getGalleryItems() {
    if (!isDatabaseConfigured()) return [];
    try {
        return await prisma.galleryItem.findMany({
            orderBy: { order: "asc" },
            include: { category: true }
        });
    } catch (error) {
        console.error("Error getting gallery items:", error);
        return [];
    }
}

export async function addGalleryItem(item: { url: string; type: string; title?: string; categoryId?: string }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const count = await prisma.galleryItem.count();
        const newItem = await prisma.galleryItem.create({
            data: {
                url: item.url,
                type: item.type,
                title: item.title,
                order: count,
                categoryId: item.categoryId || null
            },
        });
        revalidateAll();
        return { success: true, item: newItem };
    } catch (error) {
        console.error("Error adding gallery item:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteGalleryItem(id: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.galleryItem.delete({ where: { id } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting gallery item:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateGalleryItem(id: string, item: { url: string; type: string; title?: string; categoryId?: string }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const updated = await prisma.galleryItem.update({
            where: { id },
            data: {
                url: item.url,
                type: item.type,
                title: item.title,
                categoryId: item.categoryId || null
            },
        });
        revalidateAll();
        return { success: true, item: updated };
    } catch (error) {
        console.error("Error updating gallery item:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateGalleryOrder(items: { id: string; order: number }[]) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        for (const item of items) {
            await prisma.galleryItem.update({
                where: { id: item.id },
                data: { order: item.order },
            });
        }
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error updating gallery order:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// GALLERY CATEGORIES
// ─────────────────────────────────────────────

export async function getGalleryCategories() {
    if (!isDatabaseConfigured()) return [];
    try {
        return await prisma.galleryCategory.findMany({
            orderBy: { order: "asc" },
            include: { _count: { select: { items: true } } }
        });
    } catch (error) {
        console.error("Error getting gallery categories:", error);
        return [];
    }
}

export async function addGalleryCategory(data: { name: string; order?: number }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const count = await prisma.galleryCategory.count();
        const newCategory = await prisma.galleryCategory.create({
            data: {
                name: data.name,
                order: data.order ?? count,
            },
        });
        revalidateAll();
        return { success: true, category: newCategory };
    } catch (error) {
        console.error("Error adding gallery category:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateGalleryCategory(id: string, data: { name: string; order?: number }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const updated = await prisma.galleryCategory.update({
            where: { id },
            data: {
                name: data.name,
                order: data.order,
            },
        });
        revalidateAll();
        return { success: true, category: updated };
    } catch (error) {
        console.error("Error updating gallery category:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteGalleryCategory(id: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        // Option 1: Set categoryId to null for all items in this category
        await prisma.galleryItem.updateMany({
            where: { categoryId: id },
            data: { categoryId: null }
        });

        await prisma.galleryCategory.delete({ where: { id } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting gallery category:", error);
        return { success: false, error: "Database error" };
    }
}

// Legacy compat — some admin pages still call updateSiteData directly for bulk ops
export async function updateSiteData(_data: any) {
    // No-op in Prisma mode — individual actions handle their own updates
    revalidateAll();
    return { success: true };
}

// ─────────────────────────────────────────────
// SITE CONTENT (Dynamic CMS)
// ─────────────────────────────────────────────

const SiteContentSchema = z.object({
    key: z.string().min(1),
    value: z.any()
});

export async function updateSiteContent(key: string, value: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();

        // Basic guardrail: avoid unbounded string blobs in dynamic content.
        if (typeof value === "string") {
            console.log(`[DIAG] updateSiteContent key: ${key}, value length: ${value.length}`);
            if (value.length > 4000) {
                throw new Error("Content value too long");
            }
        }

        SiteContentSchema.parse({ key, value });
        console.log(`[DIAG] Prisma Upsert - Key: ${key}, Value Type: ${typeof value}`);
        if (typeof value === 'object') {
            console.log(`[DIAG] Value Keys: ${Object.keys(value).join(", ")}`);
            Object.keys(value).forEach(k => {
                if (typeof value[k] === 'string') {
                    console.log(`[DIAG] Property ${k} length: ${value[k].length}`);
                }
            });
        }
        await prisma.siteContent.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error updating site content:", error);
        return { success: false, error: "Database error" };
    }
}

// ─────────────────────────────────────────────
// CONFERENCE HALLS
// ─────────────────────────────────────────────

export async function getConferenceHalls() {
    if (!isDatabaseConfigured()) return [];
    try {
        return await prisma.conferenceHall.findMany({
            orderBy: { createdAt: "asc" }
        });
    } catch (error) {
        console.error("Error fetching conference halls:", error);
        return [];
    }
}

export async function createConferenceHall(data: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const newHall = await prisma.conferenceHall.create({
            data: {
                slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: data.name,
                desc: data.desc,
                image: data.image,
                images: data.images || [],
                capacity: parseInt(data.capacity) || 50,
                setups: data.setups || [],
            }
        });
        revalidateAll();
        return { success: true, hall: newHall };
    } catch (error) {
        console.error("Error creating conference hall:", error);
        return { success: false, error: "Server error creating hall" };
    }
}

export async function updateConferenceHall(id: string, data: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const updatedHall = await prisma.conferenceHall.update({
            where: { id },
            data: {
                name: data.name,
                desc: data.desc,
                image: data.image,
                images: data.images ?? undefined,
                capacity: parseInt(data.capacity) || 50,
                setups: data.setups,
                ...(data.name && { slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })
            }
        });
        revalidateAll();
        return { success: true, hall: updatedHall };
    } catch (error) {
        console.error("Error updating conference hall:", error);
        return { success: false, error: "Server error updating hall" };
    }
}

export async function deleteConferenceHall(id: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.conferenceHall.delete({ where: { id } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting conference hall:", error);
        return { success: false, error: "Server error deleting hall" };
    }
}

export async function getConferenceHallBySlug(slug: string) {
    if (!isDatabaseConfigured()) return null;
    try {
        return await prisma.conferenceHall.findUnique({ where: { slug } });
    } catch (error) {
        console.error("Error fetching conference hall:", error);
        return null;
    }
}

// ─────────────────────────────────────────────
// DINING VENUES
// ─────────────────────────────────────────────

export async function getDiningVenues() {
    if (!isDatabaseConfigured()) return [];
    try {
        return await prisma.diningVenue.findMany({
            orderBy: { createdAt: "asc" }
        });
    } catch (error) {
        console.error("Error fetching dining venues:", error);
        return [];
    }
}

export async function getDiningVenueBySlug(slug: string) {
    if (!isDatabaseConfigured()) return null;
    try {
        return await prisma.diningVenue.findUnique({ where: { slug } });
    } catch (error) {
        console.error("Error fetching dining venue:", error);
        return null;
    }
}

export async function createDiningVenue(data: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const venue = await prisma.diningVenue.create({
            data: {
                slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: data.name,
                desc: data.desc,
                image: data.image || '',
                images: data.images || [],
                features: data.features || [],
                hours: data.hours || null,
            }
        });
        revalidateAll();
        return { success: true, venue };
    } catch (error) {
        console.error("Error creating dining venue:", error);
        return { success: false, error: "Server error creating venue" };
    }
}

export async function updateDiningVenue(id: string, data: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const venue = await prisma.diningVenue.update({
            where: { id },
            data: {
                name: data.name,
                desc: data.desc,
                image: data.image || '',
                images: data.images ?? undefined,
                features: data.features || [],
                hours: data.hours || null,
                ...(data.name && { slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })
            }
        });
        revalidateAll();
        return { success: true, venue };
    } catch (error) {
        console.error("Error updating dining venue:", error);
        return { success: false, error: "Server error updating venue" };
    }
}

export async function deleteDiningVenue(id: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.diningVenue.delete({ where: { id } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting dining venue:", error);
        return { success: false, error: "Server error deleting venue" };
    }
}
