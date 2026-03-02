const https = require('https');

const test = (url) => {
    console.log(`Testing connection to ${url}...`);
    const start = Date.now();
    https.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
        console.log(`Time taken: ${Date.now() - start}ms`);
        res.on('data', () => { });
    }).on('error', (err) => {
        console.error(`Error: ${err.message}`);
        console.error(err);
        console.log(`Time taken: ${Date.now() - start}ms`);
    });
};

test('https://api.cloudinary.com/v1_1/dizwm3mic/ping');
test('https://www.google.com');
