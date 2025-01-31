const processInBatch = async <T>(
  tasks: (() => Promise<T>)[],
  batchSize: number
) => {
  const results = [];

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);
  }
  return results;
};

export default processInBatch;
