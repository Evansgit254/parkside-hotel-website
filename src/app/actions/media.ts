"use server";

import fs from "fs";
import path from "path";

export async function getLocalMedia() {
    const cwd = process.cwd();

    // Recursive search for hero-assets starting from cwd, max depth 3
    const findDir = (curr: string, name: string, depth: number = 0): string | null => {
        if (depth > 3) return null;
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
    const publicPath = heroAssetsPath ? path.join(heroAssetsPath, "..") : path.join(cwd, "public");

    if (!heroAssetsPath) {
        // One last fallback: check if it's in the root but maybe readdir missed it?
        const directHero = path.join(cwd, "public", "hero-assets");
        const exists = fs.existsSync(directHero);

        return {
            success: false,
            error: `hero-assets folder not found. (CWD: ${cwd}, Searched 3 levels deep).`,
            files: []
        };
    }

    try {
        const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
            const files = fs.readdirSync(dirPath);
            files.forEach((file) => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                } else {
                    if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(file) && !file.startsWith("._")) {
                        // We want the URL to be /hero-assets/...
                        const relativePath = path.relative(publicPath, fullPath);
                        arrayOfFiles.push("/" + relativePath.replace(/\\/g, "/"));
                    }
                }
            });
            return arrayOfFiles;
        };

        const files = getAllFiles(heroAssetsPath).sort((a, b) => a.localeCompare(b));
        return { success: true, files };
    } catch (error: any) {
        return { success: false, error: "Failed to scan: " + error.message, files: [] };
    }
}
