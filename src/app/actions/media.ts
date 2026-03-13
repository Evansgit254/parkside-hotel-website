"use server";

import fs from "fs";
import path from "path";

/**
 * Server action to list local high-resolution media files.
 * This scans both the local development directory and the production 
 * bundled 'hero-assets' directory on Vercel.
 */
export async function getLocalMedia() {
    const cwd = process.cwd();

    // Recursive search for hero-assets folder, max depth 6 to handle Vercel's deep nesting
    const findDir = (curr: string, name: string, depth: number = 0): string | null => {
        if (depth > 6) return null;
        try {
            const items = fs.readdirSync(curr);
            if (items.includes(name)) return path.join(curr, name);
            for (const item of items) {
                const full = path.join(curr, item);
                if (fs.statSync(full).isDirectory()) {
                    const found = findDir(full, name, depth + 1);
                    if (found) return found;
                }
            }
        } catch (e) { }
        return null;
    };

    const heroAssetsPath = findDir(cwd, "hero-assets");
    const villaMediaPath = findDir(cwd, "PARKSIDE VILLA MEDIA");

    if (!heroAssetsPath && !villaMediaPath) {
        return {
            success: false,
            error: "Local media assets folder not found on server.",
            files: []
        };
    }

    try {
        const allMediaFiles: any[] = [];

        const EXCLUDED_DIRS = ['System Volume Information', 'autorun.inf', '.next', '.git', 'node_modules'];

        const getAllFiles = (dirPath: string, rootDir: string) => {
            const items = fs.readdirSync(dirPath);
            items.forEach((item) => {
                const fullPath = path.join(dirPath, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (!EXCLUDED_DIRS.includes(item)) {
                        getAllFiles(fullPath, rootDir);
                    }
                } else {
                    // Include common media formats and ignore hidden/system files
                    if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(item) && !item.startsWith("._")) {
                        const publicRoot = path.join(rootDir, "..");
                        const relativePath = path.relative(publicRoot, fullPath);
                        const urlPath = "/" + relativePath.replace(/\\/g, "/");

                        // Extract metadata for labeling
                        const parts = relativePath.split(/[\\/]/);
                        const filename = parts.pop() || "";
                        const folder = parts.pop() || "";
                        const parentFolder = parts.pop() || "";

                        // Determine Category - Specific keywords first
                        let category = "General";
                        const fullPathLower = fullPath.toLowerCase();

                        // Order matters for specificity
                        if (fullPathLower.includes("high rise")) category = "Rooms";
                        else if (fullPathLower.includes("cottage")) category = "Rooms";
                        else if (fullPathLower.includes("accommodation") || fullPathLower.includes("room")) category = "Rooms";
                        else if (fullPathLower.includes("vip lounge")) category = "Dining";
                        else if (fullPathLower.includes("ground dining")) category = "Dining";
                        else if (fullPathLower.includes("dining") || fullPathLower.includes("restaurant") || fullPathLower.includes("eateries") || fullPathLower.includes("food")) category = "Dining";
                        else if (fullPathLower.includes("conference") || fullPathLower.includes("hall")) category = "Conference";
                        else if (fullPathLower.includes("swimming pool") || fullPathLower.includes("pool table")) category = "Facilities";
                        else if (fullPathLower.includes("pool") || fullPathLower.includes("bar") || fullPathLower.includes("lounge") || fullPathLower.includes("play ground") || fullPathLower.includes("facility")) category = "Facilities";
                        else if (fullPathLower.includes("event") || fullPathLower.includes("wedding")) category = "Events";
                        else if (fullPathLower.includes("video")) category = "Videos";

                        allMediaFiles.push({
                            path: urlPath,
                            name: filename,
                            folder: folder,
                            parent: parentFolder,
                            category: category,
                            tags: [category, folder, parentFolder, filename.split('.')[0]].filter(Boolean).map(t => t.toLowerCase())
                        });
                    }
                }
            });
        };

        if (heroAssetsPath) getAllFiles(heroAssetsPath, heroAssetsPath);
        if (villaMediaPath) getAllFiles(villaMediaPath, villaMediaPath);

        // Sort by category then name
        const files = allMediaFiles.sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.name.localeCompare(b.name);
        });

        return {
            success: true,
            files
        };
    } catch (error: any) {
        console.error("Local media scan error:", error);
        return { success: false, error: "Failed to scan high-res media directory.", files: [] };
    }
}
