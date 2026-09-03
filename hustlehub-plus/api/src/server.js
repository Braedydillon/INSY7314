import https from 'https';
import fs from 'fs';
import path from 'path';

import app from './app.js';
import config from './config/env.js';

const __dirname = path.dirname(__filename);

const USE_HTTPS = process.env.USE_HTTPS === 'true';

if (USE_HTTPS) {

    const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '..', 'certs', 'localhost-key.pem');

    const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '..', 'certs', 'localhost-cert.pem');

    const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(config.PORT, () => {
        console.log(`HTTPS server running on port ${config.PORT}`);
    });

} else {

 app.listen(config.PORT, () => {
        console.log(`HTTP server running on port ${config.PORT}`);
    });
}
