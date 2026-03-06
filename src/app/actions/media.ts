"use server";

import fs from "fs";
import path from "path";

export async function getLocalMedia() {
    const cwd = process.cwd();

    // Debug: List the root directory
    let rootContent: string[] = [];
    try {
        rootContent = fs.readdirSync(cwd);
    } catch (e: any) {
        rootContent = ["Error reading CWD: " + e.message];
    }

    const publicPath = path.join(cwd, "public");
    const heroDir = path.join(publicPath, "hero-assets");

    // Check if we are in a .next/server kind of environment
    const altPublicPath = path.join(cwd, "..", "..", "..", "public");

    const scanDirs = [];
    if (fs.existsSync(heroDir)) scanDirs.push(heroDir);

    if (scanDirs.length === 0) {
        return {
            success: false,
            error: `Media directories not found. (CWD: ${cwd}, RootContent: ${rootContent.join(", ")}, PublicExists: ${fs.existsSync(publicPath)})`,
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

        let allFiles: string[] = [];
        scanDirs.forEach(dir => {
            allFiles = getAllFiles(dir, allFiles);
        });

        const files = Array.from(new Set(allFiles)).sort((a, b) => a.localeCompare(b));
        return { success: true, files };
    } catch (error) {
        return { success: false, error: "Failed to scan media directory", files: [] };
    }
}
