const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const uploadWithCurl = (filePath, folder) => {
    console.log(`Uploading ${filePath} to folder ${folder} using curl...`);
    const command = `curl -s -u "${apiKey}:${apiSecret}" \
        "https://api.cloudinary.com/v1_1/${cloudName}/image/upload" \
        -F "file=@${filePath}" \
        -F "folder=${folder}" \
        -F "use_filename=true" \
        -F "unique_filename=true"`;

    try {
        const result = execSync(command).toString();
        const json = JSON.parse(result);
        if (json.secure_url) {
            console.log(`  -> Success: ${json.secure_url}`);
            return json;
        } else {
            console.error(`  -> Failed: ${result}`);
            return null;
        }
    } catch (err) {
        console.error(`  -> Curl error: ${err.message}`);
        return null;
    }
};

// Test with a small file if exists
const testFile = path.join(__dirname, '..', 'public', 'images', 'conference', 'longonot.png');
if (fs.existsSync(testFile)) {
    uploadWithCurl(testFile, 'test-curl-upload');
} else {
    console.log("Test file not found at " + testFile);
}
