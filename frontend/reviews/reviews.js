// 요소 참조
const reviewCards = document.querySelectorAll(".review-card.clickable");
const modalOverlay = document.getElementById("reviewModal");
const closeButton = modalOverlay.querySelector(".close-button");
const body = document.body;

// 버튼 (현재 마크업 기준: 헤더 내 1번째/2번째 버튼)
const btnMyReviews = document.querySelector("header button:nth-of-type(1)");
const btnMySchedules = document.querySelector("header button:nth-of-type(2)");

/* =============================
   🔹 리뷰 카드 모달
============================= */
function openModal() {
  modalOverlay.classList.add("active");
  body.classList.add("modal-open");
}
function closeModal() {
  modalOverlay.classList.remove("active");
  body.classList.remove("modal-open");
}
reviewCards.forEach((card) => {
  card.addEventListener("click", openModal);
});
closeButton.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
    closeModal();
  }
});

/* =============================
   🔹 내가 작성한 후기 전체 보기
============================= */
btnMyReviews.addEventListener("click", async () => {
  const password = prompt("비밀번호를 입력해주세요:");
  if (!password || password.trim() === "") {
    alert("비밀번호를 입력해야 합니다.");
    return;
  }

  try {
    const result = {
      success: true,
      data: [
        { title: "부산 해운대 후기", content: "여름엔 역시 해운대죠!" },
        { title: "서울 경복궁 후기", content: "사진이 너무 잘 나왔어요!" },
      ],
    };

    if (result.success) {
      localStorage.setItem("reviews", JSON.stringify(result.data));
      alert("✅ 인증 성공! 후기 데이터를 불러왔습니다.");
      window.location.href = "../my-reviews/my-reviews.html";
    } else {
      alert("❌ 비밀번호가 올바르지 않습니다.");
    }
  } catch (err) {
    console.error("서버 통신 오류:", err);
    alert("⚠️ 서버 연결 중 오류가 발생했습니다.");
  }
});

