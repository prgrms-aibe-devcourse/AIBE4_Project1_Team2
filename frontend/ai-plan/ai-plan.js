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
    /* 테스트 및 배포 시 1단계) 목업 데이터는 주석 처리해 주세요. */
    // 목업 데이터
    const resultData = {
      departure: "광주",
      departureDate: "2025-10-19",
      companionsType: "친구",
      companions: 5,
      travelStyles: ["힐링", "먹방여행"],
      budget: 2000000,
      budgetUnit: "KRW",
      recommendation: {
        destinationName: "담양",
        destinationDescription:
          "광주에서 가까운 전남 담양은 울창한 대나무 숲 죽녹원과 아름다운 메타세콰이어길 등 자연이 주는 힐링을 만끽할 수 있는 곳입니다. 담양의 대표 음식인 떡갈비와 대통밥으로 미식 경험까지 더할 수 있어 친구들과의 먹방 힐링 여행에 최적화된 당일치기 코스입니다.",
        estimatedBudget: {
          min: "500000",
          max: "800000",
          unit: "KRW",
        },
        itinerary: [
          {
            time: "08:30",
            activity: "광주 출발",
            description:
              "친구들과 함께 담양으로 출발합니다. 자가용 이용 시 약 1시간 소요됩니다.",
            transportation: "차량",
          },
          {
            time: "09:30 - 12:00",
            activity: "죽녹원 산책 및 힐링",
            description:
              "사계절 푸른 대나무 숲을 거닐며 대나무가 뿜어내는 피톤치드로 몸과 마음을 정화하고, 아름다운 풍경을 배경으로 인생 사진을 남겨보세요. 대나무 숲길을 따라 걷는 것만으로도 충분한 힐링이 됩니다.",
            transportation: "도보",
          },
          {
            time: "12:30 - 14:00",
            activity: "담양 떡갈비 맛집에서 점심 식사",
            description:
              "담양의 대표 음식인 육즙 가득한 떡갈비와 대통밥, 죽순 요리 등을 맛볼 수 있는 유명 식당에서 푸짐한 점심 식사를 즐깁니다. 친구들과 함께 맛있는 음식을 나누며 즐거운 시간을 보내세요.",
            transportation: "차량 이동",
          },
          {
            time: "14:30 - 16:00",
            activity: "메타세콰이어길 산책 및 주변 카페 방문",
            description:
              "아름다운 가로수 길로 유명한 메타세콰이어 길을 따라 여유롭게 산책하며 가을의 정취를 만끽합니다. 주변에 분위기 좋은 카페에서 차 한 잔의 여유를 즐기며 친구들과 담소를 나누는 시간을 가져보세요.",
            transportation: "도보",
          },
          {
            time: "16:00 - 17:00",
            activity: "관방제림 산책 또는 담양 시장 구경",
            description:
              "메타세콰이어길 근처에 위치한 관방제림을 따라 산책하거나, 담양 전통 시장을 방문하여 대나무 관련 특산품(죽순빵, 대나무통술 등)이나 기념품을 구경하고 구매하는 시간을 가집니다.",
            transportation: "도보",
          },
          {
            time: "17:30",
            activity: "담양 출발",
            description:
              "아쉬움을 뒤로하고 광주로 돌아오기 위해 담양에서 출발합니다.",
            transportation: "차량",
          },
          {
            time: "18:30",
            activity: "광주 도착 및 해산",
            description:
              "광주에 도착하여 친구들과 함께 즐거웠던 하루를 마무리하고 다음을 기약합니다.",
            transportation: "차량",
          },
        ],
        notes: [
          "2025년 10월 19일은 토요일이므로 주말 교통 체증에 대비하여 출발 시간을 여유롭게 잡거나, 이른 시간에 출발하는 것을 추천합니다.",
          "대나무 숲길과 메타세콰이어길 등 걷는 일정이 많으므로 편안한 신발을 착용하는 것이 좋습니다.",
          "가을 시즌에는 담양의 풍경이 특히 아름다우니 카메라를 꼭 챙겨 멋진 추억을 남기세요.",
          "담양은 자가용으로 이동하는 것이 편리하며, 각 관광지마다 주차 공간이 잘 마련되어 있습니다.",
        ],
      },
    };

    /* 테스트 및 배포 시 2단계) 요청 주소 바꿔주세요. */
    // const response = await fetch("http://localhost:3000/api/ai/generate", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ prompt: formData }),
    // });

    // if (!response.ok) throw new Error("서버 응답 오류");

    // // AI가 응답한 텍스트 (JSON 문자열 형태)
    // const resultText = await response.text();

    // // 문자열 안의 JSON 파싱 시도
    // let resultData;
    // try {
    //   resultData = JSON.parse(resultText);
    // } catch {
    //   // 혹시 JSON이 아닌 일반 텍스트라면 그대로 저장
    //   resultData = { rawText: resultText };
    // }

    // 여행 결과 저장
    localStorage.setItem("aiTripResult", JSON.stringify(resultData));
    window.location.href = "../ai-plan-result/ai-plan-result.html";
  } catch (err) {
    alert("AI 일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    console.error(err);
  } finally {
    // 요청 완료 후 로딩창 숨기기
    loadingOverlay.style.display = "none";
  }
});
