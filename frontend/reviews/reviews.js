// =============================
//  1. 상수 및 DOM 요소 관리
// =============================
const DOM = {
  body: document.body,
  reviewsContainer: document.getElementById("reviews-container"),
  buttons: {
    myReviews: document.getElementById("btnMyReviews"),
    mySchedules: document.getElementById("btnMySchedules"),
  },
  modal: {
    overlay: document.getElementById("reviewModal"),
    closeButton: document.getElementById("reviewModal").querySelector(".close-button"),
    title: document.getElementById("modal-title"),
    rate: document.getElementById("modal-rate"),
    image: document.getElementById("modal-image"),
    content: document.getElementById("modal-content"),
  },
};

// API 요청 시 사용할 데이터 타입을 상수로 관리 (오타 방지)
const DATA_TYPE = {
  REVIEWS: "reviews",
  SCHEDULES: "schedules",
};

// =============================
//  2. 함수 정의
// =============================

/**
 * 리뷰 카드 하나를 생성하는 함수 (HTML 문자열 반환)
 * @param {object} review - 리뷰 데이터 한 개
 * @returns {HTMLDivElement} - 생성된 카드 div 요소
 */
function createReviewCard(review) {
  console.log(review.img_path)
  const card = document.createElement("div");
  card.className = "review-card clickable";
  card.innerHTML = `
    <div class="card-image">
      <img src=${review.img_path} alt="${review.title}" />
    </div>
    <div class="card-content">
      <h3>${review.title}</h3>
      <p>${review.content.substring(0, 50)}...</p>
    </div>
  `;
  card.addEventListener("click", () => openModal(review));
  return card;
}

/**
 * 모든 리뷰 데이터를 받아와 화면에 렌더링하는 메인 함수
 * @param {Array<object>} reviews - 전체 리뷰 데이터 배열
 */
function renderReviews(reviews) {
  if (!DOM.reviewsContainer) {
    console.error("#reviews-container 요소를 찾을 수 없습니다.");
    return;
  }
  DOM.reviewsContainer.innerHTML = "";

  const reviewsByCity = reviews.reduce((acc, review) => {
    const city = review.arrival;
    if (!acc[city]) acc[city] = [];
    acc[city].push(review);
    return acc;
  }, {});

  for (const city in reviewsByCity) {
    const section = document.createElement("section");
    section.className = "region-section";
    
    const title = document.createElement("h2");
    title.textContent = city;
    
    const grid = document.createElement("div");
    grid.className = "review-grid";
    
    reviewsByCity[city].forEach((review) => {
      const cardElement = createReviewCard(review);
      grid.appendChild(cardElement);
    });
    
    section.appendChild(title);
    section.appendChild(grid);
    DOM.reviewsContainer.appendChild(section);
  }
}

/**
 * 특정 리뷰 데이터로 모달창의 내용을 채우고 표시하는 함수
 * @param {object} review - 표시할 리뷰 데이터
 */
function openModal(review) {
  DOM.modal.title.textContent = review.title;
  DOM.modal.image.src = review.img_path;
  DOM.modal.content.textContent = review.content;
  DOM.modal.rate.textContent = "★".repeat(review.rate) + "☆".repeat(5 - review.rate);

  DOM.modal.overlay.classList.add("active");
  DOM.body.classList.add("modal-open");
}

/**
 * 모달창을 닫는 함수
 */
function closeModal() {
  DOM.modal.overlay.classList.remove("active");
  DOM.body.classList.remove("modal-open");
}

/**
 * 버튼 클릭 시 데이터 요청 및 페이지 이동을 처리하는 공통 함수
 * @param {string} dataType - 요청할 데이터 타입 ('reviews' 또는 'schedules')
 * @param {string} redirectUrl - 성공 시 이동할 페이지 URL
 */
