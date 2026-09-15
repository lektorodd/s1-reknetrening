// Storage tests — these need a localStorage stand-in because vitest runs in node.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function fakeStorage() {
	const data = new Map<string, string>();
	return {
		get length() {
			return data.size;
		},
		key: (i: number) => [...data.keys()][i] ?? null,
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		removeItem: (k: string) => void data.delete(k),
		clear: () => data.clear(),
		_data: data
	};
}

let store: ReturnType<typeof fakeStorage>;

beforeEach(() => {
	store = fakeStorage();
	vi.stubGlobal('window', {});
	vi.stubGlobal('localStorage', store);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

async function storage() {
	return await import('$lib/utils/storage');
}

describe('storage', () => {
	it('namespaces keys under the current prefix', async () => {
		const s = await storage();
		s.save('thing', { a: 1 });
		expect(store.getItem('mattetrening_v1_thing')).toBe('{"a":1}');
	});

	it('round-trips values', async () => {
		const s = await storage();
		s.save('thing', { a: 1 });
		expect(s.load('thing', null)).toEqual({ a: 1 });
	});

	it('falls back when the stored value is corrupt', async () => {
		const s = await storage();
		store.setItem('mattetrening_v1_thing', '{not json');
		expect(s.load('thing', 'fallback')).toBe('fallback');
	});

	it('survives a browser that refuses storage', async () => {
		const s = await storage();
		vi.stubGlobal('localStorage', {
			get length(): number {
				throw new Error('blocked');
			},
			getItem() {
				throw new Error('blocked');
			},
			setItem() {
				throw new Error('blocked');
			},
			removeItem() {
				throw new Error('blocked');
			},
			key() {
				throw new Error('blocked');
			}
		});
		expect(() => s.save('thing', 1)).not.toThrow();
		expect(s.load('thing', 'fallback')).toBe('fallback');
		expect(() => s.clear()).not.toThrow();
	});

	it('clear only removes this app\'s keys', async () => {
		const s = await storage();
		s.save('thing', 1);
		store.setItem('somebody_elses_key', 'keep me');
		s.clear();
		expect(store.getItem('somebody_elses_key')).toBe('keep me');
		expect(store.getItem('mattetrening_v1_thing')).toBeNull();
	});

	it('migrates pre-0.6 progress into the new namespace', async () => {
		const s = await storage();
		store.setItem('derivasjon_v3_student_model', '{"totalAttempts":42}');
		s.migrateLegacy();
		expect(s.load('student_model', null)).toEqual({ totalAttempts: 42 });
	});

	it('never clobbers newer data with the legacy copy', async () => {
		const s = await storage();
		store.setItem('derivasjon_v3_student_model', '{"totalAttempts":42}');
		s.save('student_model', { totalAttempts: 99 });
		s.migrateLegacy();
		expect(s.load<{ totalAttempts: number } | null>('student_model', null)?.totalAttempts).toBe(99);
	});
});
