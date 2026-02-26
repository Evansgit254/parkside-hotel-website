"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDatabaseConfigured } from "../lib/prisma";
import { NotificationService } from "./services/mailService";
import bcrypt from "bcrypt";
import { signToken, getAuthSession as getAuthSessionLib } from "../lib/auth";
import { cookies } from "next/headers";

export async function getAuthSession() {
    return await getAuthSessionLib();
}
import {
    Room, Lead, User, Testimonial, BlogPost, Facility,
    MenuCategory, HeroImage, GalleryItem, Promotion, Subscriber, ContactInfo,
    SiteContent
} from "@prisma/client";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function revalidateAll() {
    revalidatePath("/");
    revalidatePath("/rooms");
    revalidatePath("/dining");
    revalidatePath("/gallery");
    revalidatePath("/blog");
    revalidatePath("/admin");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/dining");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/facilities");
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
    if (!isDatabaseConfigured()) {
        return getStaticSiteData();
    }

    try {
        const [
            heroImages,
            rooms,
            facilities,
            testimonials,
            menuCategories,
            contactInfoRow,
            blogPosts,
            leads,
            subscribers,
            promotions,
            users,
            galleryItems,
            siteContentRows
        ] = await Promise.all([
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
            prisma.galleryItem.findMany({ orderBy: { order: "asc" } }),
            prisma.siteContent.findMany()
        ]);

        const content = siteContentRows.reduce((acc: any, row: SiteContent) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        // Map DB rows to the shape the UI already expects
        return {
            heroImages: heroImages.map((h: HeroImage) => h.url),
            rooms: rooms.map((r: Room) => ({
                id: r.slug,
                name: r.name,
                desc: r.desc,
                price: r.price,
                image: r.image,
                tag: r.tag ?? undefined,
                capacity: r.capacity,
            })),
            facilities: facilities as Facility[],
            testimonials: testimonials as Testimonial[],
            menuCategories: menuCategories as MenuCategory[],
            contactInfo: contactInfoRow ? { ...(contactInfoRow as ContactInfo), social: (contactInfoRow as ContactInfo).social || {} } : getStaticSiteData().contactInfo,
            blogPosts: blogPosts as BlogPost[],
            leads: leads.map((l: Lead) => ({
                ...l,
                id: l.id,
                room: l.roomSlug ?? "",
            })),
            subscribers: subscribers.map((s: Subscriber) => s.email),
            promotions: promotions as Promotion[],
            users: users.map(({ password: _, ...u }: any) => u),
            galleryItems: galleryItems as GalleryItem[],
            galleryVideos: galleryItems.filter((i: GalleryItem) => i.type === "video"),
            content,
        };
    } catch (error) {
        console.error("Database connection failed, falling back to static data.", error);
        return getStaticSiteData();
    }
}

function getStaticSiteData() {
    return {
        heroImages: staticData.heroImages,
        rooms: staticData.rooms,
        facilities: staticData.facilities,
        testimonials: staticData.testimonials,
        menuCategories: staticData.menuCategories,
        contactInfo: staticData.contactInfo,
        blogPosts: [
            { id: "1", title: "The Art of Kenyan Hospitality", author: "Editorial Team", date: "2025-05-10", category: "Lifestyle", content: "...", excerpt: "...", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", createdAt: new Date() },
            { id: "2", title: "Culinary Excellence at Parkside", author: "Master Chef", date: "2025-05-12", category: "Dining", content: "...", excerpt: "...", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836", createdAt: new Date() }
        ],
        leads: [],
        subscribers: [],
        promotions: [],
        users: [],
        galleryItems: [],
        galleryVideos: [],
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
        if (!lead.email || !lead.name) {
            return { success: false, error: "Name and Email are required" };
        }

        // Resolve room relation if slug provided and exists
        const roomExists = lead.room
            ? await prisma.room.findUnique({ where: { slug: lead.room } })
            : null;

        const newLead = await prisma.lead.create({
            data: {
                name: lead.name,
                email: lead.email,
                phone: lead.phone ?? null,
                date: lead.date ?? null,
                guests: lead.guests ?? null,
                roomSlug: roomExists ? lead.room! : null,
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
                tag: updatedRoom.tag ?? null,
                capacity: updatedRoom.capacity ?? 2,
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error updating room:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteRoom(roomId: string) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        await prisma.room.delete({ where: { slug: roomId } });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error deleting room:", error);
        return { success: false, error: "Database error" };
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
    } catch (error) {
        console.error("Error updating testimonial:", error);
        return { success: false, error: "Database error" };
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
    await NotificationService.sendEmail(
        "concierge@parksidevillakitui.com",
        `New Public Review: ${review.name}`,
        review.text
    );
    return addTestimonial({ ...review, status: "Pending" });
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
    } catch (error) {
        console.error("Error updating dining category:", error);
        return { success: false, error: "Database error" };
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
            data: { id, title: f.title, desc: f.desc, icon: f.icon, image: f.image ?? null, features: f.features ?? [], highlights: f.highlights ?? [] },
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
                features: updatedFacility.features ?? [],
                highlights: updatedFacility.highlights ?? [],
            },
        });
        revalidateAll();
        return { success: true };
    } catch (error) {
        console.error("Error updating facility:", error);
        return { success: false, error: "Database error" };
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
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        if (!email || !email.includes("@")) return { success: false, error: "Valid email required" };
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

// ─────────────────────────────────────────────
// UPLOAD (Cloudinary Integration)
// ─────────────────────────────────────────────

import { v2 as cloudinary } from "cloudinary";

// Cloudinary configures itself automatically if CLOUDINARY_URL is present in the environment variables.

export async function uploadImage(formData: FormData) {
    await requireAdmin();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<{ url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "parkside_villa" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(new Error("Image upload failed"));
                }
                if (!result) return reject(new Error("Upload failed, no result"));
                resolve({ url: result.secure_url });
            }
        );
        uploadStream.end(buffer);
    });
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
    const adminEmail = process.env.ADMIN_EMAIL || "admin@parksidevilla.com";
    const adminPass = process.env.ADMIN_PASSWORD || "parkside2025";

    if (email === adminEmail && password === adminPass) {
        const token = await signToken({ email, role: "admin" });
        const cookieStore = await cookies();
        cookieStore.set("admin_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 2 // 2 hours
        });
        return { success: true };
    }

    return { success: false, message: "Invalid administrative credentials" };
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

export async function createBlogPost(post: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const newPost = await prisma.blogPost.create({
            data: {
                id: post.id || post.title.toLowerCase().replace(/\s+/g, "-"),
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                date: post.date || new Date().toISOString().split("T")[0],
                author: post.author || "Parkside Villa",
                category: post.category,
                image: post.image,
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
        await prisma.blogPost.update({
            where: { id },
            data: post,
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
        return await prisma.galleryItem.findMany({ orderBy: { order: "asc" } });
    } catch (error) {
        console.error("Error getting gallery items:", error);
        return [];
    }
}

export async function addGalleryItem(item: { url: string; type: string; title?: string }) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
        const count = await prisma.galleryItem.count();
        const newItem = await prisma.galleryItem.create({
            data: { ...item, order: count },
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

// Legacy compat — some admin pages still call updateSiteData directly for bulk ops
export async function updateSiteData(_data: any) {
    // No-op in Prisma mode — individual actions handle their own updates
    revalidateAll();
    return { success: true };
}

// ─────────────────────────────────────────────
// SITE CONTENT (Dynamic CMS)
// ─────────────────────────────────────────────

export async function updateSiteContent(key: string, value: any) {
    if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };
    try {
        await requireAdmin();
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