async function handleDataFetch(dataType, redirectUrl) {
  const userKey = prompt("사용자 키(userKey)를 입력해주세요:");
  if (!userKey) {
    alert("사용자 키를 입력해야 합니다.");
    return;
  }

  try {
    const result = await fetchData(dataType, userKey);
    alert(result.message);
    if (result.success) {
      localStorage.setItem(dataType, JSON.stringify(result.data));
      window.location.href = redirectUrl;
    }
  } catch (err) {
    console.error("통신 중 오류 발생:", err);
    alert("⚠️ 서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// =============================
//  3. 이벤트 리스너 연결 및 초기화
// =============================

// 페이지 로딩 완료 시 리뷰 렌더링
// document.addEventListener("DOMContentLoaded", () => {
//   renderReviews(mockSuccessReviewData.data);
// });

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("https://aibe4-project1-team2-1y2x.onrender.com/reviews/")
  const rawData = await response.json()
  renderReviews(rawData.data.reviews);
});

// 각 버튼에 공통 핸들러 연결
DOM.buttons.myReviews.addEventListener("click", () =>
  handleDataFetch(DATA_TYPE.REVIEWS, "../my-reviews/my-reviews.html")
);
DOM.buttons.mySchedules.addEventListener("click", () =>
  handleDataFetch(DATA_TYPE.SCHEDULES, "../my-ai-plans/my-ai-plans.html")
);

// 모달 닫기 이벤트들
DOM.modal.closeButton.addEventListener("click", closeModal);
DOM.modal.overlay.addEventListener("click", (e) => {
  if (e.target === DOM.modal.overlay) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && DOM.modal.overlay.classList.contains("active")) {
    closeModal();
  }
});

// API 요청 시뮬레이션 함수
const fetchData = async (dataType, userKey) => {
console.log(`[API 요청 시뮬레이션] 타입: ${dataType}, 키: ${userKey}`);
await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 지연

if (userKey === "mypassword") {
    return dataType === "reviews"
        ? mockSuccessReviewData
        : mockSuccessScheduleData;
    } else {
    return mockFailureData;
    }
};


// =============================
//  4. 목 데이터 (Mock Data)
// =============================

// [데이터 확장] 동적 생성을 위해 부산, 강릉 리뷰 추가
const mockSuccessReviewData = {
  success: true,
  statusCode: 200,
  message: "✅ 후기 목록을 성공적으로 불러왔습니다.",
  data: [
    {
      id: 5, rate: 4, title: "서울 당일치기",
      content: "혼자 미술관 투어하고 한강에서 힐링했어요. 국립현대미술관은 언제 가도 마음이 편안해지는 곳입니다. 추천해요!",
      departure: "수원", arrival: "서울",
      img_path: "https://images.unsplash.com/photo-1579632353342-939b4a165b5d?q=80&w=800",
    },
    {
      id: 6, rate: 5, title: "부산 해운대 먹방여행",
      content: "역시 여름엔 해운대! 파도 소리 들으며 즐기는 휴가! 주변에 맛집도 많고 특히 돼지국밥은 최고였습니다.",
      departure: "양산", arrival: "부산",
      img_path: "https://images.unsplash.com/photo-1590840131153-2213793092ce?q=80&w=800",
    },
    {
      id: 7, rate: 5, title: "강릉 카페거리 힐링",
      content: "안목해변에서 커피 한 잔의 여유. 파도 소리가 ASMR 같아요. 조용히 생각 정리하고 오기 좋은 곳입니다.",
      departure: "서울", arrival: "강릉",
      img_path: "https://images.unsplash.com/photo-1624422295393-288a995cb24d?q=80&w=800",
    },
    {
      id: 8, rate: 4, title: "서울 호캉스가 최고!",
      content: "명동 한복판에 이런 곳이 있다니! 기대 이상이었습니다. 특히 루프탑 수영장이 정말 좋았어요.",
      departure: "인천", arrival: "서울",
      img_path: "https://images.unsplash.com/photo-1542314831-068cd1dbb563?q=80&w=800",
    },
  ],
};

