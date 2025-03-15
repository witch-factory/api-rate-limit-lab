export class TaskManager<T> {
  private queue: (() => Promise<T>)[] = [];
  private activeRequestCount = 0;

  constructor(private maxConcurrent: number) {}

  addTask(task: () => Promise<T>): void {
    this.queue.push(task);
  }

  private *taskGenerator() {
    const currentTasks = [...this.queue];

    this.queue = [];
    yield* currentTasks;
  }

  private async executeTask(
    task: () => Promise<T>,
    results: T[],
    onComplete: () => void
  ): Promise<void> {
    this.activeRequestCount++;

    try {
      const result = await task();
      results.push(result);
    } catch (error) {
      console.error(`Task failed:`, error);
    } finally {
      this.activeRequestCount--;
      onComplete();
    }
  }

  // N개씩 동시에 실행하는 메서드
  async runTasks(): Promise<T[]> {
    const results: T[] = [];
    const taskIterator = this.taskGenerator();
    let hasMoreTasks = true;

    return new Promise<T[]>((resolve) => {
      const executeNext = async () => {
        if (this.activeRequestCount === 0 && !hasMoreTasks) {
          resolve(results);
          return;
        }

        while (this.activeRequestCount < this.maxConcurrent && hasMoreTasks) {
          const { done, value: nextTask } = taskIterator.next();
          if (done) {
            hasMoreTasks = false;
            return;
          }

          this.executeTask(nextTask, results, executeNext);
        }
      };

      executeNext(); // 실행 시작
    });
  }
}