/* =============================
   🔹 내가 저장한 AI 일정 전체 보기
============================= */
btnMySchedules.addEventListener("click", async () => {
  const password = prompt("비밀번호를 입력해주세요:");
  if (!password || password.trim() === "") {
    alert("비밀번호를 입력해야 합니다.");
    return;
  }

  try {
    // ✅ 서버 미구축 가정: 성공 + 긴 일정이 포함된 실제 구조형 더미
    const result = {
      success: true,
      data: [
        {
          text: {
            departure: "청주",
            departureDate: "2025-10-19",
            companionsType: "친구",
            companions: "5",
            travelStyles: ["힐링", "먹방여행"],
            recommendation: {
              destinationName: "강릉",
              destinationDescription:
                "청주에서 약 3시간 거리의 강릉은 바다, 카페거리, 먹거리로 완벽한 힐링 여행지입니다.",
              itinerary: [
                {
                  time: "07:00",
                  activity: "청주 출발",
                  transportation: "자가용",
                },
                {
                  time: "10:00",
                  activity: "안목해변 카페거리 산책",
                  transportation: "도보",
                },
                {
                  time: "11:00",
                  activity: "테라로사 커피 박물관 방문",
                  transportation: "도보",
                },
                {
                  time: "12:30",
                  activity: "초당순두부 점심",
                  transportation: "도보",
                },
                {
                  time: "14:00",
                  activity: "경포대 해변 산책",
                  transportation: "자가용",
                },
                {
                  time: "15:30",
                  activity: "오죽헌 관람",
                  transportation: "자가용",
                },
                {
                  time: "17:00",
                  activity: "중앙시장 저녁 및 커피거리 재방문",
                  transportation: "자가용",
                },
                {
                  time: "19:00",
                  activity: "숙소 체크인 및 휴식",
                  transportation: "도보",
                },
                {
                  time: "09:00",
                  activity: "둘째 날: 주문진 수산시장 방문",
                  transportation: "자가용",
                },
                {
                  time: "11:00",
                  activity: "강릉 출발 → 청주 복귀",
                  transportation: "자가용",
                },
              ],
              notes: [
                "강릉 카페거리는 오전보다 오후가 한산합니다.",
                "오죽헌은 주차장이 협소하니 조심하세요.",
              ],
            },
          },
        },
        {
          text: {
            departure: "서울",
            departureDate: "2025-10-22",
            companionsType: "연인",
            companions: "2",
            travelStyles: ["감성", "자연"],
            recommendation: {
              destinationName: "남해",
              destinationDescription:
                "남해는 드라이브와 감성 숙소가 어우러진 힐링 여행지입니다.",
              itinerary: [
                {
                  time: "08:00",
                  activity: "서울 출발",
                  transportation: "자가용",
                },
                {
                  time: "12:00",
                  activity: "남해 독일마을 점심",
                  transportation: "자가용",
                },
                {
                  time: "13:30",
                  activity: "보리암 방문 및 해안 절벽 감상",
                  transportation: "자가용",
                },
                {
                  time: "15:30",
                  activity: "남해대교 전망대 방문",
                  transportation: "도보",
                },
                {
                  time: "17:00",
                  activity: "숙소 체크인 및 일몰 감상",
                  transportation: "도보",
                },
                {
                  time: "19:00",
                  activity: "남해 회센터에서 저녁 식사",
                  transportation: "택시",
                },
                {
                  time: "21:00",
                  activity: "카페 거리 산책",
                  transportation: "도보",
                },
                {
                  time: "09:00",
                  activity: "둘째 날: 상주은모래비치 조식 피크닉",
                  transportation: "자가용",
                },
                {
                  time: "11:00",
                  activity: "서울로 복귀",
                  transportation: "자가용",
                },
              ],
              notes: [
                "남해는 드라이브 코스가 많아 차량 이동이 필수입니다.",
                "일몰 시간대에 숙소 근처 바다 산책을 추천합니다.",
              ],
            },
          },
        },
        {
          text: {
            departure: "대구",
            departureDate: "2025-09-28",
            companionsType: "가족",
            companions: "4",
            travelStyles: ["자연", "체험"],
            recommendation: {
              destinationName: "안동",
              destinationDescription:
                "하회마을, 월영교, 찜닭골목이 있는 문화체험형 여행지입니다.",
              itinerary: [
                {
                  time: "09:00",
                  activity: "대구 출발",
                  transportation: "자가용",
                },
                {
                  time: "10:30",
                  activity: "하회마을 도착 및 관람",
                  transportation: "도보",
                },
                {
                  time: "12:30",
                  activity: "찜닭 골목 점심",
                  transportation: "도보",
                },
                {
                  time: "14:00",
                  activity: "월영교 산책",
                  transportation: "도보",
                },
                {
                  time: "15:30",
                  activity: "안동민속박물관 방문",
                  transportation: "자가용",
                },
                {
                  time: "17:00",
                  activity: "전통시장 구경 및 기념품 구매",
                  transportation: "도보",
                },
                {
                  time: "18:00",
                  activity: "안동 숙소 체크인",
                  transportation: "자가용",
                },
                {
                  time: "09:00",
                  activity: "둘째 날: 병산서원 관람",
                  transportation: "자가용",
                },
                {
                  time: "11:00",
                  activity: "대구 복귀",
                  transportation: "자가용",
                },
              ],
              notes: [
                "하회마을은 입장료가 있습니다.",
                "안동은 골목길 주차가 어려워 공영주차장 이용 추천.",
              ],
            },
          },
        },
        {
          text: {
            departure: "광주",
            departureDate: "2025-10-05",
            companionsType: "친구",
            companions: "3",
            travelStyles: ["맛집", "힐링"],
            recommendation: {
              destinationName: "순천",
              destinationDescription:
                "순천만 습지와 드라마 세트장이 어우러진 감성 힐링 여행지입니다.",
              itinerary: [
                {
                  time: "08:30",
                  activity: "광주 출발",
                  transportation: "자가용",
                },
                {
                  time: "10:00",
                  activity: "순천만 습지 산책",
                  transportation: "도보",
                },
                {
                  time: "11:30",
                  activity: "전망대 오르기 및 갈대밭 사진 촬영",
                  transportation: "도보",
                },
                {
                  time: "13:00",
                  activity: "순천만 근처 한식당 점심",
                  transportation: "도보",
                },
                {
                  time: "14:30",
                  activity: "순천 드라마 세트장 방문",
                  transportation: "자가용",
                },
                {
                  time: "16:30",
                  activity: "순천시내 카페거리 방문",
                  transportation: "자가용",
                },
                {
                  time: "18:00",
                  activity: "저녁 식사 후 광주 복귀",
                  transportation: "자가용",
                },
                {
                  time: "19:30",
                  activity: "광주 도착 및 해산",
                  transportation: "자가용",
                },
              ],
              notes: [
                "순천만은 일몰 직전이 가장 아름답습니다.",
                "갈대밭은 바람이 강하니 모자를 챙기세요.",
              ],
            },
          },
        },
        {
          text: {
            departure: "부산",
            departureDate: "2025-10-15",
            companionsType: "혼자",
            companions: "1",
            travelStyles: ["액티비티"],
            recommendation: {
              destinationName: "통영",
              destinationDescription:
                "통영은 루지, 케이블카, 벽화마을 등 다양한 즐길 거리가 있는 해양 도시입니다.",
              itinerary: [
                {
                  time: "09:00",
                  activity: "부산 출발",
                  transportation: "고속버스",
                },
                {
                  time: "11:30",
                  activity: "통영 도착 후 충무김밥 점심",
                  transportation: "도보",
                },
                {
                  time: "13:00",
                  activity: "통영 스카이라인 루지 체험",
                  transportation: "택시",
                },
                {
                  time: "15:00",
                  activity: "한려수도 케이블카 탑승",
                  transportation: "택시",
                },
                {
                  time: "17:00",
                  activity: "동피랑 벽화마을 산책",
                  transportation: "도보",
                },
                {
                  time: "18:30",
                  activity: "통영 중앙시장 해산물 저녁",
                  transportation: "도보",
                },
                {
                  time: "20:00",
                  activity: "강구안 야경 감상",
                  transportation: "도보",
                },
                {
                  time: "09:00",
                  activity: "둘째 날: 이순신공원 산책",
                  transportation: "택시",
                },
                {
                  time: "11:00",
                  activity: "통영 특산품 기념품 구매",
                  transportation: "도보",
                },
                {
                  time: "12:30",
                  activity: "부산으로 복귀",
                  transportation: "고속버스",
                },
              ],
              notes: [
                "루지와 케이블카는 오전에 사람이 적습니다.",
                "중앙시장은 현금이 편리합니다.",
              ],
            },
          },
        },
      ],
    };

    if (result.success) {
      localStorage.setItem("schedules", JSON.stringify(result.data));
      alert("✅ 인증 성공! 일정 데이터를 불러왔습니다.");
      window.location.href = "../my-ai-plans/my-ai-plans.html";
    } else {
      alert("❌ 비밀번호가 올바르지 않습니다.");
    }
  } catch (err) {
    console.error("서버 통신 오류:", err);
    alert("⚠️ 서버 연결 중 오류가 발생했습니다.");
  }
});
