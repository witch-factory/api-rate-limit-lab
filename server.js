const express = require("express");

const app = express();
const port = 3000;

const MAX_CONCURRENT_REQUESTS = 5; // 동시 처리 가능한 최대 요청 개수
let activeRequests = 0;

const limitRequests = (req, res, next) => {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log(`🔥 서버의 동시 요청 제한을 초과했습니다. 서버를 종료합니다.`);
    res.status(503).json({
      message: "🔥 서버가 과부하 상태입니다. 서버를 종료합니다.",
      requestNumber: activeRequests,
    });
    process.exit(1);
  }

  activeRequests++;
  console.log(`📩 요청 도착. 현재 요청 개수: ${activeRequests}`);

  // 요청이 완료되면 activeRequests 감소
  res.on("finish", () => {
    activeRequests--;
    console.log(`✅ 요청 완료. 현재 요청 개수: ${activeRequests}`);
  });

  // 요청 도중 클라이언트가 연결을 끊으면 activeRequests 감소
  res.on("close", () => {
    if (!res.writableEnded) {
      activeRequests--;
      console.log(`⚠️ 요청이 중단됨. 현재 요청 개수: ${activeRequests}`);
    }
  });

  next();
};

app.use(limitRequests);

app.get("/", (req, res) => {
  setTimeout(() => {
    res.json({
      message: "Hello, World!",
      requestNumber: activeRequests,
    });
  }, 1000 * activeRequests);
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 주소에서 실행 중입니다.`);
});
