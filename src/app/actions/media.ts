"use server";

import fs from "fs";
import path from "path";

export async function getLocalMedia() {
    const cwd = process.cwd();

    // Recursive search for hero-assets starting from cwd, max depth 4
    const findDir = (curr: string, name: string, depth: number = 0): string | null => {
        if (depth > 4) return null;
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

    // Also specifically checking .next/static/media or .next/server/chunks
    const nextPath = path.join(cwd, ".next");
    let nextContent: string[] = [];
    if (fs.existsSync(nextPath)) {
        try {
            nextContent = fs.readdirSync(nextPath);
        } catch (e) { }
    }

    if (!heroAssetsPath) {
        return {
            success: false,
            error: `[vDiag-4] hero-assets folder not found. (CWD: ${cwd}, .next exists: ${fs.existsSync(nextPath)}, .next Content: ${nextContent.join(", ")})`,
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
