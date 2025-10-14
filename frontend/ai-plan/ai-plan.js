const styleButtons = document.querySelectorAll(".style-btn");
const customInputBtn = document.getElementById("customInputBtn");
const customInput = document.getElementById("customStyleInput");
const styleContainer = document.getElementById("styleButtons");
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
  budgetSlider.style.background = `linear-gradient(to right, #ff9b6b 0%, #ffd93d ${percentage}%, #e8e8e8 ${percentage}%, #e8e8e8 100%)`;
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
    /*
    const response = await fetch("/airesponse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("서버 응답 오류");
    const result = await response.json();
    */
    // 🧩 목업 데이터
    const result = {
      region: "목적지",
      total_duration: "약 12시간 30분",
      schedule: [
        { time: "오전 9시", location: "경주역 → 부산역", activity: "KTX 탑승" },
        {
          time: "오전 9시 30분",
          location: "부산역 → 금련산역",
          activity: "지하철 환승 이동",
        },
        {
          time: "10:00-11:30",
          location: "광안리 해변",
          activity: "해변 산책 및 사진 촬영",
        },
        {
          time: "11:30-13:00",
          location: "광안리",
          activity: "점심 식사 (돼지국밥 또는 회덮밥)",
        },
        { time: "13:00-15:00", location: "광안리", activity: "카페에서 휴식" },
        {
          time: "15:00-17:00",
          location: "해운대",
          activity: "해변 산책 및 동백섬 방문",
        },
        {
          time: "17:00-19:00",
          location: "해운대 또는 광안리",
          activity: "저녁 식사 (부산댁)",
        },
        { time: "19:00-21:00", location: "광안리 해변", activity: "야경 감상" },
        {
          time: "21:00-21:30",
          location: "광안리 → 부산역",
          activity: "지하철 이동",
        },
        { time: "21:30", location: "부산역 → 경주역", activity: "KTX 탑승" },
      ],
    };

    localStorage.setItem("aiTripResult", JSON.stringify(result));
    window.location.href = "../ai-plan-result/ai-plan-result.html";
  } catch (err) {
    alert("AI 일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    console.error(err);
  }
});
