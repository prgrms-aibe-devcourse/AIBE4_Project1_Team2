// ======================================================
//  1. 상수 및 DOM 요소 관리
// ======================================================
const DOM = {
  body: document.body,
  reviewsContainer: document.getElementById("reviews-container"),
  buttons: {
    myReviews: document.getElementById("btnMyReviews"),
    mySchedules: document.getElementById("btnMySchedules"),
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
//  2. API 통신 함수
// ======================================================
const fetchReviews = async () => {
  const API_URL = "https://aibe4-project1-team2-m9vr.onrender.com/reviews";
  console.log(`[API 요청] URL: ${API_URL}`);

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP 에러 (${res.status})`);
    }
    return res.json();
  } catch (error) {
    console.error("🚨 리뷰 불러오기 중 오류:", error);
    throw error;
  }
};

// ======================================================
//  3. UI 렌더링 관련 함수
// ======================================================

// 리뷰 카드 생성
function createReviewCard(review) {
  const card = document.createElement("div");
  card.className = "review-card clickable";

  const imageSrc = review?.img_path || "https://placehold.co/400x300?text=No+Image";
  const title = review?.title || "제목 없음";
  const content = review?.content ? review.content.substring(0, 50) : "내용 없음";

  card.innerHTML = `
    <div class="card-image">
      <img src="${imageSrc}" alt="${title}" />
    </div>
    <div class="card-content">
      <h3>${title}</h3>
      <p>${content}...</p>
    </div>
  `;

  card.addEventListener("click", () => openModal(review));
  return card;
}

// 리뷰 목록 렌더링
function renderReviews(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    console.warn("⚠️ 리뷰 데이터가 비어 있거나 올바르지 않습니다:", reviews);
    if (DOM.reviewsContainer) {
      DOM.reviewsContainer.innerHTML = "<p>표시할 리뷰가 없습니다.</p>";
    }
    return;
  }

  console.log("🧾 렌더링할 리뷰 데이터:", reviews);
  DOM.reviewsContainer.innerHTML = "";

  // 도시(arrival) 기준으로 그룹화
  const reviewsByCity = reviews.reduce((acc, review) => {
    const city = review.arrival || "기타 지역";
    if (!acc[city]) acc[city] = [];
    acc[city].push(review);
    return acc;
  }, {});

  // 그룹별 섹션 생성
  Object.entries(reviewsByCity).forEach(([city, cityReviews]) => {
    const section = document.createElement("section");
    section.className = "region-section";

    const title = document.createElement("h2");
    title.textContent = city;

    const grid = document.createElement("div");
    grid.className = "review-grid";

    cityReviews.forEach((review) => grid.appendChild(createReviewCard(review)));

    section.append(title, grid);
    DOM.reviewsContainer.appendChild(section);
  });
}

// ======================================================
//  4. 모달 관련 함수
// ======================================================
function openModal(review) {
  DOM.modal.title.textContent = review?.title || "제목 없음";
  DOM.modal.image.src =
    review?.img_path || "https://placehold.co/600x400?text=No+Image";
  DOM.modal.content.textContent = review?.content || "내용이 없습니다.";
  DOM.modal.rate.textContent =
    "★".repeat(review?.rate || 0) + "☆".repeat(5 - (review?.rate || 0));

  DOM.modal.overlay.classList.add("active");
  DOM.body.classList.add("modal-open");
}

function closeModal() {
  DOM.modal.overlay.classList.remove("active");
  DOM.body.classList.remove("modal-open");
}

// ======================================================
//  5. 이벤트 핸들러
// ======================================================

// "내 리뷰 보기" 버튼 클릭 → 서버에서 내 리뷰 가져와 저장 후 페이지 이동
async function handleMyReviewsClick() {
  try {
    const result = await fetchReviews();

    if (result.success) {
      alert(result.message);

      // ✅ 구조 통일: reviews 배열만 저장
      const reviewsData = result.data?.reviews || result.data || [];
      localStorage.setItem("reviews", JSON.stringify(reviewsData));

      window.location.href = "../my-reviews/my-reviews.html";
    } else {
      alert(result.message || "리뷰를 불러오지 못했습니다.");
    }
  } catch (error) {
    console.error("❌ 내 리뷰 조회 중 오류:", error);
    alert("⚠️ 서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// ======================================================
//  6. 초기화 (DOMContentLoaded)
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const saved = localStorage.getItem("reviews");
    let reviewsArray = [];

    if (saved) {
      console.log("✅ LocalStorage에서 리뷰 불러옴");
      const parsed = JSON.parse(saved);

      // 구조 유연하게 처리
      if (Array.isArray(parsed)) reviewsArray = parsed;
      else if (Array.isArray(parsed.data)) reviewsArray = parsed.data;

      renderReviews(reviewsArray);
      return;
    }

    console.log("🌐 서버에서 리뷰 요청 중...");
    const result = await fetchReviews();

    if (Array.isArray(result)) reviewsArray = result;
    else if (result.success && Array.isArray(result.data)) reviewsArray = result.data;

    if (reviewsArray.length > 0) {
      renderReviews(reviewsArray);
      localStorage.setItem("reviews", JSON.stringify(reviewsArray));
      console.log("✅ 서버에서 리뷰 데이터 렌더링 완료");
    } else {
      console.warn("⚠️ 유효한 리뷰 데이터를 찾지 못했습니다:", result);
      renderReviews([]);
    }
  } catch (error) {
    console.error("🚨 페이지 초기화 중 오류:", error);
    DOM.reviewsContainer.innerHTML = `<p>리뷰를 불러오는 중 오류가 발생했습니다.</p>`;
  }
});

// ======================================================
//  7. 이벤트 리스너 등록
// ======================================================
DOM.buttons.myReviews?.addEventListener("click", handleMyReviewsClick);
DOM.modal.closeButton?.addEventListener("click", closeModal);

// 모달 외부 클릭 / ESC 키 닫기
DOM.modal.overlay?.addEventListener("click", (e) => {
  if (e.target === DOM.modal.overlay) closeModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && DOM.modal.overlay.classList.contains("active")) {
    closeModal();
  }
});

// ======================================================
//  8. 후기 검색 기능
// ======================================================
async function handleSearch() {
  const keyword = document.getElementById("keyword").value.trim();
  const region = document.getElementById("region").value.trim();
  const partner = document.getElementById("partner").value.trim();
  const type = document.getElementById("type").value.trim();
  const minRate = document.getElementById("minRate").value.trim();

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (region) queryParams.append("region", region);
  if (partner) queryParams.append("partner", partner);
  if (type) queryParams.append("type", type);
  if (minRate) queryParams.append("minRate", minRate);

  const API_URL = `https://aibe4-project1-team2-m9vr.onrender.com/reviews/search?${queryParams.toString()}`;
  console.log("[검색 요청]", API_URL);

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("검색 요청 실패");

    const result = await res.json();
    console.log("[검색 결과]", result);

    const reviews = result.data || [];
    renderReviews(reviews);

    if (reviews.length === 0) {
      DOM.reviewsContainer.innerHTML = `<p>검색 조건에 맞는 리뷰가 없습니다.</p>`;
    }
  } catch (error) {
    console.error("❌ 검색 중 오류:", error);
    alert("검색 중 오류가 발생했습니다.");
  }
}

document.getElementById("btnSearch")?.addEventListener("click", handleSearch);
