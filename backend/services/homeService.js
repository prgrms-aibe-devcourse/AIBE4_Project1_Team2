// Home Service는 애플리케이션의 핵심 비즈니스 로직을 담당합니다.

/**
 * 메인 페이지에 표시할 환영 메시지를 생성합니다.
 * @returns {string} 환영 메시지
 */
exports.getWelcomeMessage = () => {
  // 실제 프로젝트에서는 이 위치에서 DB에서 데이터를 조회하거나,
  // 복잡한 비즈니스 규칙에 따라 데이터를 가공합니다.
  const now = new Date();
  const hours = now.getHours();

  let timeOfDay;
  if (hours < 12) {
    timeOfDay = "오전";
  } else if (hours < 18) {
    timeOfDay = "오후";
  } else {
    timeOfDay = "저녁";
  }

  return `안녕하세요! 현재는 ${timeOfDay}입니다. Service에서 생성된 메시지입니다.`;
};
