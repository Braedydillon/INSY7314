const fs = require('fs');

const path = require('path');

const forge = require('node-forge');



// Generate a key pair

const pki = forge.pki;

const keys = pki.rsa.generateKeyPair(2048);

const cert = pki.createCertificate();



cert.publicKey = keys.publicKey;

cert.serialNumber = '01';

cert.validity.notBefore = new Date();

cert.validity.notAfter = new Date();

cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);



const attrs = [{ name: 'commonName', value: 'localhost' }];

cert.setSubject(attrs);

cert.setIssuer(attrs);

cert.sign(keys.privateKey);



const pemKey = pki.privateKeyToPem(keys.privateKey);

const pemCert = pki.certificateToPem(cert);



const certsDir = path.join(__dirname, 'certs');

if (!fs.existsSync(certsDir)) {

    fs.mkdirSync(certsDir, { recursive: true });

}



fs.writeFileSync(path.join(certsDir, 'key.pem'), pemKey);

fs.writeFileSync(path.join(certsDir, 'cert.pem'), pemCert);

console.log('Real valid SSL certificates generated successfully via node-forge!');