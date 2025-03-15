export class TaskManager<T> {
  private queue: (() => Promise<T>)[] = [];
  private activeRequestCount = 0;

  constructor(private maxConcurrent: number) {}

  public setMaxConcurrent(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  addTask(task: () => Promise<T>): void {
    this.queue.push(task);
  }

  // N개씩 동시에 실행하는 메서드
  async runParallel(): Promise<T[]> {
    const results: T[] = [];

    return new Promise((resolve) => {
      const next = async () => {
        if (this.queue.length === 0 && this.activeRequestCount === 0) {
          resolve(results); // 모든 작업 완료 시 resolve
          return;
        }

        while (
          this.activeRequestCount < this.maxConcurrent &&
          this.queue.length > 0
        ) {
          const task = this.queue.shift();
          if (!task) return;
          this.activeRequestCount++;

          task()
            .then((result) => results.push(result))
            .catch((error) => console.error("Task failed:", error))
            .finally(() => {
              this.activeRequestCount--;
              next(); // 작업 하나가 끝날 때마다 다음 작업 실행
            });
        }
      };

      next(); // 실행 시작
    });
  }
}
