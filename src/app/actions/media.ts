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
        const allMediaFiles: string[] = [];

        const getAllFiles = (dirPath: string, rootDir: string) => {
            const items = fs.readdirSync(dirPath);
            items.forEach((item) => {
                const fullPath = path.join(dirPath, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    getAllFiles(fullPath, rootDir);
                } else {
                    // Include common media formats and ignore hidden/system files
                    if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(item) && !item.startsWith("._")) {
                        // The URL path should be relative to 'public' equivalent
                        // On Vercel, the structure is .next/server/chunks/public/...
                        const publicRoot = path.join(rootDir, "..");
                        const relativePath = path.relative(publicRoot, fullPath);
                        allMediaFiles.push("/" + relativePath.replace(/\\/g, "/"));
                    }
                }
            });
        };

        if (heroAssetsPath) getAllFiles(heroAssetsPath, heroAssetsPath);
        if (villaMediaPath) getAllFiles(villaMediaPath, villaMediaPath);

        const files = Array.from(new Set(allMediaFiles)).sort((a, b) => a.localeCompare(b));

        return {
            success: true,
            files
        };
    } catch (error: any) {
        console.error("Local media scan error:", error);
        return { success: false, error: "Failed to scan high-res media directory.", files: [] };
    }
}
