// LocalStorage abstraction — namespaced, SSR-safe, and tolerant of a browser
// that refuses storage entirely (private windows, blocked site data).

const PREFIX = 'mattetrening_v1_';

/** The pre-0.6 namespace, kept only so existing progress survives the rename. */
const LEGACY_PREFIX = 'derivasjon_v3_';

/** Keys that are worth carrying over from the old namespace. */
const MIGRATE_KEYS = ['student_model'];

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
		// Storage full or unavailable — fail silently rather than break the app.
	}
}

export function remove(key: string): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(getKey(key));
	} catch {
		/* ignore */
	}
}

export function clear(): void {
	if (typeof window === 'undefined') return;
	try {
		const keys: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i);
			if (k?.startsWith(PREFIX)) keys.push(k);
		}
		keys.forEach((k) => localStorage.removeItem(k));
	} catch {
		/* ignore */
	}
}

/**
 * Copy pre-0.6 data into the current namespace, once.
 *
 * Only runs when the new key is absent, so it can never clobber newer data.
 * The old keys are left in place — harmless, and a safety net if a student
 * opens an older deployment.
 */
export function migrateLegacy(): void {
	if (typeof window === 'undefined') return;
	try {
		for (const key of MIGRATE_KEYS) {
			if (localStorage.getItem(getKey(key)) !== null) continue;
			const legacy = localStorage.getItem(LEGACY_PREFIX + key);
			if (legacy !== null) localStorage.setItem(getKey(key), legacy);
		}
	} catch {
		/* ignore */
	}
}
