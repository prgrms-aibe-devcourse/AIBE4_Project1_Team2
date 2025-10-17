/* ======================================================
   여행 스타일 선택
====================================================== */
const styleContainer = document.getElementById("styleButtons");
const customInputBtn = document.getElementById("customInputBtn");
const customInput = document.getElementById("customStyleInput");
const loadingOverlay = document.getElementById("loadingOverlay");
const travelForm = document.getElementById("travelForm");
const budgetSlider = document.getElementById("budget");
const budgetValue = document.getElementById("budgetValue");

let selectedStyles = new Set();

// HTML 이스케이프 (보안)
const escapeHTML = (str) =>
  str.replace(/[&<>"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[match];
  });

// ------------------------------------------------------
// 스타일 버튼 클릭 시 선택/해제
// ------------------------------------------------------
styleContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".style-btn");
  if (!btn || btn.id === "customInputBtn") return;

  const style = btn.dataset.style;
  btn.classList.toggle("active");

  if (btn.classList.contains("active")) selectedStyles.add(style);
  else selectedStyles.delete(style);
});

// ------------------------------------------------------
// 직접 입력 토글
// ------------------------------------------------------
customInputBtn.addEventListener("click", () => {
  customInput.classList.toggle("show");
  if (customInput.classList.contains("show")) customInput.focus();
});

// ------------------------------------------------------
// 직접입력 → 엔터 시 새 버튼 추가
// ------------------------------------------------------
customInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  let value = customInput.value.trim().replace(/^#/, "");
  if (!value) return;

  value = escapeHTML(value);
  if (selectedStyles.has(value)) return;

  selectedStyles.add(value);

  const newBtn = document.createElement("button");
  newBtn.type = "button";
  newBtn.className = "style-btn active";
  newBtn.dataset.style = value;
  newBtn.textContent = `#${value}`;
  newBtn.addEventListener("click", () => {
    newBtn.remove();
    selectedStyles.delete(value);
  });

  styleContainer.insertBefore(newBtn, customInputBtn);
  customInput.value = "";
  customInput.classList.remove("show");
});

/* ======================================================
   예산 슬라이더
====================================================== */
function updateBudgetSlider() {
  const value = parseInt(budgetSlider.value);
  const min = parseInt(budgetSlider.min);
  const max = parseInt(budgetSlider.max);
  const percent = ((value - min) / (max - min)) * 100;

  budgetValue.textContent = value.toLocaleString();
  budgetSlider.style.background = `
    linear-gradient(to right,
      #FF9B6B 0%,
      #FFD93D ${percent}%,
      #E8E8E8 ${percent}%,
      #E8E8E8 100%)`;
}
budgetSlider.addEventListener("input", updateBudgetSlider);
window.addEventListener("pageshow", updateBudgetSlider);
updateBudgetSlider();

/* ======================================================
   필수 입력 검증
====================================================== */
const requiredFields = {
  departure: "출발지를 입력해주세요!",
  departureDate: "출발 날짜를 선택해주세요!",
  companionsType: "누구와 함께하는지 입력해주세요!",
  companions: "동행인 수를 입력해주세요!",
};

Object.entries(requiredFields).forEach(([id, msg]) => {
  const input = document.getElementById(id);
  input.addEventListener("invalid", (e) => {
    e.target.setCustomValidity(msg);
    e.target.classList.add("error-border");
  });
  input.addEventListener("input", (e) => {
    e.target.setCustomValidity("");
    e.target.classList.remove("error-border");
  });
});

/* ======================================================
   출발 날짜 오늘 이전 선택 불가
====================================================== */
function updateMinDate() {
  document.getElementById("departureDate").min = new Date()
    .toISOString()
    .split("T")[0];
}
window.addEventListener("pageshow", updateMinDate);
updateMinDate();

/* ======================================================
   폼 제출 처리
====================================================== */
travelForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!travelForm.checkValidity()) return travelForm.reportValidity();

  // 로딩 표시
  loadingOverlay.classList.add("active");

  const formData = {
    departure: travelForm.departure.value,
    departureDate: travelForm.departureDate.value,
    companionsType: travelForm.companionsType.value,
    companions: travelForm.companions.value,
    travelStyles: Array.from(selectedStyles),
    budget: budgetSlider.value,
    additionalInfo: travelForm.additionalInfo.value,
  };

  try {
    const res = await fetch(
      "https://aibe4-project1-team2-m9vr.onrender.com/plan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: formData }),
      }
    );

    if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);

    const text = await res.text();
    let resultData;
    try {
      const parsed = JSON.parse(text);
      resultData = parsed.data ?? parsed;
    } catch {
      resultData = { rawText: text };
    }

    localStorage.setItem("aiPlanResult", JSON.stringify(resultData));
    window.location.href = "../ai-plan-result/ai-plan-result.html";
  } catch (err) {
    if (err instanceof TypeError) {
      alert("네트워크 연결이 불안정합니다. 인터넷을 확인해주세요.");
    } else {
      alert("AI 일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  } finally {
    loadingOverlay.classList.remove("active");
  }
});
