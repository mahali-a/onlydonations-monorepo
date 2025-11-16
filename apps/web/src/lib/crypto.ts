/**
 * Crypto utilities compatible with Cloudflare Workers
 * Uses Web Crypto API available in Workers runtime
 */

/**
 * Generate a random string for honeypot field names
 */
export function randomString(length: number = 16): string {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive a key from a seed string using PBKDF2
 */
async function deriveKey(seed: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(seed),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	);

	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: encoder.encode('honeypot-salt'), // Static salt is OK for this use case
			iterations: 100000,
			hash: 'SHA-256',
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypt a value using AES-GCM
 */
export async function encrypt(value: string, seed: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await deriveKey(seed);
	
	// Generate a random IV
	const iv = crypto.getRandomValues(new Uint8Array(12));
	
	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv,
		},
		key,
		encoder.encode(value)
	);

	// Combine IV and encrypted data
	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(encrypted), iv.length);

	// Convert to base64
	return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a value using AES-GCM
 */
export async function decrypt(encryptedValue: string, seed: string): Promise<string | null> {
	try {
		const key = await deriveKey(seed);
		
		// Decode from base64
		const combined = Uint8Array.from(atob(encryptedValue), (c) => c.charCodeAt(0));
		
		// Extract IV and encrypted data
		const iv = combined.slice(0, 12);
		const encrypted = combined.slice(12);

		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: iv,
			},
			key,
			encrypted
		);

		const decoder = new TextDecoder();
		return decoder.decode(decrypted);
	} catch (error) {
		// Decryption failed
		return null;
	}
}
