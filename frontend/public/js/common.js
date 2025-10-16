// ======================================================
// 1. 사용자 데이터 요청 & 로컬스토리지 저장 (고유번호 필요)
// ======================================================
async function fetchUserData({ endpoint, storageKey, nextPage }) {
  const userKey = prompt("고유번호를 입력해주세요.");
  if (!userKey) return;

  localStorage.removeItem(storageKey);
  const API_URL = `https://aibe4-project1-team2-m9vr.onrender.com/${endpoint}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey }),
    });

    const result = await response.json();

    if (!response.ok || !result.data) {
      alert(result.message || "데이터를 불러오지 못했습니다.");
      console.warn("응답 데이터:", result);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(result.data));
    window.location.href = nextPage;
  } catch (error) {
    console.error("서버 통신 오류:", error);
    alert("서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// ======================================================
// 1-1. 여행자 후기 요청 (고유번호 없이 바로 요청)
// ======================================================
async function fetchPublicReviews() {
  const storageKey = "reviews";

  localStorage.removeItem(storageKey);

  try {
    const res = await fetch(
      "https://aibe4-project1-team2-m9vr.onrender.com/reviews"
    );
    if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);

    const { success, data, message } = await res.json();
    const reviews = data?.reviews ?? [];

    if (success === false || !Array.isArray(reviews) || reviews.length === 0) {
      return handleError(message || "유효한 리뷰 데이터가 없습니다.");
    }

    localStorage.setItem(storageKey, JSON.stringify(reviews));
    window.location.href = "../reviews/reviews.html";
  } catch (error) {
    console.error("서버 통신 오류:", error);
    alert("서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// ======================================================
// 2. 현재 페이지 버튼 활성화
// ======================================================
function setActiveNavButton() {
  const path = window.location.pathname;

  const btnMyAiPlans = document.getElementById("btnMyAiPlans");
  const btnMyReviews = document.getElementById("btnMyReviews");
  const btnAiPlan = document.querySelector(".nav-btn.ai-plan");
  const btnReviews = document.querySelector(".nav-btn.reviews");

  if (path.includes("/my-ai-plans/")) {
    btnMyAiPlans?.classList.add("active-page");
  } else if (path.includes("/my-reviews/")) {
    btnMyReviews?.classList.add("active-page");
  } else if (path.includes("/ai-plan/")) {
    btnAiPlan?.classList.add("active-page");
  } else if (path.includes("/reviews/")) {
    btnReviews?.classList.add("active-page");
  }
}

// ======================================================
// 3. 햄버거 메뉴 동작
// ======================================================
function initHamburgerMenu() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  if (!navToggle || !navMenu) return;

  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("open");
  });

  navMenu.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-btn")) {
      navMenu.classList.remove("open");
      navToggle.classList.remove("active");
    }
  });
}

// ======================================================
// 4. 모달 스크롤 초기화
// ======================================================
function initModalScrollReset() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".modal-overlay.active").forEach((modal) => {
      const modalContent = modal.querySelector(".modal-content");
      if (modalContent) modalContent.scrollTop = 0;
      modal.scrollTop = 0;
    });
  });

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });

  document.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal-overlay.active");
    if (!modal) return;
    const modalContent = modal.querySelector(".modal-content");
    if (modalContent) modalContent.scrollTop = 0;
    modal.scrollTop = 0;
  });
}

// ======================================================
// 5. 뒤로가기 버튼 스크롤 초기화
// ======================================================
function initBackButton() {
  const btnBack = document.querySelector(".btn-back");
  if (!btnBack) return;

  btnBack.addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      document
        .querySelectorAll(".main-content")
        .forEach((el) => el.scrollTo({ top: 0, behavior: "instant" }));
    }, 0);
  });
}

// ======================================================
// 6. 스크롤 복원 방지
// ======================================================
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// ======================================================
// 7. 초기화
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  const btnMyAiPlans = document.getElementById("btnMyAiPlans");
  const btnMyReviews = document.getElementById("btnMyReviews");
  const btnReviews = document.getElementById("btnReviews");

  // 📅 내가 저장한 일정
  btnMyAiPlans?.addEventListener("click", () =>
    fetchUserData({
      endpoint: "my-plans",
      storageKey: "myAiPlans",
      nextPage: "../my-ai-plans/my-ai-plans.html",
    })
  );

  // 📝 내가 작성한 후기
  btnMyReviews?.addEventListener("click", () =>
    fetchUserData({
      endpoint: "reviews/my-reviews",
      storageKey: "myReviews",
      nextPage: "../my-reviews/my-reviews.html",
    })
  );

  // 💬 여행자들의 후기 — 고유번호 없이 바로 서버 요청
  btnReviews?.addEventListener("click", fetchPublicReviews);

  setActiveNavButton();
  initHamburgerMenu();
  initBackButton();
  initModalScrollReset();
});
