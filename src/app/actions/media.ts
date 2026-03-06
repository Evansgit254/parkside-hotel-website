"use server";

import fs from "fs";
import path from "path";

export async function getLocalMedia() {
    const mediaDir = path.join(process.cwd(), "public", "PARKSIDE VILLA MEDIA");
    const heroDir = path.join(process.cwd(), "public", "hero-assets");

    const scanDirs = [];
    if (fs.existsSync(heroDir)) scanDirs.push(heroDir);
    if (fs.existsSync(mediaDir)) scanDirs.push(mediaDir);

    if (scanDirs.length === 0) {
        return { success: false, error: "Media directories not found", files: [] };
    }

    try {
        const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
            if (!fs.existsSync(dirPath)) return arrayOfFiles;

            const files = fs.readdirSync(dirPath);

            files.forEach((file) => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (file !== "System Volume Information" && file !== "$RECYCLE.BIN") {
                        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                    }
                } else {
                    // Only include common image formats and ignore metadata files
                    if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(file) && !file.startsWith("._")) {
                        const relativePath = path.relative(path.join(process.cwd(), "public"), fullPath);
                        arrayOfFiles.push("/" + relativePath.replace(/\\/g, "/"));
                    }
                }
            });

            return arrayOfFiles;
        };

        let allFiles: string[] = [];
        scanDirs.forEach(dir => {
            allFiles = getAllFiles(dir, allFiles);
        });

        // Unique files and sort
        const files = Array.from(new Set(allFiles)).sort((a, b) => a.localeCompare(b));

        return { success: true, files };
    } catch (error) {
        console.error("Error listing local media:", error);
        return { success: false, error: "Failed to scan media directory", files: [] };
    }
}
