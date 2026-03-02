const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const sharp = require('sharp');

// Configure Cloudinary using the environment variable automatically
// or manually if needed.
if (process.env.CLOUDINARY_URL) {
    // If CLOUDINARY_URL is present, we don't need to pass a config object 
    // but we can log that we found it.
    console.log("Cloudinary URL found in environment.");
} else {
    console.error("DEBUG: CLOUDINARY_URL is NOT set.");
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB Cloudinary limit

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
    console.error("CLOUDINARY_URL not found.");
    process.exit(1);
}

// URL format: cloudinary://api_key:api_secret@cloud_name
const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (!match) {
    console.error("Invalid CLOUDINARY_URL format.");
    process.exit(1);
}

const [, apiKey, apiSecret, cloudName] = match;

const uploadWithCurl = async (filePath, folder) => {
    const command = `curl -s -u "${apiKey}:${apiSecret}" \\
        "https://api.cloudinary.com/v1_1/${cloudName}/image/upload" \\
        -F "file=@${filePath}" \\
        -F "folder=${folder}" \\
        -F "use_filename=true" \\
        -F "unique_filename=true"`;

    try {
        const { stdout } = await execPromise(command);
        const json = JSON.parse(stdout.toString());
        return json;
    } catch (err) {
        console.error(`  -> Curl error for ${filePath}: ${err.message}`);
        return { error: { message: err.message } };
    }
};

const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'System Volume Information' && file !== 'autorun.inf' && file !== '$RECYCLE.BIN') {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            if (!file.startsWith('.')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });
    return arrayOfFiles;
};

const CONCURRENCY_LIMIT = 5;

const processFile = async (filePath, parentDir, tempDir, outputJson) => {
    const relativePath = path.relative(parentDir, path.dirname(filePath));
    const folderKey = relativePath || "Root";
    const file = path.basename(filePath);

    // Get fresh data to check if already uploaded (to handle parallel worker overlap)
    let currentData = JSON.parse(fs.readFileSync(outputJson, 'utf8'));
    if (!currentData[folderKey]) currentData[folderKey] = [];

    if (currentData[folderKey].some(item => item.originalName === file)) {
        return;
    }

    let uploadPath = filePath;
    let isTemp = false;

    try {
        const stats = fs.statSync(filePath);
        console.log(`Checking: ${folderKey}/${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        if (stats.size > MAX_SIZE_BYTES) {
            console.log(`  -> Resizing ${file}...`);
            const tempFilePath = path.join(tempDir, `resized_${file}.jpg`);
            try {
                await sharp(filePath)
                    .resize({ width: 2500, withoutEnlargement: true })
                    .jpeg({ quality: 85, progressive: true })
                    .toFile(tempFilePath);
                uploadPath = tempFilePath;
                isTemp = true;
            } catch (sharpErr) {
                console.error(`  -> Sharp error for ${file}:`, sharpErr.message);
                return;
            }
        }

        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
            const cloudinaryFolder = `parkside-villa-media/${folderKey.replace(/ /g, '_').replace(/\\/g, '/').replace(/\//g, '_')}`;
            const res = await uploadWithCurl(uploadPath, cloudinaryFolder);

            if (res && res.secure_url) {
                // Thread-safe update: reload data from disk before push
                let latestData = JSON.parse(fs.readFileSync(outputJson, 'utf8'));
                if (!latestData[folderKey]) latestData[folderKey] = [];

                // Final check to avoid double-entry from racers
                if (!latestData[folderKey].some(item => item.originalName === file)) {
                    latestData[folderKey].push({
                        originalName: file,
                        url: res.secure_url,
                        publicId: res.public_id,
                        width: res.width,
                        height: res.height,
                        format: res.format,
                        resized: isTemp
                    });
                    fs.writeFileSync(outputJson, JSON.stringify(latestData, null, 2));
                }

                console.log(`  -> Success: ${file}`);
                success = true;
            } else {
                retries--;
                console.error(`  -> Failed ${file} (${retries} retries left):`, res ? res.error || res : "Unknown error");
                if (retries > 0) await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (err) {
        console.error(`  -> Error processing ${file}:`, err.message);
    } finally {
        if (isTemp && fs.existsSync(uploadPath)) {
            try { fs.unlinkSync(uploadPath); } catch (e) { }
        }
    }
};

const uploadMedia = async () => {
    const rootDir = __dirname.includes('node_modules') ? path.join(__dirname, '..', '..') : path.join(__dirname, '..');
    const parentDir = path.join(rootDir, 'PARKSIDE VILLA MEDIA');
    const outputJson = path.join(rootDir, 'uploaded_media.json');
    const tempDir = path.join(rootDir, 'temp_uploads');

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(outputJson)) fs.writeFileSync(outputJson, '{}');

    try {
        if (!fs.existsSync(parentDir)) {
            console.error(`Directory not found: ${parentDir}`);
            return;
        }

        console.log("Scanning files...");
        const allFiles = getAllFiles(parentDir);
        console.log(`Found ${allFiles.length} total files. Starting Turbo Mode (Concurrency: ${CONCURRENCY_LIMIT})...`);

        const queue = [...allFiles];

        const worker = async () => {
            while (queue.length > 0) {
                const filePath = queue.shift();
                if (!filePath) break;
                await processFile(filePath, parentDir, tempDir, outputJson);
            }
        };

        // Start workers
        const workers = Array(CONCURRENCY_LIMIT).fill(0).map(() => worker());
        await Promise.all(workers);

        console.log('\n--- Turbo Upload complete ---');
    } catch (error) {
        console.error("Critical error:", error);
    }
}

// Ensure the command is running with the environment variable
if (!process.env.CLOUDINARY_URL) {
    console.error("Please provide the CLOUDINARY_URL environment variable.");
    process.exit(1);
}

uploadMedia();
