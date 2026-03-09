
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

// Extract credentials from CLOUDINARY_URL
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
    console.error("CLOUDINARY_URL not found in environment");
    process.exit(1);
}

const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (!urlMatch) {
    console.error("Invalid CLOUDINARY_URL format");
    process.exit(1);
}

const [, apiKey, apiSecret, cloudName] = urlMatch;

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
});

async function cleanupCloudinary() {
    const folders = ['parkside_villa/', 'parkside-villa-media/'];
    console.log("Starting Cloudinary cleanup for folders:", folders);

    try {
        for (const folder of folders) {
            console.log(`\n🧹 Processing folder: ${folder}...`);
            // Delete all resources in the folder
            const result = await cloudinary.api.delete_resources_by_prefix(folder);
            console.log(`Cleanup result for ${folder}:`, result);

            // Also try to delete folder itself (only works if empty)
            try {
                const folderName = folder.replace('/', '');
                await cloudinary.api.delete_folder(folderName);
                console.log(`Folder '${folderName}' deleted.`);
            } catch (e) {
                console.log(`Note: Folder '${folder}' itself couldn't be deleted (might still contain subfolders or other resource types), but resources with prefix were processed.`);
            }
        }

        console.log("\n✅ Cloudinary cleanup complete.");
    } catch (error) {
        console.error("Cleanup failed:", error);
    }
}

cleanupCloudinary();
