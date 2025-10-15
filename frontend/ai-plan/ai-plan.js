const styleButtons = document.querySelectorAll(".style-btn");
const customInputBtn = document.getElementById("customInputBtn");
const customInput = document.getElementById("customStyleInput");
const styleContainer = document.getElementById("styleButtons");
const loadingOverlay = document.getElementById("loadingOverlay");
let selectedStyles = [];
// 스타일 버튼
styleButtons.forEach((button) => {
  if (button.id === "customInputBtn") return;
  button.addEventListener("click", function () {
    const style = this.getAttribute("data-style");
    if (this.classList.contains("active")) {
      this.classList.remove("active");
      selectedStyles = selectedStyles.filter((s) => s !== style);
    } else {
      this.classList.add("active");
      selectedStyles.push(style);
    }
  });
});
// 직접 입력
customInputBtn.addEventListener("click", () => {
  customInput.style.display =
    customInput.style.display === "none" ? "block" : "none";
  customInput.focus();
});
// Enter 시 태그 생성
customInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    let value = customInput.value.trim();
    if (value.startsWith("#")) value = value.slice(1);
    if (value !== "") {
      selectedStyles.push(value);
      const newBtn = document.createElement("button");
      newBtn.type = "button";
      newBtn.className = "style-btn active";
      newBtn.textContent = `#${value}`;
      newBtn.setAttribute("data-style", value);
      newBtn.addEventListener("click", function () {
        this.remove();
        selectedStyles = selectedStyles.filter((s) => s !== value);
      });
      styleContainer.insertBefore(newBtn, customInputBtn);
      customInput.value = "";
      customInput.style.display = "none";
    }
  }
});
// 예산 슬라이더
const budgetSlider = document.getElementById("budget");
const budgetValue = document.getElementById("budgetValue");
function updateBudgetSliderColor() {
  const value = parseInt(budgetSlider.value);
  const min = parseInt(budgetSlider.min);
  const max = parseInt(budgetSlider.max);
  const percentage = ((value - min) / (max - min)) * 100;
  budgetValue.textContent = value.toLocaleString();
  budgetSlider.style.background = `linear-gradient(to right, #FF9B6B 0%, #FFD93D ${percentage}%, #E8E8E8 ${percentage}%, #E8E8E8 100%)`;
}
budgetSlider.addEventListener("input", updateBudgetSliderColor);
updateBudgetSliderColor();
// 필수 입력 검증
const travelForm = document.getElementById("travelForm");
const requiredFields = {
  departure: "출발지를 입력해주세요!",
  departureDate: "출발 날짜를 선택해주세요!",
  companionsType: "누구와 함께하는지 입력해주세요!",
  companions: "동행인 수를 입력해주세요!",
};
Object.keys(requiredFields).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("invalid", (e) => {
    e.target.setCustomValidity(requiredFields[id]);
    e.target.classList.add("error-border");
  });
  input.addEventListener("input", (e) => {
    e.target.setCustomValidity("");
    e.target.classList.remove("error-border");
  });
});
// 출발 날짜 제한
const today = new Date().toISOString().split("T")[0];
document.getElementById("departureDate").setAttribute("min", today);
// 폼 제출
travelForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!travelForm.checkValidity()) {
    travelForm.reportValidity();
    return;
  }
  // 로딩창 표시
  loadingOverlay.style.display = "flex";
  const formData = {
    departure: document.getElementById("departure").value,
    departureDate: document.getElementById("departureDate").value,
    companionsType: document.getElementById("companionsType").value,
    companions: document.getElementById("companions").value,
    travelStyles: selectedStyles,
    budget: document.getElementById("budget").value,
    additionalInfo: document.getElementById("additionalInfo").value,
  };
  try {
    const response = await fetch(
      "https://aibe4-project1-team2-1y2x.onrender.com/plan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: formData }),
      }
    );
    if (!response.ok) throw new Error("서버 응답 오류");
    // AI가 응답한 텍스트 (JSON 문자열 형태)

    console.log(response);

    const resultText = await response.text();

    console.log(resultText);

    let resultData;
    try {
      const parsed = JSON.parse(resultText);
      resultData = parsed.data; // 🔹 핵심: data 속성만 추출
    } catch (err) {
      console.error("JSON 파싱 오류:", err);
      resultData = { rawText: resultText };
    }

    console.log(resultData);

    // 🔹 여행 결과만 저장
    localStorage.setItem("aiTripResult", JSON.stringify(resultData));

    // 결과 페이지로 이동
    window.location.href = "../ai-plan-result/ai-plan-result.html";
  } catch (err) {
    alert("AI 일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    console.error(err);
  } finally {
    // 요청 완료 후 로딩창 숨기기
    loadingOverlay.style.display = "none";
  }
});
