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

  console.log("📦 Loaded result data:", result);
  renderSchedule(result);
});

// 일정 렌더링 함수
function renderSchedule(result) {
  console.log("📦 Loaded result data:", result);

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
function savePlan() {
  const data = localStorage.getItem("aiTripResult");
  if (!data) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  alert("저장되었습니다.");
  window.location.href = "/AIBE4_Project1_Team2/index.html";
}
