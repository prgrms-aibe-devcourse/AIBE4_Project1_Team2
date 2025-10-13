document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("aiTripResult"));
  if (!data) {
    alert("일정 데이터가 없습니다. 처음부터 다시 진행해주세요.");
    window.location.href = "../ai-plan/ai-plan.html";
    return;
  }

  renderSchedule(data);
});

function renderSchedule(data) {
  const originEl = document.getElementById("trip-origin");
  const durationEl = document.getElementById("trip-duration");
  const timeline = document.getElementById("timeline");

  originEl.textContent = `${data.userOrigin || "출발지"} → ${
    data.region || "도착지"
  }`;
  durationEl.textContent = `총 소요시간 ${data.total_duration || "정보 없음"}`;
  timeline.innerHTML = "";

  data.schedule.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("timeline-item");
    div.innerHTML = `
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="time">${item.time}</div>
        <div class="title">${item.activity}</div>
        <div class="desc">${item.location}</div>
      </div>`;
    timeline.appendChild(div);
  });
}

function goBack() {
  localStorage.removeItem("aiTripResult");
  window.location.href = "../ai-plan/ai-plan.html";
}

function savePlan() {
  const data = localStorage.getItem("aiTripResult");
  if (!data) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  alert("저장되었습니다.");
  window.location.href = "/index.html";
}
