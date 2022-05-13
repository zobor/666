const keyLocal = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCIZ+qXpFnwaZkIpTQ1LKWbd1o
52s8PZR1j1uG7NYAP1zW71lrQBRVr9EaD7xl4/VBu2vRBb8UTVc01Lpxd0DlfPFt
QVgCY46fMM8qUJ3+AmG5LlsVIENn0QXsuKa7JuabBPzeZavdYED9+L35NSqHR3KZ
baXF1vRlBn9NCQ/LeQIDAQ11
-----END PUBLIC KEY-----`;


export const defaultServerPublicKey = keyLocal;

export function removeLines(str) {
    return str.replace(/\n/g, '');
}

export function base64ToArrayBuffer(b64) {
    const byteString = window.atob(b64);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; ) {
        byteArray[i] = byteString.charCodeAt(i);
        i += 1;
    }

    return byteArray;
}

export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; ) {
        binary += String.fromCharCode(bytes[i]);

        i += 1;
    }

    return window.btoa(binary);
}

export function string2arrayBuffer(str) {
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(str);

    return encodedText;
}

export function pemPublicToArrayBuffer(pem) {
    const b64Lines = removeLines(pem);
    const b64Prefix = b64Lines.replace('-----BEGIN PUBLIC KEY-----', '');
    const b64Final = b64Prefix.replace('-----END PUBLIC KEY-----', '');

    return base64ToArrayBuffer(b64Final);
}

export function importKey(serverPublicKey) {
    return window.crypto.subtle.importKey(
        'spki',
        pemPublicToArrayBuffer(serverPublicKey),
        {
            name: 'RSA-OAEP',
            hash: { name: 'SHA-256' },
        },
        false,
        ['encrypt']
    );
}

export function encrypt(encodedText, importedPublicKey) {
    return window.crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        importedPublicKey,
        encodedText
    );
}

export function webCrypto(text, pubKey = defaultServerPublicKey) {
    return new Promise((resolve, reject) => {
        importKey(pubKey)
            .then((keyObject) => {
                const textEncoded = string2arrayBuffer(text);

                encrypt(textEncoded, keyObject).then((cryptoText) => {
                    try {
                        resolve(arrayBufferToBase64(cryptoText));
                    } catch (err) {
                        reject(err);
                    }
                }).catch((err) => {
                    reject(err);
                });
            })
            .catch((err) => {
                reject(err);
            });
    });
}
