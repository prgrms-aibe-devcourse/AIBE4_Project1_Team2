// [초기화: 페이지 로딩이 완료되면 실행]
document.addEventListener('DOMContentLoaded', () => {
    renderMyReviews();
    setupEventListeners();
});


// [데이터 렌더링 (화면 그리기)]
async function renderMyReviews() {
    const listContainer = document.querySelector('.review-list');
    listContainer.innerHTML = '';

    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';
    
    try {
        // API 경로를 '/my-reviews' -> '/reviews'로 변경
        const res = await fetch(`${BASE_URL}/reviews`); 
        
        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            throw new Error(`리뷰를 불러오는 데 실패했습니다. (상태 코드: ${res.status})`);
        }

        const result = await res.json();
        console.log('서버 응답 데이터:', result); // ✅ 구조 확인용 로그

        // ✅ reviews가 객체 안에 들어있는 경우를 안전하게 처리
        const reviews = (result.data && result.data.reviews) 
            ? result.data.reviews 
            : (Array.isArray(result.data) ? result.data : []);

        if (reviews.length === 0) {
            listContainer.innerHTML = '<p class="no-data-message">아직 작성된 리뷰가 없습니다. 리뷰를 작성해 보세요!😊</p>';
            return;
        }
        
        reviews.forEach((review, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item clickable';
            reviewItem.dataset.type = 'review';
            reviewItem.dataset.index = index;
            reviewItem.dataset.reviewId = review.id;
            reviewItem.innerHTML = `
                <img src="${review.img_path}" alt="${review.title}" class="review-photo">
                <div class="review-details">
                    <h3>${review.title} ${generateStars(review.rate)}</h3>
                    <p>${review.content.substring(0, 80)}...</p> 
                </div>
                <div class="reviewBtn-group">
                    <button class="reviewModifyBtn" data-type="review" data-index="${index}" data-review-id="${review.id}">수정하기</button>
                    <button class="deleteModifyBtn" data-type="review" data-index="${index}" data-review-id="${review.id}">삭제하기</button>
                </div>
            `;
            listContainer.appendChild(reviewItem);
        });

    } catch (error) {
        console.error('리뷰 로딩 중 오류 발생:', error);
        listContainer.innerHTML = `<p class="error-message">리뷰를 불러오는 데 문제가 발생했습니다. 서버 상태를 확인해주세요. (에러: ${error.message})</p>`;
    }
}


// [이벤트 리스너 및 기능별 함수들]
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
        if (clickableItem) {
            handleDetailView(clickableItem);
        }
    });

    // 모달 닫기 버튼 이벤트
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });

        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeModal(modal);
            });
        }
    });

    // ESC 키로 모달 닫기
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal);
        }
    });
}


// [리뷰 수정 처리]
async function handleModify(button) {
    const reviewId = button.dataset.reviewId;
    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';
    
    console.log(`리뷰 ID ${reviewId}의 상세 정보를 불러오는 중...`);

    try {
        const res = await fetch(`${BASE_URL}/reviews/${reviewId}`);
        if (!res.ok) {
            throw new Error(`상세 리뷰를 불러오는 데 실패했습니다. (상태 코드: ${res.status})`);
        }

        const result = await res.json();
        const dataToModify = result.data || result.review || null; // ✅ 유연하게 처리
        
        if (dataToModify) {
            populateModifyForm(dataToModify);
            openModal(document.getElementById('modifyModal'));
        } else {
            throw new Error('데이터가 존재하지 않습니다.');
        }

    } catch (error) {
        console.error('리뷰 수정 데이터 로딩 중 오류 발생:', error);
        alert('리뷰 수정 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
    }
}


// 수정 폼 모달에 기존 데이터를 채우는 함수
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


// 수정 폼 제출 처리 함수 
async function handleModifySubmit(event) {
    event.preventDefault();

    const reviewId = document.getElementById('modifyReviewId').value;
    const newTitle = document.getElementById('modifyTitle').value;
    const newContent = document.getElementById('modifyContent').value;
    const checkedRating = document.querySelector('input[name="modifyRating"]:checked');
    const newRating = checkedRating ? parseInt(checkedRating.value, 10) : 0;

    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

    const updatedData = {
        title: newTitle,
        content: newContent,
        rate: newRating,
        reviewId: parseInt(reviewId)
    };

    try {
        const res = await fetch(`${BASE_URL}/mypage/1/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (!res.ok) throw new Error('리뷰 수정에 실패했습니다.');

        alert('리뷰가 성공적으로 수정되었습니다.');
        closeModal(document.getElementById('modifyModal'));
        renderMyReviews();

    } catch (error) {
        console.error('리뷰 수정 중 오류 발생:', error);
        alert('리뷰 수정 중 문제가 발생했습니다.');
    }
}


// [리뷰 삭제 처리]
async function handleDelete(button) {
    const reviewId = button.dataset.reviewId;
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;

    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

    try {
        const res = await fetch(`${BASE_URL}/mypage/my-review/${reviewId}`, {
            method: 'DELETE',
        });

        if (!res.ok) throw new Error('리뷰 삭제에 실패했습니다.');

        alert('리뷰가 성공적으로 삭제되었습니다.');
        renderMyReviews();
    } catch (error) {
        console.error('리뷰 삭제 중 오류 발생:', error);
        alert('리뷰 삭제 중 문제가 발생했습니다.');
    }
}


// [리뷰 상세 보기]
async function handleDetailView(item) {
    const reviewId = item.dataset.reviewId;
    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

    try {
        const res = await fetch(`${BASE_URL}/reviews/${reviewId}`);
        if (!res.ok) throw new Error('상세 리뷰를 불러오는 데 실패했습니다.');

        const result = await res.json();
        const review = result.data || result.review || null; // ✅ 안전하게 접근

        if (!review) throw new Error('리뷰 데이터가 존재하지 않습니다.');

        populateReviewModal(review);
        openModal(document.getElementById('reviewModal'));
    } catch (error) {
        console.error('상세 리뷰 로딩 중 오류 발생:', error);
        alert('상세 정보를 불러올 수 없습니다.');
    }
}


// [리뷰 모달 렌더링]
function populateReviewModal(data) {
    document.getElementById('modalReviewTitle').textContent = data.title || '';
    document.getElementById('modalReviewRating').textContent = generateStars(data.rate);
    document.getElementById('modalReviewPhoto').src = data.img_path || '';
    document.getElementById('modalReviewContent').textContent = data.content || '';
}


// [별점 표시]
function generateStars(rate) {
    const filledStar = '★';
    const emptyStar = '☆';
    const validRate = Math.min(5, Math.max(0, rate || 0));
    return filledStar.repeat(validRate) + emptyStar.repeat(5 - validRate);
}


// [모달 공용 함수]
const body = document.body;
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        body.classList.add('modal-open');
    }
}
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        body.classList.remove('modal-open');
    }
}