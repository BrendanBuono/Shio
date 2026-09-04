import { describe, expect, it } from 'vitest';
import { createId } from './uuid';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('createId', () => {
  it('produces version 4 UUIDs', () => {
    expect(createId()).toMatch(V4);
  });

  it('produces distinct ids', () => {
    const ids = new Set(Array.from({ length: 200 }, createId));
    expect(ids.size).toBe(200);
  });
});
