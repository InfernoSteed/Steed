
import { createWorker } from './worker';

type TaskType = 'AUDIO_WAVEFORM' | 'FILTER_FRAME' | 'ANALYZE_COLOR';

interface Task {
  id: string;
  type: TaskType;
  payload: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  transferables?: Transferable[];
}

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];
  private activeTasks: Map<string, Task> = new Map();
  private maxWorkers: number;
  private workerStatus: boolean[] = []; // true = busy
  
  // Observable state for UI
  public onProgress: ((activeCount: number) => void) | null = null;

  constructor(size: number = 4) {
    this.maxWorkers = size;
    for (let i = 0; i < size; i++) {
      const worker = createWorker();
      worker.onmessage = (e) => this.handleWorkerMessage(i, e);
      worker.onerror = (e) => this.handleWorkerError(i, e);
      this.workers.push(worker);
      this.workerStatus.push(false);
    }
  }

  private updateProgress() {
      if (this.onProgress) {
          this.onProgress(this.activeTasks.size);
      }
  }

  private handleWorkerMessage(workerIndex: number, e: MessageEvent) {
    const { id, result, error } = e.data;
    const task = this.activeTasks.get(id);
    
    if (task) {
      if (error) task.reject(new Error(error));
      else task.resolve(result);
      this.activeTasks.delete(id);
    }

    this.workerStatus[workerIndex] = false;
    this.processQueue();
    this.updateProgress();
  }

  private handleWorkerError(workerIndex: number, e: ErrorEvent) {
     console.error(`Worker ${workerIndex} error:`, e);
     this.workerStatus[workerIndex] = false;
     this.processQueue();
     this.updateProgress();
  }

  private processQueue() {
    if (this.queue.length === 0) return;

    const availableWorkerIndex = this.workerStatus.findIndex(busy => !busy);
    if (availableWorkerIndex === -1) return;

    const task = this.queue.shift();
    if (!task) return;

    this.workerStatus[availableWorkerIndex] = true;
    this.activeTasks.set(task.id, task);
    
    this.workers[availableWorkerIndex].postMessage(
        { id: task.id, type: task.type, payload: task.payload },
        task.transferables || []
    );
    this.updateProgress();
  }

  public run<T>(type: TaskType, payload: any, transferables: Transferable[] = []): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2);
      this.queue.push({ id, type, payload, resolve, reject, transferables });
      this.processQueue();
    });
  }

  public terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
  }
}

export const workerPool = new WorkerPool(navigator.hardwareConcurrency || 4);
