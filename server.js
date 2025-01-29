const express = require("express");

const app = express();
const port = 3000;

const MAX_CONCURRENT_REQUESTS = 5; // 동시 처리 가능한 최대 요청 개수
let activeRequests = 0;

const limitRequests = (req, res, next) => {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    res.status(503).send("Server is busy. Please try again later.");
    // 서버 종료
    process.exit(1);
  }

  activeRequests++;
  console.log(`현재 요청 개수: ${activeRequests}`);

  res.on("finish", () => {
    activeRequests--;
    console.log(`요청 완료. 현재 요청 개수: ${activeRequests}`);
  });

  next();
};

app.use(limitRequests);

app.get("/", (req, res) => {
  setTimeout(() => {
    res.send("Hello, World!");
  }, 1000 * activeRequests);
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 주소에서 실행 중입니다.`);
});
