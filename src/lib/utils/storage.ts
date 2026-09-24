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

let availableCache: boolean | null = null;

/**
 * Whether this browser keeps what we save. Private windows and blocked site
 * data refuse it, and every save then fails silently by design — so the app
 * asks once, and tells the student their progress will not be kept.
 */
export function isAvailable(): boolean {
	if (typeof window === 'undefined') return true;
	if (availableCache !== null) return availableCache;
	try {
		const probe = getKey('__probe__');
		localStorage.setItem(probe, '1');
		localStorage.removeItem(probe);
		availableCache = true;
	} catch {
		availableCache = false;
	}
	return availableCache;
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
