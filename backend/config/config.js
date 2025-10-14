// 서버 환경 설정을 정의합니다.
const serverConfig = {
  port: process.env.PORT || 3000, // 환경 변수 PORT가 있다면 사용하고, 없으면 3000을 기본값으로 사용
  // 다른 환경 설정 (DB 정보, 시크릿 키 등)을 여기에 추가할 수 있습니다.
  
};

module.exports = serverConfig;
