let planData = {};

// =============================
// 데이터 로드 및 초기화
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const rawData = localStorage.getItem("aiPlanResult");

  if (!rawData) {
    return handleError(
      "저장된 일정 데이터가 없습니다.",
      "../ai-plan/ai-plan.html"
    );
  }

  try {
    const data = parseJSON(rawData);
    planData = data;
    console.log("일정 데이터 로드 완료:", planData);
    renderSchedule(planData);
  } catch (err) {
    console.error("JSON 파싱 오류:", err);
    handleError(
      "AI 응답 데이터가 올바르지 않습니다. 다시 시도해주세요.",
      "../ai-plan/ai-plan.html"
    );
  }
});

// =============================
// 공통 유틸 함수
// =============================
function parseJSON(str) {
  let parsed = JSON.parse(str);
  if (typeof parsed === "string") parsed = JSON.parse(parsed); // 중첩 문자열 방어
  return parsed;
}

function handleError(message, redirectUrl = null) {
  alert(message);
  if (redirectUrl) window.location.href = redirectUrl;
}

const $ = (selector) => document.querySelector(selector);

// =============================
// 일정 렌더링
// =============================
function renderSchedule(data) {
  const { recommendation = {} } = data;
  const { destinationName, destinationDescription, itinerary, notes } =
    recommendation;

  console.log("렌더링 시작:", data);

  // 제목
  const departure = data.departure || "출발지 미입력";
  const destination = destinationName || "미정";
  $("#tripTitle").innerHTML = `
    <span class="title-black">${departure}</span>
    <span class="title-black"> → </span>
    <span class="highlight-destination">${destination}</span>
  `;

  // 기본 정보 요약
  const infoParts = [
    data.departureDate,
    data.companionsType,
    data.companions ? `총 ${data.companions}명` : null,
    Array.isArray(data.travelStyles) ? data.travelStyles.join(", ") : null,
    data.budget ? `예산 약 ${Number(data.budget).toLocaleString()}원` : null,
  ].filter(Boolean);

  $("#tripInfo").textContent = infoParts.join(" | ") || "정보 없음";

  // 여행지 설명
  $("#destinationDescription").textContent =
    destinationDescription || "설명이 없습니다.";

  // 일정 타임라인
  renderItinerary(itinerary);

  // 여행 팁
  renderNotes(notes);

  // 버튼 이벤트
  $("#btnBack").addEventListener("click", goBack);
  $("#btnSave").addEventListener("click", savePlan);
}

// =============================
// 일정 타임라인 렌더링
// =============================
function renderItinerary(itinerary = []) {
  const timeline = $("#timeline");
  timeline.innerHTML = "";

  if (!Array.isArray(itinerary) || !itinerary.length) {
    timeline.innerHTML = `<p style="color:#888; text-align:center;">일정 정보가 없습니다.</p>`;
    return;
  }

  itinerary.forEach(({ time, activity, description, transportation }) => {
    const entry = document.createElement("div");
    entry.className = "timeline-item";
    entry.innerHTML = `
      <div class="time">${time || ""}</div>
      <div class="details">
        <div class="activity">${activity || "활동 없음"}</div>
        <div class="description">${description || ""}</div>
        ${
          transportation
            ? `<div class="transport">교통: ${transportation}</div>`
            : ""
        }
      </div>
    `;
    timeline.appendChild(entry);
  });
}

// =============================
// 여행 팁 렌더링
// =============================
function renderNotes(notes = []) {
  const notesList = $("#notesList");
  notesList.innerHTML = "";

  if (!Array.isArray(notes) || !notes.length) {
    notesList.innerHTML = `<li>추가 여행 팁이 없습니다.</li>`;
    return;
  }

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    notesList.appendChild(li);
  });
}

// =============================
// 다시 계획하기
// =============================
function goBack() {
  localStorage.removeItem("aiPlanResult");
  window.location.href = "../ai-plan/ai-plan.html";
}

// =============================
// 일정 저장하기 (서버 전송)
// =============================
async function savePlan() {
  if (!Object.keys(planData).length) {
    return alert("저장할 일정 데이터가 없습니다.");
  }

  const userKey = prompt(
    "저장용 고유번호를 입력해주세요. (숫자 또는 문자 가능):"
  )?.trim();
  if (!userKey) return alert("고유번호를 입력해야 저장할 수 있습니다.");

  const requestBody = { userKey, ...planData };
  console.log("서버 전송 데이터:", requestBody);

  try {
    const res = await fetch(
      "https://aibe4-project1-team2-m9vr.onrender.com/plan-save",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

    const result = await res.json();
    console.log("서버 응답:", result);

    if (result.success && result.statusCode === 201) {
      alert(`저장되었습니다. (고유번호: ${userKey})`);
      window.location.href = "/AIBE4_Project1_Team2/index.html";
    } else {
      console.error("저장 실패 응답:", result);
      alert(
        result.message || "저장 중 문제가 발생했습니다. 다시 시도해주세요."
      );
    }
  } catch (err) {
    console.error("저장 요청 실패:", err);
    alert("서버 통신 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}
