"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { NotificationService } from "./services/mailService";
import {
    rooms as initialRooms,
    facilities as initialFacilities,
    testimonials as initialTestimonials,
    menuCategories as initialMenuCategories,
    contactInfo as initialContactInfo,
    heroImages as initialHeroImages
} from "../data/site-data";

const DATA_PATH = path.join(process.cwd(), "src/data/site-data.json");
const BLOB_KEY = "site-data.json";
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

// Lock for local dev file writes
let fileLock = Promise.resolve();

export async function getSiteData() {
    const fallback = {
        heroImages: initialHeroImages,
        rooms: initialRooms,
        facilities: initialFacilities,
        testimonials: initialTestimonials,
        menuCategories: initialMenuCategories,
        contactInfo: initialContactInfo,
        blogPosts: [],
        leads: [],
        subscribers: [],
        promotions: [],
        users: [],
        galleryVideos: []
    };

    try {
        let content: string;

        if (USE_BLOB) {
            // Production: read from Vercel Blob
            const { list } = await import("@vercel/blob");
            const { blobs } = await list({ prefix: BLOB_KEY });
            if (blobs.length === 0) return fallback;
            const res = await fetch(blobs[0].url, { cache: 'no-store' });
            content = await res.text();
        } else {
            // Local dev: read from JSON file
            content = await fs.readFile(DATA_PATH, "utf-8");
        }

        const data = JSON.parse(content);
        return {
            heroImages: data.heroImages || initialHeroImages,
            rooms: data.rooms || initialRooms,
            facilities: data.facilities || initialFacilities,
            testimonials: data.testimonials || initialTestimonials,
            menuCategories: data.menuCategories || initialMenuCategories,
            contactInfo: data.contactInfo || initialContactInfo,
            blogPosts: data.blogPosts || [],
            leads: data.leads || [],
            subscribers: data.subscribers || [],
            promotions: data.promotions || [],
            users: data.users || [],
            galleryVideos: data.galleryVideos || []
        };
    } catch (error) {
        console.error("Error reading site data:", error);
        return fallback;
    }
}

export async function updateSiteData(newData: any) {
    const jsonStr = JSON.stringify(newData, null, 2);

    if (USE_BLOB) {
        // Production: write to Vercel Blob
        const { put } = await import("@vercel/blob");
        await put(BLOB_KEY, jsonStr, { access: 'public', addRandomSuffix: false });
    } else {
        // Local dev: write to JSON file (with lock)
        const operation = fileLock.then(async () => {
            const tempPath = `${DATA_PATH}.tmp`;
            await fs.writeFile(tempPath, jsonStr);
            await fs.rename(tempPath, DATA_PATH);
        });
        fileLock = operation.catch(() => { });
        await operation;
    }

    revalidatePath("/");
    revalidatePath("/dining");
    revalidatePath("/admin");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/dining");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/facilities");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/promotions");

    return { success: true };
}

export async function addLead(lead: any) {
    try {
        if (!lead.email || !lead.name) {
            return { success: false, error: "Name and Email are required" };
        }

        const data = await getSiteData();
        const newLead = {
            ...lead,
            id: Date.now(),
            time: "Just now",
            status: "Pending"
        };
        data.leads = [newLead, ...(data.leads || [])];
        await updateSiteData(data);

        // Trigger Notifications (Fire and forget or catch errors)
        NotificationService.notifyAdminNewLead(newLead).catch(err =>
            console.error("Failed to notify admin:", err)
        );

        return { success: true };
    } catch (error) {
        console.error("Error adding lead:", error);
        return { success: false, error: "System error while processing reservation" };
    }
}

export async function updateRoom(roomId: string, updatedRoom: any) {
    const data = await getSiteData();
    data.rooms = data.rooms.map((r: any) => r.id === roomId ? updatedRoom : r);
    await updateSiteData(data);
    return { success: true };
}

export async function updateDiningCategory(categoryId: string, updatedCategory: any) {
    const data = await getSiteData();
    data.menuCategories = data.menuCategories.map((c: any) => c.id === categoryId ? updatedCategory : c);
    await updateSiteData(data);
    return { success: true };
}

export async function updateTestimonial(id: number, updatedData: any) {
    const data = await getSiteData();
    data.testimonials = data.testimonials.map((t: any) => t.id === id ? updatedData : t);
    await updateSiteData(data);
    return { success: true };
}

export async function addTestimonial(newTestimonial: any) {
    const data = await getSiteData();
    const id = Math.max(0, ...data.testimonials.map((t: any) => t.id)) + 1;
    data.testimonials.push({
        ...newTestimonial,
        id,
        status: newTestimonial.status || 'Active' // Default to Active for admin, but public ones can be 'Pending'
    });
    await updateSiteData(data);
    return { success: true };
}

export async function submitPublicReview(review: any) {
    await NotificationService.sendEmail("concierge@parksidevillakitui.com", `New Public Review: ${review.name}`, review.text);
    return addTestimonial({
        ...review,
        status: 'Pending',
        createdAt: new Date().toISOString()
    });
}

export async function deleteTestimonial(id: number) {
    const data = await getSiteData();
    data.testimonials = data.testimonials.filter((t: any) => t.id !== id);
    await updateSiteData(data);
    return { success: true };
}

export async function updateContactInfo(contactInfo: any) {
    const data = await getSiteData();
    data.contactInfo = contactInfo;
    await updateSiteData(data);
    return { success: true };
}

