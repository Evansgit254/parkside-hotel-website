"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import {
    rooms as initialRooms,
    facilities as initialFacilities,
    testimonials as initialTestimonials,
    menuCategories as initialMenuCategories,
    contactInfo as initialContactInfo,
    heroImages as initialHeroImages
} from "../data/site-data";

const DATA_PATH = path.join(process.cwd(), "src/data/site-data.json");

// Simple lock to prevent concurrent file writes/reads
let fileLock = Promise.resolve();

export async function getSiteData() {
    return fileLock.then(async () => {
        try {
            const content = await fs.readFile(DATA_PATH, "utf-8");
            const data = JSON.parse(content);
            return {
                heroImages: data.heroImages || initialHeroImages,
                rooms: data.rooms || initialRooms,
                facilities: data.facilities || initialFacilities,
                testimonials: data.testimonials || initialTestimonials,
                menuCategories: data.menuCategories || initialMenuCategories,
                contactInfo: data.contactInfo || initialContactInfo,
                blogPosts: data.blogPosts || [],
                leads: data.leads || []
            };
        } catch (error) {
            console.error("Error reading site data:", error);
            // Fallback to initial data if file is corrupted or empty
            return {
                heroImages: initialHeroImages,
                rooms: initialRooms,
                facilities: initialFacilities,
                testimonials: initialTestimonials,
                menuCategories: initialMenuCategories,
                contactInfo: initialContactInfo,
                leads: []
            };
        }
    });
}

export async function updateSiteData(newData: any) {
    const operation = fileLock.then(async () => {
        const tempPath = `${DATA_PATH}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(newData, null, 2));
        await fs.rename(tempPath, DATA_PATH);

        revalidatePath("/");
        revalidatePath("/dining");
        revalidatePath("/admin");
        revalidatePath("/admin/rooms");
        revalidatePath("/admin/dining");
        revalidatePath("/admin/leads");
        revalidatePath("/admin/facilities");
        revalidatePath("/admin/settings");
    });
    fileLock = operation.catch(() => { });
    await operation;
    return { success: true };
}

export async function addLead(lead: any) {
    const data = await getSiteData();
    const newLead = {
        ...lead,
        id: Date.now(),
        time: "Just now",
        status: "Pending"
    };
    data.leads = [newLead, ...(data.leads || [])];
    await updateSiteData(data);
    return { success: true };
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
    data.testimonials.push({ ...newTestimonial, id });
    await updateSiteData(data);
    return { success: true };
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

