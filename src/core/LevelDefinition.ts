export interface LevelObjectDefinition {
  /** Which factory builds it, such as 'crate' or 'enemy'. */
  type: string;
  /** World x of the object's left edge. */
  x: number;
  /** World y of the object's top edge. Omitted means drop it in from the top and let it fall. */
  y?: number;
}

/** The shape of a level file. */
export interface LevelDefinition {
  name: string;
  /** World width in pixels. Height is the viewport height. */
  width: number;
  spawn: { x: number; y: number };
  objects: LevelObjectDefinition[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function finiteNumber(value: unknown, where: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${where} must be a number`);
  return value;
}

function parseObject(value: unknown, where: string): LevelObjectDefinition {
  if (!isRecord(value)) throw new TypeError(`${where} must be an object`);
  if (typeof value.type !== 'string' || value.type.length === 0) throw new TypeError(`${where}.type must be a non-empty string`);
  const x = finiteNumber(value.x, `${where}.x`);
  if (value.y === undefined) return { type: value.type, x };
  return { type: value.type, x, y: finiteNumber(value.y, `${where}.y`) };
}

/** Validates untrusted JSON into a LevelDefinition, throwing a TypeError naming the first bad field. */
export function parseLevelDefinition(data: unknown): LevelDefinition {
  if (!isRecord(data)) throw new TypeError('Level must be an object');
  const width = finiteNumber(data.width, 'width');
  if (width <= 0) throw new TypeError('width must be positive');
  if (!isRecord(data.spawn)) throw new TypeError('spawn must be an object');
  const spawn = { x: finiteNumber(data.spawn.x, 'spawn.x'), y: finiteNumber(data.spawn.y, 'spawn.y') };
  if (!Array.isArray(data.objects)) throw new TypeError('objects must be an array');
  const objects = data.objects.map((o, i) => parseObject(o, `objects[${i}]`));
  const name = data.name === undefined ? 'untitled' : data.name;
  if (typeof name !== 'string') throw new TypeError('name must be a string');
  return { name, width, spawn, objects };
}
