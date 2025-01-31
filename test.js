const http = require("http");
const processInBatch = require("./processInBatch");

const SERVER_URL = "http://localhost:3000";
const NUM_REQUESTS = 4; // 동시에 보낼 요청 개수 지정
const BATCH_SIZE = 5; // 한 번에 보낼 요청 개수 지정

const sendRequest = (index) => {
  return new Promise((resolve, reject) => {
    console.log(`요청 ${index} 시작`);

    const req = http.get(SERVER_URL, (res) => {
      let result;

      res.on("data", (chunk) => {
        const data = JSON.parse(chunk);
        console.log(
          `요청 ${index} 메시지: ${data.message}, 현재 서버에 남은 요청 개수: ${data.requestNumber}`
        );
        result = data;
      });

      res.on("end", () => {
        console.log(`요청 ${index} 성공`);
        resolve(result);
      });
    });

    req.on("error", (err) => {
      console.error(`요청 ${index} 실패: ${err.message}`);
      reject(err);
    });

    req.end();
  });
};

const testRequests = async () => {
  const promises = [];
  for (let i = 1; i <= NUM_REQUESTS; i++) {
    // 즉시 실행을 막기 위해 익명 함수로 감쌈
    promises.push(() => sendRequest(i));
  }

  const results = await processInBatch(promises, BATCH_SIZE);
  console.log(`모든 요청 완료: ${results.length}개`);
  console.log(results);
};

testRequests();