export async function createRoom(newRoom: any) {
    const data = await getSiteData();
    data.rooms.push({ ...newRoom, id: newRoom.id || newRoom.name.toLowerCase().replace(/\s+/g, '-') });
    await updateSiteData(data);
    return { success: true };
}

export async function deleteRoom(roomId: string) {
    const data = await getSiteData();
    data.rooms = data.rooms.filter((r: any) => r.id !== roomId);
    await updateSiteData(data);
    return { success: true };
}

export async function createDiningCategory(newCategory: any) {
    const data = await getSiteData();
    data.menuCategories.push({ ...newCategory, id: newCategory.id || newCategory.name.toLowerCase().replace(/\s+/g, '-') });
    await updateSiteData(data);
    return { success: true };
}

export async function deleteDiningCategory(categoryId: string) {
    const data = await getSiteData();
    data.menuCategories = data.menuCategories.filter((c: any) => c.id !== categoryId);
    await updateSiteData(data);
    return { success: true };
}

export async function addFacility(newFacility: any) {
    const data = await getSiteData();
    data.facilities.push({ ...newFacility, id: newFacility.id || newFacility.title.toLowerCase().replace(/\s+/g, '-') });
    await updateSiteData(data);
    return { success: true };
}

export async function updateFacility(facilityId: string, updatedFacility: any) {
    const data = await getSiteData();
    data.facilities = data.facilities.map((f: any) => f.id === facilityId ? updatedFacility : f);
    await updateSiteData(data);
    return { success: true };
}

export async function deleteFacility(facilityId: string) {
    const data = await getSiteData();
    data.facilities = data.facilities.filter((f: any) => f.id !== facilityId);
    await updateSiteData(data);
    return { success: true };
}

export async function addHeroImage(imageUrl: string) {
    const data = await getSiteData();
    data.heroImages.push(imageUrl);
    await updateSiteData(data);
    return { success: true };
}

export async function deleteHeroImage(imageUrl: string) {
    const data = await getSiteData();
    data.heroImages = data.heroImages.filter((img: string) => img !== imageUrl);
    await updateSiteData(data);
    return { success: true };
}

export async function updateLeadStatus(id: number, status: string) {
    const data = await getSiteData();
    data.leads = data.leads.map((l: any) => l.id === id ? { ...l, status } : l);
    await updateSiteData(data);
    return { success: true };
}

export async function deleteLead(id: number) {
    const data = await getSiteData();
    data.leads = data.leads.filter((l: any) => l.id !== id);
    await updateSiteData(data);
    return { success: true };
}

export async function uploadImage(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file uploaded");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }

    await fs.writeFile(filePath, buffer);
    return { url: `/uploads/${filename}` };
}

export async function subscribeNewsletter(email: string) {
    try {
        if (!email || !email.includes("@")) return { success: false, error: "Valid email required" };
        const data = await getSiteData();
        if (!data.subscribers) data.subscribers = [];
        if (data.subscribers.includes(email)) return { success: true, alreadyExists: true };

        data.subscribers.push(email);
        await updateSiteData(data);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Subscription failed" };
    }
}

export async function getPromotions() {
    const data = await getSiteData();
    return data.promotions || [];
}

export async function addPromotion(promotion: any) {
    const data = await getSiteData();
    if (!data.promotions) data.promotions = [];
    const newPromotion = {
        ...promotion,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };
    data.promotions.push(newPromotion);
    await updateSiteData(data);
    return { success: true, promotion: newPromotion };
}

export async function deletePromotion(id: string) {
    const data = await getSiteData();
    data.promotions = (data.promotions || []).filter((p: any) => p.id !== id);
    await updateSiteData(data);
    return { success: true };
}

export async function requestBookingAction(bookingId: number, type: 'modify' | 'cancel', reason: string) {
    const data = await getSiteData();
    data.leads = (data.leads || []).map((l: any) => {
        if (l.id === bookingId) {
            return {
                ...l,
                status: `Request: ${type === 'modify' ? 'Modification' : 'Cancellation'}`,
                notes: `${l.notes || ''}\n[${new Date().toISOString()}] Request: ${type.toUpperCase()} - Reason: ${reason}`
            };
        }
        return l;
    });
    await updateSiteData(data);
    return { success: true };
}

// --- AUTH & PROFILE ACTIONS ---

export async function loginUser(email: string, password: string) {
    try {
        const data = await getSiteData();
        const user = (data.users || []).find((u: any) => u.email === email && u.password === password);
        if (!user) return { success: false, message: "Invalid email or password" };

        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "An unexpected error occurred during login" };
    }
}

export async function registerUser(user: any) {
    const data = await getSiteData();
    if (!data.users) data.users = [];

    if (data.users.find((u: any) => u.email === user.email)) {
        return { success: false, message: "Email already registered" };
    }

    const newUser = {
        ...user,
        id: Date.now().toString(),
        joinedAt: new Date().toISOString()
    };

    data.users.push(newUser);
    await updateSiteData(data);

    const { password: _, ...safeUser } = newUser;
    return { success: true, user: safeUser };
}

export async function updateProfile(userId: string, updates: any) {
    const data = await getSiteData();
    data.users = (data.users || []).map((u: any) => {
        if (u.id === userId) {
            return { ...u, ...updates };
        }
        return u;
    });
    await updateSiteData(data);
    return { success: true };
}

export async function getUserBookings(userId: string) {
    const data = await getSiteData();
    // Filter leads where email matches user email (or we add a userId to leads)
    const user = (data.users || []).find((u: any) => u.id === userId);
    if (!user) return [];

    return (data.leads || []).filter((l: any) => l.email === user.email);
}

