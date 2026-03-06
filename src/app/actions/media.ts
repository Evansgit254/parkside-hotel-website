"use server";

import fs from "fs";
import path from "path";

export async function getLocalMedia() {
    const cwd = process.cwd();

    // NFT HINT: statically reference one of our assets to force the whole folder into the bundle.
    // The Vercel builder sees this static path and traces the directory.
    const _nftHint = path.join(cwd, "public", "hero-assets", "1.webp");

    // Recursive search for hero-assets starting from cwd, max depth 5
    const findDir = (curr: string, name: string, depth: number = 0): string | null => {
        if (depth > 5) return null;
        try {
            const items = fs.readdirSync(curr);
            if (items.includes(name)) return path.join(curr, name);
            for (const item of items) {
                const full = path.join(curr, item);
                if (fs.statSync(full).isDirectory() && (!item.startsWith('.') || item === '.next')) {
                    const found = findDir(full, name, depth + 1);
                    if (found) return found;
                }
            }
        } catch (e) { }
        return null;
    };

    const heroAssetsPath = findDir(cwd, "hero-assets");

    if (!heroAssetsPath) {
        // Log directories at root for final diagnostic
        const rootContent = fs.readdirSync(cwd).join(", ");
        return {
            success: false,
            error: `[vDiag-5] hero-assets not found. CWD: ${cwd}, Root: ${rootContent}`,
            files: []
        };
    }

    try {
        const publicPath = path.join(heroAssetsPath, "..");
        const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
            const files = fs.readdirSync(dirPath);
            files.forEach((file) => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                } else {
                    if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(file) && !file.startsWith("._")) {
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
