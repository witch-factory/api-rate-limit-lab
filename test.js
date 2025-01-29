const http = require("http");

const SERVER_URL = "http://localhost:3000";
const NUM_REQUESTS = 10; // 동시에 보낼 요청 개수

const sendRequest = (index) => {
  return new Promise((resolve, reject) => {
    console.log(`요청 ${index} 시작`);

    const req = http.get(SERVER_URL, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`요청 ${index} 성공: ${data}`);
        resolve();
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
    promises.push(sendRequest(i));
  }

  await Promise.allSettled(promises); // 모든 요청이 끝날 때까지 대기
  console.log("모든 요청이 완료되었습니다.");
};

testRequests();
