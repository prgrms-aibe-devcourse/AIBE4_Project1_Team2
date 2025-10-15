// 요소 참조
const reviewCards = document.querySelectorAll(".review-card.clickable");
const modalOverlay = document.getElementById("reviewModal");
const closeButton = modalOverlay.querySelector(".close-button");
const body = document.body;
const myPageButton = document.getElementById("btnMyPage");

// ✅ 모달 열기 / 닫기
function openModal() {
  modalOverlay.classList.add("active");
  body.classList.add("modal-open");
}

function closeModal() {
  modalOverlay.classList.remove("active");
  body.classList.remove("modal-open");
}

// 카드 클릭 시 모달 열기
reviewCards.forEach((card) => {
  card.addEventListener("click", () => {
    openModal();
  });
});

// 닫기 이벤트
closeButton.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalOverlay.classList.contains("active")) {
    closeModal();
  }
});

// ✅ My Page 버튼 동작
myPageButton.addEventListener("click", async () => {
  const password = prompt("마이페이지에 접근하려면 비밀번호를 입력해주세요:");
  if (!password || password.trim() === "") {
    alert("비밀번호를 입력해야 합니다.");
    return;
  }

  try {
    // 서버 통신 (임시)
    // const response = await fetch("http://localhost:3000/api/user/verify", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ password: password.trim() }),
    // });
    // const result = await response.json();

    // 서버 미구축 상태 → 임시 응답
    const result = { success: true };

    if (result.success) {
      alert("✅ 인증 성공! 마이페이지로 이동합니다.");
      window.location.href = "../mypage/mypage.html";
    } else {
      alert("❌ 비밀번호가 올바르지 않습니다.");
    }
  } catch (err) {
    console.error("서버 통신 오류:", err);
    alert("⚠️ 서버와의 연결에 문제가 발생했습니다.");
  }
});
