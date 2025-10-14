// 요청을 처리하고 응답을 보내는 함수를 정의합니다.
exports.getHome = (req, res) => {
  // 실제 비즈니스 로직(데이터 조회/가공)은 service 파일에서 담당하지만,
  // 이 예시에서는 간단히 바로 응답합니다.
  res.send("Hello World! (응답은 Controller에서 전송됨)");
};
