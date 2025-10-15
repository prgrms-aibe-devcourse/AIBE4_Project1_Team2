document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("aiTripResult"));
  if (!data) {
    alert("일정 데이터가 없습니다. 처음부터 다시 진행해주세요.");
    window.location.href = "../ai-plan/ai-plan.html";
    return;
  }

  // 1. AI 응답이 { text: "```json ... ```" } 형태인 경우 처리
  let raw = data;
  if (data.text) raw = data.text; // text 필드 안에 JSON 문자열이 있으면 꺼내기

  // 2. ```json ... ``` 제거
  if (typeof raw === "string") {
    raw = raw
      .replace(/```json\s*/g, "") // ```json 제거
      .replace(/```/g, "") // 닫는 ``` 제거
      .trim();
  }

  // 3. 문자열을 실제 JSON으로 변환
  let result;
  try {
    result = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error("JSON 파싱 오류:", err, raw);
    alert("AI 응답 데이터가 올바르지 않습니다. 다시 시도해주세요.");
    window.location.href = "../ai-plan/ai-plan.html";
    return;
  }

  console.log("Loaded result data:", result);
  renderSchedule(result);
});

// 일정 렌더링 함수
function renderSchedule(result) {
  console.log("Loaded result data:", result);

  // 타이틀 구성
  const departure = result.departure;
  const destination = result.recommendation.destinationName;
  const titleHTML = `
    <span class="title-black">${departure}</span>
    <span class="title-black"> → </span>
    <span class="highlight">${destination}</span>
    <span class="title-black"> 여행 일정</span>
  `;
  document.getElementById("trip-title").innerHTML = titleHTML;

  // 서브 정보
  const info = `${result.departureDate} | ${result.companionsType} | 총 ${
    result.companions
  }명 | ${result.travelStyles.join(", ")} | 예산 약 ${Number(
    result.budget
  ).toLocaleString()}원`;
  document.getElementById("trip-info").textContent = info;

  // 여행지 설명
  document.getElementById("destination-description").textContent =
    result.recommendation.destinationDescription;

  // 일정 타임라인
  const timeline = document.getElementById("timeline");
  result.recommendation.itinerary.forEach((item) => {
    const entry = document.createElement("div");
    entry.classList.add("timeline-item");
    entry.innerHTML = `
      <div class="time">${item.time}</div>
      <div class="details">
        <div class="activity"><strong>${item.activity}</strong></div>
        <div class="desc">${item.description}</div>
        <div class="transport">🚗 ${item.transportation}</div>
      </div>
    `;
    timeline.appendChild(entry);
  });

  // 여행 팁
  const notesList = document.getElementById("notes-list");
  result.recommendation.notes.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    notesList.appendChild(li);
  });

  // 버튼 이벤트 등록
  document.getElementById("btnBack").addEventListener("click", goBack);
  document.getElementById("btnSave").addEventListener("click", savePlan);
}

/**
 * 다시 계획하기 버튼
 * - localStorage 초기화 후 ai-plan 페이지로 이동
 */
function goBack() {
  localStorage.removeItem("aiTripResult");
  window.location.href = "../ai-plan/ai-plan.html";
}

/**
 * 저장하기 버튼
 * - 데이터 확인 후 홈(index.html)로 이동
 */
async function savePlan() {
  // localStorage에서 여행 데이터 가져오기
  const data = localStorage.getItem("aiTripResult");
  if (!data) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  let parsedData = JSON.parse(data);

  // AI 응답이 { text: {...} } 형태인 경우 내부 데이터만 꺼냄
  if (parsedData.text) parsedData = parsedData.text;

  // 비밀번호 입력 요청
  const userKey = prompt(
    "저장용 비밀번호를 입력해주세요 (숫자 또는 문자 가능):"
  );
  if (!userKey || userKey.trim() === "") {
    alert("비밀번호를 입력해야 저장할 수 있습니다.");
    return;
  }

  // 서버로 전송할 데이터 구성
  const requestBody = {
    userKey: userKey.trim(),
    ...parsedData, // text 없이 펼쳐서 보냄 ✅
  };

  console.log("📦 서버로 전송되는 데이터:", requestBody);

  try {
    const response = await fetch(
      "https://aibe4-project1-team2-m9vr.onrender.com/schedules",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();

    if (result.success && result.statusCode === 201) {
      alert(`✅ 저장되었습니다! (비밀번호: ${userKey})`);
      window.location.href = "/AIBE4_Project1_Team2/index.html";
    } else {
      console.error("서버 응답 오류:", result);
      alert("저장 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  } catch (err) {
    console.error("저장 실패:", err);
    alert("서버 통신 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}
