// ======================================================
//  1. 상수 및 DOM 요소 관리
// ======================================================
const DOM = {
  body: document.body,
  reviewsContainer: document.getElementById("reviews-container"),
  buttons: {
    myReviews: document.getElementById("btnMyReviews"),
    myPlans: document.getElementById("btnMyPlans"),
  },
  modal: {
    overlay: document.getElementById("reviewModal"),
    closeButton: document
      .getElementById("reviewModal")
      .querySelector(".close-button"),
    title: document.getElementById("modal-title"),
    rate: document.getElementById("modal-rate"),
    image: document.getElementById("modal-image"),
    content: document.getElementById("modal-content"),
  },
};

// ======================================================
//  2. 리뷰 카드 생성 함수
// ======================================================
function createReviewCard(review) {
  const card = document.createElement("div");
  card.className = "review-card clickable";
  card.innerHTML = `
    <div class="card-image">
      <img src="${review.img_path || "https://placehold.co/400x250"}" 
           alt="${review.title || "리뷰 이미지"}" />
    </div>
    <div class="card-content">
      <h3>${review.title || "제목 없음"}</h3>
      <p>${
        review.content ? review.content.substring(0, 50) + "..." : "내용 없음"
      }</p>
      <div class="card-rate">⭐ ${review.rate ?? "0"}</div>
    </div>
  `;
  card.addEventListener("click", () => openModal(review));
  return card;
}

// ======================================================
//  3. 리뷰 렌더링 함수
// ======================================================
function renderReviews(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    DOM.reviewsContainer.innerHTML = "<p>표시할 리뷰가 없습니다.</p>";
    return;
  }

  console.log("✅ 렌더링할 리뷰 데이터:", reviews);

  // 단일 섹션 형태로 렌더링
  DOM.reviewsContainer.innerHTML = ""; // 초기화

  const section = document.createElement("section");
  section.className = "review-section";

  const title = document.createElement("h2");
  title.textContent = "전체 리뷰 목록";

  const grid = document.createElement("div");
  grid.className = "review-grid";

  reviews.forEach((review) => {
    grid.appendChild(createReviewCard(review));
  });

  section.append(title, grid);
  DOM.reviewsContainer.appendChild(section);
}

// ======================================================
//  4. 모달 관련 함수
// ======================================================
function openModal(review) {
  DOM.modal.title.textContent = review.title || "제목 없음";
  DOM.modal.image.src = review.img_path || "https://placehold.co/600x400";
  DOM.modal.content.textContent = review.content || "내용이 없습니다.";
  DOM.modal.rate.textContent =
    "★".repeat(Math.round(review.rate || 0)) +
    "☆".repeat(5 - Math.round(review.rate || 0));

  DOM.modal.overlay.classList.add("active");
  DOM.body.classList.add("modal-open");
}

function closeModal() {
  DOM.modal.overlay.classList.remove("active");
  DOM.body.classList.remove("modal-open");
}

// ======================================================
//  5. 이벤트 핸들러 (모달 닫기 등)
// ======================================================
DOM.modal.closeButton.addEventListener("click", closeModal);
DOM.modal.overlay.addEventListener("click", (e) => {
  if (e.target === DOM.modal.overlay) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && DOM.modal.overlay.classList.contains("active")) {
    closeModal();
  }
});

// ======================================================
//  6. 초기화 (DOMContentLoaded)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  try {
    const savedReviews = localStorage.getItem("savedReviews");
    const alt = localStorage.getItem("reviews"); // 혹시 다른 키 사용 시

    let reviewsArray = [];

    if (savedReviews) {
      console.log("✅ LocalStorage(savedReviews)에서 데이터 불러옴");
      reviewsArray = JSON.parse(savedReviews);
    } else if (alt) {
      console.log("✅ LocalStorage(reviews)에서 데이터 불러옴");
      reviewsArray = JSON.parse(alt);
    }

    if (Array.isArray(reviewsArray) && reviewsArray.length > 0) {
      renderReviews(reviewsArray);
    } else {
      DOM.reviewsContainer.innerHTML =
        "<p>저장된 리뷰가 없습니다. 메인 화면에서 다시 시도해주세요.</p>";
    }
  } catch (error) {
    console.error("🚨 리뷰 렌더링 중 오류:", error);
    DOM.reviewsContainer.innerHTML =
      "<p>리뷰를 불러오는 중 오류가 발생했습니다.</p>";
  }
});

// ======================================================
//  7. 버튼 기능
// ======================================================
DOM.buttons.myReviews.addEventListener("click", () => {
  alert("내가 작성한 후기 보기 기능은 아직 준비 중입니다 😊");
});

DOM.buttons.myPlans.addEventListener("click", async () => {
  const userKey = prompt("고유번호를 입력해주세요:");
  if (!userKey) {
    alert("⚠️ 고유번호를 입력해야 합니다.");
    return;
  }

  const API_URL = "https://aibe4-project1-team2-m9vr.onrender.com/my-plans";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey }),
    });

    const result = await response.json();
    console.log("📦 서버 응답 데이터:", result);

    if (!response.ok || !result.data) {
      alert(result.message || "❌ 일정을 불러오지 못했습니다.");
      return;
    }

    localStorage.setItem("aiPlans", JSON.stringify(result.data));
    alert("✅ 저장된 AI 일정을 불러왔습니다!");
    window.location.href = "../my-ai-plans/my-ai-plans.html";
  } catch (error) {
    console.error("🚨 요청 중 오류:", error);
    alert("⚠️ 서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
});
