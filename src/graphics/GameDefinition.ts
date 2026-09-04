import type { AnimationDefinition } from './Animation';

export interface SpriteSheetDefinition {
  name: string;
  /** Image URL, resolved relative to the game description file. */
  source: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, AnimationDefinition>;
}

/** The shape of game.json. */
export interface GameDefinition {
  sprites: SpriteSheetDefinition[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function positiveInteger(value: unknown, where: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${where} must be a positive integer`);
  }
  return value;
}

function nonEmptyString(value: unknown, where: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(`${where} must be a non-empty string`);
  return value;
}

function parseAnimation(value: unknown, where: string): AnimationDefinition {
  if (!isRecord(value)) throw new TypeError(`${where} must be an object`);
  if (!Array.isArray(value.frames) || value.frames.length === 0) throw new TypeError(`${where}.frames must be a non-empty array`);
  const frames = value.frames.map((f, i) => {
    if (typeof f !== 'number' || !Number.isInteger(f) || f < 0) throw new TypeError(`${where}.frames[${i}] must be a non-negative integer`);
    return f;
  });
  if (typeof value.fps !== 'number' || !(value.fps > 0)) throw new TypeError(`${where}.fps must be a positive number`);
  if (value.loop !== undefined && typeof value.loop !== 'boolean') throw new TypeError(`${where}.loop must be a boolean`);
  return value.loop === undefined ? { frames, fps: value.fps } : { frames, fps: value.fps, loop: value.loop };
}

function parseSprite(value: unknown, where: string): SpriteSheetDefinition {
  if (!isRecord(value)) throw new TypeError(`${where} must be an object`);
  const name = nonEmptyString(value.name, `${where}.name`);
  const animations: Record<string, AnimationDefinition> = {};
  if (value.animations !== undefined) {
    if (!isRecord(value.animations)) throw new TypeError(`${where}.animations must be an object`);
    for (const [key, animation] of Object.entries(value.animations)) {
      animations[key] = parseAnimation(animation, `${where}.animations.${key}`);
    }
  }
  return {
    name,
    source: nonEmptyString(value.source, `${where}.source`),
    frameWidth: positiveInteger(value.frameWidth, `${where}.frameWidth`),
    frameHeight: positiveInteger(value.frameHeight, `${where}.frameHeight`),
    animations,
  };
}

/** Validates untrusted JSON into a GameDefinition, throwing a TypeError naming the first bad field. */
export function parseGameDefinition(data: unknown): GameDefinition {
  if (!isRecord(data)) throw new TypeError('Game definition must be an object');
  if (!Array.isArray(data.sprites)) throw new TypeError('sprites must be an array');
  const sprites = data.sprites.map((s, i) => parseSprite(s, `sprites[${i}]`));
  const names = new Set<string>();
  for (const sprite of sprites) {
    if (names.has(sprite.name)) throw new TypeError(`Duplicate sprite name '${sprite.name}'`);
    names.add(sprite.name);
  }
  return { sprites };
}
