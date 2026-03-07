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

    if (!heroAssetsPath) {
        return {
            success: false,
            error: "High-resolution hero assets folder not found on server.",
            files: []
        };
    }

    try {
        // The URL path should be relative to the 'public' equivalent to be served by Next.js
        const publicPath = path.join(heroAssetsPath, "..");

        const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
            const files = fs.readdirSync(dirPath);
            files.forEach((file) => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                } else {
                    // Include common media formats and ignore hidden/system files
                    if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(file) && !file.startsWith("._")) {
                        const relativePath = path.relative(publicPath, fullPath);
                        arrayOfFiles.push("/" + relativePath.replace(/\\/g, "/"));
                    }
                }
            });
            return arrayOfFiles;
        };

        const files = getAllFiles(heroAssetsPath).sort((a, b) => a.localeCompare(b));

        return {
            success: true,
            files
        };
    } catch (error: any) {
        console.error("Local media scan error:", error);
        return { success: false, error: "Failed to scan high-res media directory.", files: [] };
    }
}