// [성공] AI 일정 데이터
const mockSuccessScheduleData = {
    success: true,
    statusCode: 200,
    message: "✅ 저장된 AI 추천 일정을 성공적으로 불러왔습니다.",
    data: [
        {
            "userKey": 12345,
            "departure": "청주",
            "departureDate": "2025-10-19",
            "companionsType": "친구",
            "companions": "5",
            "travelStyles": ["힐링", "먹방여행"],
            "budget": "2000000",
            "budgetUnit": "KRW",
            "recommendation": {
            "destinationName": "강릉",
            "destinationDescription": "청주에서 약 2시간 30분~3시간 거리에 위치한 강릉은 동해의 아름다운 바다와 풍부한 해산물, 그리고 고유한 문화와 카페거리까지 완벽한 힐링과 먹방 여행지입니다. 친구들과 함께 멋진 추억을 만들 수 있을 거예요.",
            "estimatedBudget": {
                "min": "600000",
                "max": "800000",
                "unit": "KRW"
            },
            "itinerary": [
                {
                "time": "07:00",
                "activity": "청주 출발",
                "description": "청주에서 강릉으로 출발합니다. 5명이 함께 이동하므로 자가용 또는 렌터카를 이용하는 것이 편리하며, 교대로 운전하여 피로를 줄일 수 있습니다.",
                "transportation": "자가용 또는 렌터카"
                },
                {
                "time": "10:00",
                "activity": "강릉 안목해변 카페거리 도착 및 해변 산책",
                "description": "아름다운 동해 바다를 바라보며 여유롭게 커피 한 잔과 함께 힐링을 시작합니다. 다양한 개성의 카페들이 많아 선택의 폭이 넓습니다.",
                "transportation": "도보"
                },
                {
                "time": "11:30",
                "activity": "초당 순두부마을 이동 및 점심 식사",
                "description": "강릉의 명물인 초당 순두부 전골 또는 순두부 젤라또 등을 맛보며 든든한 한 끼를 해결합니다. 담백하고 고소한 맛으로 미식의 즐거움을 더합니다.",
                "transportation": "자가용 또는 렌터카"
                },
                {
                "time": "13:30",
                "activity": "경포호수 산책 또는 오죽헌 방문",
                "description": "경포호수 주변을 산책하며 자연 속 힐링을 만끽하거나, 신사임당과 율곡 이이의 생가인 오죽헌에서 역사와 전통을 느껴보는 시간을 가집니다.",
                "transportation": "도보 또는 자가용"
                },
                {
                "time": "15:30",
                "activity": "강릉 중앙시장 방문 및 간식/기념품 쇼핑",
                "description": "닭강정, 수제 어묵 고로케, 회 등 강릉의 다양한 먹거리를 맛보고, 친구들과 함께 여행의 추억이 될 기념품을 구경합니다.",
                "transportation": "자가용 또는 렌터카"
                },
                {
                "time": "17:00",
                "activity": "주문진 해변 또는 영진 해변(도깨비 촬영지) 방문",
                "description": "넓게 펼쳐진 주문진 해변을 거닐며 동해 바다의 매력을 느끼거나, 드라마 '도깨비' 촬영지로 유명한 영진 해변에서 친구들과 인생샷을 남겨봅니다.",
                "transportation": "자가용 또는 렌터카"
                },
                {
                "time": "18:30",
                "activity": "저녁 식사 (신선한 해산물 요리)",
                "description": "동해안에서 갓 잡은 신선한 해산물 요리(회, 조개찜, 해산물 전골 등)를 맛보며 여행의 하이라이트를 장식합니다. 친구들과 맛있는 음식으로 하루를 마무리합니다.",
                "transportation": "자가용 또는 렌터카"
                },
                {
                "time": "20:00",
                "activity": "강릉 출발",
                "description": "아쉬움을 뒤로하고 청주로 출발합니다. 늦은 시간까지 운전해야 하므로 안전 운전에 유의합니다.",
                "transportation": "자가용 또는 렌터카"
                },
                {
                "time": "23:00",
                "activity": "청주 도착",
                "description": "청주에 도착하여 당일치기 강릉 힐링&먹방 여행을 마무리합니다.",
                "transportation": "자가용 또는 렌터카"
                }
            ],
            "notes": [
                "5인 이동 시 자가용 이용이 가장 편리하며, 교대로 운전하여 운전 피로를 분산시키는 것이 좋습니다.",
                "강릉은 카페와 맛집이 워낙 많으니, 친구들과 미리 취향에 맞는 장소를 몇 군데 찾아보는 것도 좋은 방법입니다.",
                "당일치기 일정은 유동적이므로, 친구들과 상의하여 관심사에 따라 방문 장소나 시간을 자유롭게 조절하여 만족도를 높일 수 있습니다.",
                "늦은 시간까지 운전해야 하므로, 충분한 휴식을 취하고 안전 운전에 각별히 유의해 주세요."
            ]
        },
            },
    ],
};

// [실패] 공통 실패 데이터
const mockFailureData = {
  success: false,
  statusCode: 500,
  message: "❌ 인증에 실패했습니다. 사용자 키를 다시 확인해주세요.",
  data: {},
};