let planData = {};

// =============================
// 데이터 로드 및 초기화
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const rawData = localStorage.getItem("aiPlanResult");

  if (!rawData) {
    alert("저장된 일정 데이터가 없습니다.");
    window.location.href = "../ai-plan/ai-plan.html";
    return;
  }

  try {
    // 1차 파싱
    let data = JSON.parse(rawData);

    // 여전히 문자열이면 다시 파싱
    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    planData = data;
    console.log("일정 데이터 로드 완료:", planData);
    renderSchedule(planData);
  } catch (err) {
    console.error("JSON 파싱 오류:", err, rawData);
    alert("AI 응답 데이터가 올바르지 않습니다. 다시 시도해주세요.");
    window.location.href = "../ai-plan/ai-plan.html";
  }
});

// =============================
// 일정 렌더링
// =============================
function renderSchedule(result) {
  console.log("렌더링 시작:", result);

  // 제목
  const departure = result.departure || "출발지 미입력";
  const destination = result.recommendation?.destinationName || "미정";
  document.getElementById("tripTitle").innerHTML = `
    <span class="title-black">${departure}</span>
    <span class="title-black"> → </span>
    <span class="highlight-destination">${destination}</span>
  `;

  // 기본 정보
  const infoParts = [
    result.departureDate,
    result.companionsType,
    result.companions ? `총 ${result.companions}명` : null,
    result.travelStyles?.join(", "),
    result.budget
      ? `예산 약 ${Number(result.budget).toLocaleString()}원`
      : null,
  ].filter(Boolean);
  document.getElementById("tripInfo").textContent = infoParts.join(" | ");

  // 여행지 설명
  document.getElementById("destinationDescription").textContent =
    result.recommendation?.destinationDescription || "설명이 없습니다.";

  // 일정 타임라인
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";
  if (Array.isArray(result.recommendation?.itinerary)) {
    result.recommendation.itinerary.forEach((item) => {
      const entry = document.createElement("div");
      entry.classList.add("timeline-item");
      entry.innerHTML = `
        <div class="time">${item.time || ""}</div>
        <div class="details">
          <div class="activity">${item.activity || "활동 없음"}</div>
          <div class="description">${item.description || ""}</div>
          ${
            item.transportation
              ? `<div class="transport">🚗 ${item.transportation}</div>`
              : ""
          }
        </div>
      `;
      timeline.appendChild(entry);
    });
  } else {
    timeline.innerHTML = `<p style="color:#888; text-align:center;">일정 정보가 없습니다.</p>`;
  }

  // 여행 팁
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "";
  if (Array.isArray(result.recommendation?.notes)) {
    result.recommendation.notes.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;
      notesList.appendChild(li);
    });
  } else {
    notesList.innerHTML = `<li>추가 여행 팁이 없습니다.</li>`;
  }

  document.getElementById("btnBack").addEventListener("click", goBack);
  document.getElementById("btnSave").addEventListener("click", savePlan);
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
    alert("저장할 일정 데이터가 없습니다.");
    return;
  }

  const userKey = prompt(
    "저장용 고유번호를 입력해주세요. (숫자 또는 문자 가능):"
  )?.trim();
  if (!userKey) {
    alert("고유번호를 입력해야 저장할 수 있습니다.");
    return;
  }

  const requestBody = { userKey, ...planData };
  console.log("서버 전송 데이터:", requestBody);

  try {
    const response = await fetch(
      "https://aibe4-project1-team2-m9vr.onrender.com/plan-save",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();
    console.log("서버 응답:", result);

    if (result.success && result.statusCode === 201) {
      alert(`저장되었습니다. (고유번호: ${userKey})`);
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
