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
    // 서버 통신 (임시 주석)
    // const resp = await fetch("http://localhost:3000/api/reviews", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ password: password.trim() }),
    // });
    // const result = await resp.json();

    // 서버 미구축 가정: 성공 + 더미 데이터
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
      window.location.href = "../myReviews/myReviews.html";
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
    // 서버 통신 (임시 주석)
    // const resp = await fetch("http://localhost:3000/api/schedules", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ password: password.trim() }),
    // });
    // const result = await resp.json();

    // 서버 미구축 가정: 성공 + 더미 데이터
    const result = {
      success: true,
      data: [
        { destination: "강릉", date: "2025-10-19", theme: "힐링" },
        { destination: "담양", date: "2025-09-28", theme: "자연" },
      ],
    };

    if (result.success) {
      localStorage.setItem("schedules", JSON.stringify(result.data));
      alert("✅ 인증 성공! 일정 데이터를 불러왔습니다.");
      window.location.href = "../mySchedules/mySchedules.html";
    } else {
      alert("❌ 비밀번호가 올바르지 않습니다.");
    }
  } catch (err) {
    console.error("서버 통신 오류:", err);
    alert("⚠️ 서버 연결 중 오류가 발생했습니다.");
  }
});
