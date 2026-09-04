import type { AnimationDefinition } from '../graphics/Animation';
import { parseGameDefinition } from '../graphics/GameDefinition';
import { SpriteSheet } from '../graphics/SpriteSheet';

export type FetchLike = (input: string) => Promise<Pick<Response, 'ok' | 'status' | 'statusText' | 'json'>>;

export interface LoadedSprite {
  sheet: SpriteSheet;
  animations: Record<string, AnimationDefinition>;
}

/** Every sprite sheet from a game description, keyed by name. */
export type GameAssets = ReadonlyMap<string, LoadedSprite>;

/** Resolves `relative` against the document containing `from`, so sources in game.json sit next to it. */
export function resolveAssetUrl(relative: string, from: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : 'http://localhost/';
  return new URL(relative, new URL(from, base)).toString();
}

/** Loads JSON and image assets, rejecting on any failure instead of silently doing nothing. */
export class ResourceLoader {
  constructor(private readonly fetchImpl: FetchLike = (url) => fetch(url)) {}

  async loadJson<T>(url: string): Promise<T> {
    const response = await this.fetchImpl(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  /** Fetches and validates a game description, then loads every sprite sheet it names in parallel. */
  async loadGame(url: string): Promise<GameAssets> {
    const definition = parseGameDefinition(await this.loadJson(url));
    const loaded = await Promise.all(
      definition.sprites.map(async (sprite): Promise<[string, LoadedSprite]> => {
        const image = await this.loadImage(resolveAssetUrl(sprite.source, url));
        const sheet = new SpriteSheet(sprite.name, image, sprite);
        return [sprite.name, { sheet, animations: sprite.animations }];
      }),
    );
    return new Map(loaded);
  }

  loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image ${url}`));
      image.src = url;
    });
  }
}
