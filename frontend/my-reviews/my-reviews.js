// ✅ [초기화: 페이지 로딩 완료 시 실행]
document.addEventListener('DOMContentLoaded', () => {
    renderMyReviews();
    setupEventListeners();
});


// ✅ [데이터 렌더링 (서버에서 리뷰 목록 불러오기)]
async function renderMyReviews() {
    const listContainer = document.querySelector('.review-list');
    listContainer.innerHTML = '';

    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';
    const aiTripData = JSON.parse(localStorage.getItem('aiTripResult') || '{}');
    const userKey = aiTripData.userKey || '1'; // 기본값으로 1

    try {
        const res = await fetch(`${BASE_URL}/reviews`);
        if (!res.ok) {
            throw new Error(`리뷰를 불러오지 못했습니다. (상태 코드: ${res.status})`);
        }

        const result = await res.json();
        console.log("서버 응답:", result);

        // ✅ 구조 유연하게 처리
        const reviews = (result.data && result.data.reviews)
            ? result.data.reviews
            : (Array.isArray(result.data) ? result.data : []);

        if (!Array.isArray(reviews) || reviews.length === 0) {
            listContainer.innerHTML = '<p class="no-data-message">아직 작성된 리뷰가 없습니다. 😊</p>';
            return;
        }

        reviews.forEach((review, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item clickable';
            reviewItem.dataset.reviewId = review.id;
            reviewItem.innerHTML = `
                <img src="${review.img_path}" alt="${review.title}" class="review-photo">
                <div class="review-details">
                    <h3>${review.title} ${generateStars(review.rate)}</h3>
                    <p>${review.content.substring(0, 80)}...</p>
                </div>
                <div class="reviewBtn-group">
                    <button class="reviewModifyBtn" data-review-id="${review.id}">수정하기</button>
                    <button class="deleteModifyBtn" data-review-id="${review.id}">삭제하기</button>
                </div>
            `;
            listContainer.appendChild(reviewItem);
        });

    } catch (error) {
        console.error('리뷰 로딩 중 오류:', error);
        listContainer.innerHTML = `<p class="error-message">리뷰를 불러오는 데 문제가 발생했습니다. (에러: ${error.message})</p>`;
    }
}


// ✅ [이벤트 리스너 설정]
function setupEventListeners() {
    const contentArea = document.querySelector('.content-area');

    contentArea.addEventListener('click', (event) => {
        const target = event.target;

        if (target.matches('.reviewModifyBtn')) {
            event.stopPropagation();
            handleModify(target);
            return;
        }

        if (target.matches('.deleteModifyBtn')) {
            event.stopPropagation();
            handleDelete(target);
            return;
        }

        const clickableItem = target.closest('.clickable');
        if (clickableItem) handleDetailView(clickableItem);
    });

    // 모달 닫기 이벤트
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) closeButton.addEventListener('click', () => closeModal(modal));
    });

    // ESC 키로 닫기
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal);
        }
    });
}


// ✅ [리뷰 수정 버튼 클릭 시 처리]
async function handleModify(button) {
    const reviewId = button.dataset.reviewId;
    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

    try {
        const res = await fetch(`${BASE_URL}/reviews/${reviewId}`);
        if (!res.ok) throw new Error(`리뷰 상세 조회 실패 (상태 코드: ${res.status})`);

        const result = await res.json();
        const dataToModify = result.data || result.review || null;

        if (!dataToModify) throw new Error("수정할 리뷰 데이터를 찾을 수 없습니다.");

        populateModifyForm(dataToModify);
        openModal(document.getElementById('modifyModal'));
    } catch (error) {
        console.error('리뷰 수정 데이터 불러오기 실패:', error);
        alert('리뷰 수정 정보를 불러오는 데 실패했습니다.');
    }
}


// ✅ 수정 폼에 기존 데이터 채워넣기
function populateModifyForm(data) {
    document.getElementById('modifyReviewId').value = data.id;
    document.getElementById('modifyTitle').value = data.title || '';
    document.getElementById('modifyContent').textContent = data.content || '';

    const ratingContainer = document.getElementById('modifyRating');
    ratingContainer.innerHTML = '';
    for (let i = 5; i >= 1; i--) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `modify-${i}-stars`;
        input.name = 'modifyRating';
        input.value = i;
        if (i === data.rate) input.checked = true;

        const label = document.createElement('label');
        label.htmlFor = `modify-${i}-stars`;
        label.textContent = '★';
        ratingContainer.appendChild(input);
        ratingContainer.appendChild(label);
    }
}
