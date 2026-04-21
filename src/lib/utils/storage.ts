// LocalStorage abstraction layer with type safety and fallbacks

const PREFIX = 'derivasjon_v3_';

function getKey(key: string): string {
	return PREFIX + key;
}

export function load<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(getKey(key));
		if (raw === null) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export function save<T>(key: string, value: T): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(getKey(key), JSON.stringify(value));
	} catch {
		// Storage full or unavailable – fail silently
	}
}

export function remove(key: string): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(getKey(key));
}

export function clear(): void {
	if (typeof window === 'undefined') return;
	const keys: string[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const k = localStorage.key(i);
		if (k?.startsWith(PREFIX)) keys.push(k);
	}
	keys.forEach((k) => localStorage.removeItem(k));
}
