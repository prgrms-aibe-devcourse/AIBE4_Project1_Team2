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

// =============================
//  2. 함수 정의
// =============================
// 리뷰 카드 하나를 생성하는 함수 (HTML 문자열 반환)
function createReviewCard(review) {
    const card = document.createElement("div");
    card.className = "review-card clickable";
    card.innerHTML = `
        <div class="card-image">
            <img src="${review.img_path}" alt="${review.title}" />
        </div>
        <div class="card-content">
            <h3>${review.title}</h3>
            <p>${review.content.substring(0, 50)}...</p>
        </div>
    `;
    card.addEventListener("click", () => openModal(review));
    return card;
}

// 모든 리뷰 데이터를 받아와 화면에 렌더링하는 메인 함수
function renderReviews(reviews) {
    if(!Array.isArray(reviews) || reviews.length === 0) {
        console.error("renderReviews : 전달된 데이터가 배열이 아니거나 비어있습니다. ", reviews);
        if(DOM.reviewsContainer) {
            DOM.reviewsContainer.innerHTML = "<p>표시할 리뷰가 없습니다.</p>";
        }
        return;
    }
    console.log("renderReviews 함수가 받은 데이터 : ", reviews);
    console.log("reviews 변수가 배열인지 확인 : ", Array.isArray(reviews));

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

// 특정 리뷰 데이터로 모달창의 내용을 채우고 표시하는 함수
function openModal(review) {
    DOM.modal.title.textContent = review.title;
    DOM.modal.image.src = review.img_path;
    DOM.modal.content.textContent = review.content;
    DOM.modal.rate.textContent = "★".repeat(review.rate) + "☆".repeat(5 - review.rate);
    DOM.modal.overlay.classList.add("active");
    DOM.body.classList.add("modal-open");
}

// 모달창을 닫는 함수
function closeModal() {
    DOM.modal.overlay.classList.remove("active");
    DOM.body.classList.remove("modal-open");
}

// '내 리뷰 보기' 버튼 클릭 시, 리뷰를 받아와 페이지를 이동시키는 함수
async function handleMyReviewsClick() {
    try {
        const result = await fetchReviews();
    
    if (result.success) {
        alert(result.message);
        localStorage.setItem("reviews", JSON.stringify(result.data));
        window.location.href = "../my-reviews/my-reviews.html";
    } else {
        alert(result.message);
    }
  } catch (err) {
        console.error("통신 중 오류 발생:", err);
        alert("⚠️ 서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

function createReviewCard(review) {
  const card = document.createElement("div");
  card.className = "review-card clickable";

  // 안전하게 기본 이미지 설정
  const imageSrc = review?.img_path || "https://placehold.co/400x300?text=No+Image";

  card.innerHTML = `
    <div class="card-image">
      <img src="${imageSrc}" alt="${review.title || '리뷰 이미지'}" />
    </div>
    <div class="card-content">
      <h3>${review.title || '제목 없음'}</h3>
      <p>${review.content ? review.content.substring(0, 50) : '내용 없음'}...</p>
    </div>
  `;
  card.addEventListener("click", () => openModal(review));
  return card;
}


// =============================
//  3. API 통신 함수
// =============================
// 서버에서 모든 공개 리뷰를 가져오는 함수
const fetchReviews = async () => {
    const API_URL = "https://aibe4-project1-team2-m9vr.onrender.com/reviews";
    console.log(`[API 요청] 고정 URL: ${API_URL}`);

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP 에러! Status: ${response.status}`);
        }
        return response.json();

    } catch (error) {
        console.error("API 통신 중 에러 발생:", error);
        throw error;
    }
};

// =============================
//  4. 이벤트 리스너 연결 및 초기화
// =============================

// 페이지 로딩 완료 시 리뷰 렌더링
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const savedReviews = localStorage.getItem("reviews");
    let reviewsArray = [];

    if (savedReviews) {
      console.log("✅ LocalStorage에서 리뷰 데이터 불러옴");
      const parsedReviews = JSON.parse(savedReviews);

      // 배열 형태면 그대로 사용
      if (Array.isArray(parsedReviews)) {
        reviewsArray = parsedReviews;
      }
      // { data: [...] } 구조면 data만 사용
      else if (parsedReviews && Array.isArray(parsedReviews.data)) {
        reviewsArray = parsedReviews.data;
      }

      console.log("🧾 불러온 리뷰 데이터:", reviewsArray);
      renderReviews(reviewsArray);
      return;
    }

    // ⚠️ localStorage 비어 있을 때 → 서버 요청
    console.log("⚠️ LocalStorage 비어 있음 → 서버에서 리뷰 요청");
    const result = await fetchReviews();

    // 서버 응답 구조에 따라 유연하게 처리
    if (result) {
      if (Array.isArray(result)) {
        reviewsArray = result;
      } else if (result.success && Array.isArray(result.data)) {
        reviewsArray = result.data;
      }
    }

    if (reviewsArray.length > 0) {
      renderReviews(reviewsArray);
      localStorage.setItem("reviews", JSON.stringify(reviewsArray));
      console.log("✅ 서버에서 리뷰 데이터 성공적으로 렌더링");
    } else {
      console.warn("서버에서 유효한 리뷰 데이터를 찾지 못했습니다:", result);
      renderReviews([]);
    }
  } catch (error) {
    console.error("페이지 로딩 중 데이터 통신 에러:", error);
  }
});


// '내 리뷰 보기' 버튼에 새로운 핸들러 연결
DOM.buttons.myReviews.addEventListener("click", handleMyReviewsClick);

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

