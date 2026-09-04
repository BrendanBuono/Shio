export type FetchLike = (input: string) => Promise<Pick<Response, 'ok' | 'status' | 'statusText' | 'json'>>;

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

  loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image ${url}`));
      image.src = url;
    });
  }
}
