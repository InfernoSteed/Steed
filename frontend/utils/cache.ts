
import { Clip } from '../types';

const DB_NAME = 'VideoForgeCache';
const STORE_NAME = 'frames';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB

interface CacheEntry {
  key: string;
  blob: Blob;
  size: number;
  lastUsed: number;
}

export class FrameCache {
  private db: IDBDatabase | null = null;
  private memoryCache: Map<string, ImageBitmap> = new Map();
  private currentSize: number = 0;
  
  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = (e) => {
      this.db = (e.target as IDBOpenDBRequest).result;
      this.calculateSize();
    };
  }

  public generateKey(clip: Clip, time: number, quality: string): string {
    // Round time to nearest frame (30fps approx) to increase hit rate
    const frameTime = Math.floor(time * 30) / 30;
    
    // Create a hash of filter state
    const filterStr = JSON.stringify(clip.filters);
    const transformStr = JSON.stringify({
        s: clip.scale, r: clip.rotation, 
        x: clip.position.x, y: clip.position.y,
        o: clip.opacity
    });
    
    return `${clip.id}_${frameTime}_${quality}_${filterStr.length}_${transformStr.length}`;
  }

  public getMemory(key: string): ImageBitmap | undefined {
      const hit = this.memoryCache.get(key);
      if (hit) return hit;
      return undefined;
  }

  public async get(key: string): Promise<ImageBitmap | null> {
    // 1. Check Memory
    if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key)!;
    }

    // 2. Check Disk
    if (!this.db) return null;
    
    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = async () => {
        const entry = req.result as CacheEntry;
        if (entry) {
          // Update last used time
          this.touch(key, entry);
          // Convert Blob to Bitmap
          const bitmap = await createImageBitmap(entry.blob);
          this.addToMemory(key, bitmap);
          resolve(bitmap);
        } else {
          resolve(null);
        }
      };
      
      req.onerror = () => resolve(null);
    });
  }

  public async save(key: string, canvas: HTMLCanvasElement) {
    if (!this.db) return;

    // Convert canvas to blob
    canvas.toBlob((blob) => {
        if (!blob) return;
        
        const entry: CacheEntry = {
            key,
            blob,
            size: blob.size,
            lastUsed: Date.now()
        };

        const tx = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(entry);
        
        // Also keep in memory for immediate reuse
        createImageBitmap(blob).then(bmp => this.addToMemory(key, bmp));

        this.currentSize += blob.size;
        this.prune();
    });
  }

  private addToMemory(key: string, bitmap: ImageBitmap) {
      // Limit memory cache to 50 items to prevent RAM bloat
      if (this.memoryCache.size > 50) {
          const firstKey = this.memoryCache.keys().next().value;
          if (firstKey) {
             const bmp = this.memoryCache.get(firstKey);
             bmp?.close(); // Release GPU memory
             this.memoryCache.delete(firstKey);
          }
      }
      this.memoryCache.set(key, bitmap);
  }

  private touch(key: string, entry: CacheEntry) {
      if (!this.db) return;
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      entry.lastUsed = Date.now();
      store.put(entry);
  }

  private calculateSize() {
      if (!this.db) return;
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
          const entries = req.result as CacheEntry[];
          this.currentSize = entries.reduce((acc, curr) => acc + curr.size, 0);
      };
  }

  private prune() {
      if (this.currentSize <= MAX_CACHE_SIZE || !this.db) return;
      
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll(); // Inefficient for large DBs, but simple for now
      
      req.onsuccess = () => {
          const entries = req.result as CacheEntry[];
          // Sort by LRU
          entries.sort((a, b) => a.lastUsed - b.lastUsed);
          
          while (this.currentSize > MAX_CACHE_SIZE && entries.length > 0) {
              const victim = entries.shift();
              if (victim) {
                  store.delete(victim.key);
                  this.currentSize -= victim.size;
                  // Also remove from memory if present
                  const mem = this.memoryCache.get(victim.key);
                  if (mem) {
                      mem.close();
                      this.memoryCache.delete(victim.key);
                  }
              }
          }
      };
  }

  public async clear() {
      if (!this.db) return;
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      
      this.memoryCache.forEach(bmp => bmp.close());
      this.memoryCache.clear();
      this.currentSize = 0;
  }

  public getSizeMB(): string {
      return (this.currentSize / (1024 * 1024)).toFixed(1);
  }
}

export const frameCache = new FrameCache();
