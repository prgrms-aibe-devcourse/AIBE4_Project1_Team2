// [초기화: 페이지 로딩이 완료되면 실행]햣
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
        const reviews = result.data;

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
    // 1. 페이지에 있는 모든 모달을 선택합니다.
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        // 1-1. 각 모달의 배경 클릭 시 닫기 이벤트 추가
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });

        // 1-2. 각 모달 안의 닫기 버튼(X)에 클릭 이벤트 추가
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeModal(modal);
            });
        }
    });

    // 2. Esc 키를 누르면 현재 열려있는 모달을 닫습니다.
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // 현재 활성화된(active) 모달을 찾습니다.
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

async function handleModify(button) {
    const reviewId = button.dataset.reviewId;
    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';
    
    // 로딩 상태를 표시하여 사용자에게 대기 중임을 알림
    console.log(`리뷰 ID ${reviewId}의 상세 정보를 불러오는 중...`);

    try {
        // 1. API에 GET 요청 보내기. 리뷰 ID를 URL에 포함합니다.
        const res = await fetch(`${BASE_URL}/reviews/${reviewId}`);
        
        // 2. 응답이 성공적인지 확인
        if (!res.ok) {
            throw new Error(`상세 리뷰를 불러오는 데 실패했습니다. (상태 코드: ${res.status})`);
        }

        // 3. JSON 응답 데이터를 파싱(Parsing)
        const result = await res.json();
        const dataToModify = result.data; // 서버 응답에서 'data' 필드에 상세 정보가 있음
        
        // 4. 받아온 데이터로 수정 폼 모달 채우기
        if (dataToModify) {
            populateModifyForm(dataToModify);
            // 수정 폼 모달 열기
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
    document.getElementById('modifyReviewId').value = data.id; // 수정할 리뷰의 id 저장
    document.getElementById('modifyTitle').value = data.title;
    document.getElementById('modifyContent').textContent = data.content;

    // 별점 채우기
    const ratingContainer = document.getElementById('modifyRating');
    ratingContainer.innerHTML = ''; // 기존 별점 비우기
    for (let i = 5; i >= 1; i--) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `modify-${i}-stars`;
        input.name = 'modifyRating';
        input.value = i;
        if (i === data.rate) {
            input.checked = true;
        }
        
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
        reviewId: parseInt(reviewId) // API에 필요한 ID를 명시적으로 포함
    };

    try {
        const res = await fetch(`${BASE_URL}/mypage/1/review`, { // planId는 임시로 1로 설정
            method: 'POST', // HTTP 메서드를 'POST'로 지정
            headers: {
                'Content-Type': 'application/json', // 보내는 데이터가 JSON임을 명시
            },
            body: JSON.stringify(updatedData), // 자바스크립트 객체를 JSON 문자열로 변환
        });

        if (!res.ok) {
            throw new Error('리뷰 수정에 실패했습니다.');
        }

        alert('리뷰가 성공적으로 수정되었습니다.');
        closeModal(document.getElementById('modifyModal'));
        renderMyReviews();
    } catch (error) {
        console.error('리뷰 수정 중 오류 발생:', error);
        alert('리뷰 수정 중 문제가 발생했습니다.');
    }
}

async function handleDelete(button) {
    const reviewId = button.dataset.reviewId;
    const isConfirmed = confirm('정말로 이 리뷰를 삭제하시겠습니까?');
    if (!isConfirmed) return;

    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

    try {
        const res = await fetch(`${BASE_URL}/mypage/my-review/${reviewId}`, {
            method: 'DELETE', // HTTP 메서드를 'DELETE'로 지정
        });

        if (!res.ok) {
            throw new Error('리뷰 삭제에 실패했습니다.');
        }

        alert('리뷰가 성공적으로 삭제되었습니다.');
        renderMyReviews(); // 삭제 후 목록 다시 불러오기
    } catch (error) {
        console.error('리뷰 삭제 중 오류 발생:', error);
        alert('리뷰 삭제 중 문제가 발생했습니다.');
    }
}

async function handleDetailView(item) {
    const reviewId = item.dataset.reviewId;
    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

    try {
        const res = await fetch(`${BASE_URL}/reviews/${reviewId}`);
        if (!res.ok) {
            throw new Error('상세 리뷰를 불러오는 데 실패했습니다.');
        }

        const result = await res.json();
        const review = result.data; // API 응답 구조에 따라 'data' 필드에 접근

        populateReviewModal(review);
        openModal(document.getElementById('reviewModal'));
    } catch (error) {
        console.error('상세 리뷰 로딩 중 오류 발생:', error);
        alert('상세 정보를 불러올 수 없습니다.');
    }
}

function populateReviewModal(data) {
    document.getElementById('modalReviewTitle').textContent = data.title;
    document.getElementById('modalReviewRating').textContent = generateStars(data.rate);
    document.getElementById('modalReviewPhoto').src = data.img_path;
    document.getElementById('modalReviewContent').textContent = data.content;
}

function generateStars(rate) {
    const filledStar = '★';
    const emptyStar = '☆';
    const validRate = Math.min(5, Math.max(0, rate || 0));
    return filledStar.repeat(validRate) + emptyStar.repeat(5 - validRate);
}

// 모달 공용 함수
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


// // 목 데이터 설정 (리뷰 데이터만 포함)

// function setupMockData() {
//     const mockReviews = {
//         "success": true,
//         "statusCode": 200,
//         "message": "성공적으로 조회되었습니다.",
//         "data": [
//             {
//                 "id": 1,
//             "rate": 5,
//             "title": "부산 존잼",
//             "departure": "경주",
//             "arrival": "부산",
//             "content": "광안리 너무 예쁘고 감동이었어요. 음식 존맛탱! 바다 존예! ㅎㅎㅎ",
//             "img_path": "img_url"
//             },
//             {
//                 "id": 2,
//                 "rate": 4,
//                 "title": "제주 존예",
//                 "departure": "제주",
//                 "arrival": "성산일출봉",
//                 "content": "가족들과 함께 성산일출봉에 다녀왔어요. 날씨가 조금 흐렸지만 경치가 정말 좋아서 만족스러운 여행이었습니다.",
//                 "img_path": "img_url"
//                 },
//                 {
//                 "id": 3,
//                 "rate": 5,
//                 "departure": "서울",
//                 "arrival": "강릉",
//                 "content": "경포대에서 인생샷 많이 남기고 왔어요. 예쁜 카페도 많고, 해산물도 신선해서 정말 좋았습니다.",
//                 "img_path": "img_url",
//                 }
//         ]
//     };
//     localStorage.setItem('savedReviews', JSON.stringify(mockReviews.data));
// }