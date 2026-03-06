"use server";

import fs from "fs";
import path from "path";

export async function getLocalMedia() {
    const cwd = process.cwd();
    const mediaDir = path.join(cwd, "public", "PARKSIDE VILLA MEDIA");
    const heroDir = path.join(cwd, "public", "hero-assets");

    // Debugging: check common paths
    const publicPath = path.join(cwd, "public");
    let publicExists = fs.existsSync(publicPath);
    let publicContent: string[] = [];
    if (publicExists) {
        publicContent = fs.readdirSync(publicPath);
    }

    const scanDirs = [];
    if (fs.existsSync(heroDir)) scanDirs.push(heroDir);
    if (fs.existsSync(mediaDir)) scanDirs.push(mediaDir);

    if (scanDirs.length === 0) {
        return {
            success: false,
            error: `Media directories not found. (CWD: ${cwd}, PublicExists: ${publicExists}, PublicContent: ${publicContent.join(", ")})`,
            files: []
        };
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
                    if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(file) && !file.startsWith("._")) {
                        const relativePath = path.relative(publicPath, fullPath);
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

        const files = Array.from(new Set(allFiles)).sort((a, b) => a.localeCompare(b));

        return { success: true, files };
    } catch (error) {
        console.error("Error listing local media:", error);
        return { success: false, error: "Failed to scan media directory", files: [] };
    }
}
