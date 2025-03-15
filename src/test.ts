import http from "http";
import processInBatch from "./utils/processInBatch";
import { TaskManager } from "./utils/taskManager";

const SERVER_URL = "http://localhost:3000";
const NUM_REQUESTS = 10; // 동시에 보낼 요청 개수 지정
const BATCH_SIZE = 5; // 한 번에 보낼 요청 개수 지정

const MAX_CONCURRENT_REQUESTS = 4; // 동시 실행할 요청 개수 제한

type ServerResponse = {
  message: string;
  requestNumber: number;
};

const sendRequest = (index: number): Promise<ServerResponse> => {
  return new Promise((resolve, reject) => {
    console.log(`요청 ${index} 시작`);

    const req = http.get(SERVER_URL, (res) => {
      let rawData = "";

      res.on("data", (chunk) => {
        rawData += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(rawData) as ServerResponse;
          console.log(
            `요청 ${index} 메시지: ${result.message}, 현재 서버에 남은 요청 개수: ${result.requestNumber}`
          );
          resolve(result);
        } catch (error) {
          console.error(`요청 ${index} 응답 파싱 실패: ${error}`);
          reject(error);
        }
      });
    });

    req.on("error", (err) => {
      console.error(`요청 ${index} 실패: ${err.message}`);
      reject(err);
    });

    req.end();
  });
};

let activeRequests = 0; // 현재 실행 중인 요청 개수
const queue: (() => Promise<ServerResponse>)[] = []; // 서버 요청 대기열

// 대기열에서 요청 실행하는 함수
const runNextRequest = async () => {
  // 대기열이 비어있거나, 동시 요청 개수 제한에 걸리면 종료
  if (queue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) return;

  const nextRequest = queue.shift();
  if (!nextRequest) return;

  activeRequests++;
  try {
    await nextRequest();
  } catch (error) {
    console.error("⚠️ 요청 처리 중 오류 발생:", error);
  } finally {
    activeRequests--;
    runNextRequest(); // 다음 요청 실행
  }
};

// 요청을 대기열에 추가하고 대기열의 다음 요청 실행
const enqueueRequest = (index: number) => {
  queue.push(() => sendRequest(index));
  runNextRequest(); // 큐 실행
};

const taskManager = new TaskManager<ServerResponse>(MAX_CONCURRENT_REQUESTS);

const testRequests = async () => {
  for (let i = 1; i <= NUM_REQUESTS; i++) {
    taskManager.addTask(() => sendRequest(i));
  }
  const results = await taskManager.runTasks();
  console.log(results);
};

testRequests();
