// [초기화: 페이지 로딩이 완료되면 실행]

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('savedReviews')) {
        setupMockData();
    }
    renderMyReviews();
    setupEventListeners();
});


// [데이터 렌더링 (화면 그리기)]

function renderMyReviews() {
    const reviews = JSON.parse(localStorage.getItem('savedReviews')) || [];
    const listContainer = document.querySelector('.review-list');
    listContainer.innerHTML = '';

    reviews.forEach((review, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item clickable';
        reviewItem.dataset.type = 'review';
        reviewItem.dataset.index = index;
        reviewItem.innerHTML = `
            <img src="${review.img_path}" alt="${review.title}" class="review-photo">
            <div class="review-details">
                <h3>${review.title} ${generateStars(review.rate)}</h3>
                <p>${review.content.substring(0, 80)}...</p> 
            </div>
            <div class="reviewBtn-group">
                <button class="reviewModifyBtn" data-type="review" data-index="${index}">수정하기</button>
                <button class="deleteModifyBtn" data-type="review" data-index="${index}">삭제하기</button>
            </div>
        `;
        listContainer.appendChild(reviewItem);
    });
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

function handleModify(button) {
    const index = parseInt(button.dataset.index, 10);
    const reviews = JSON.parse(localStorage.getItem('savedReviews'));
    const dataToModify = reviews[index];

    if (dataToModify) {
        // 수정할 데이터를 수정 폼 모달에 채워 넣기
        populateModifyForm(dataToModify);
        // 수정 폼 모달 열기
        openModal(document.getElementById('modifyModal'));
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
function handleModifySubmit(event) {
    event.preventDefault(); // 폼 기본 동작 방지

    const id = parseInt(document.getElementById('modifyReviewId').value, 10);
    const newTitle = document.getElementById('modifyTitle').value;
    const newContent = document.getElementById('modifyContent').value;
    const newRating = document.querySelector('input[name="modifyRating"]:checked').value;

    // 1. Local Storage에서 전체 리뷰 데이터 가져오기
    let reviews = JSON.parse(localStorage.getItem('savedReviews'));

    // 2. 수정할 리뷰 찾아서 내용 업데이트
    const reviewIndex = reviews.findIndex(review => review.id === id);
    if (reviewIndex > -1) {
        reviews[reviewIndex].title = newTitle;
        reviews[reviewIndex].content = newContent;
        reviews[reviewIndex].rate = parseInt(newRating, 10);
    }

    // 3. 수정된 전체 데이터를 다시 Local Storage에 저장
    localStorage.setItem('savedReviews', JSON.stringify(reviews));

    // 4. 화면 다시 그리기 및 모달 닫기
    renderMyReviews();
    closeModal(document.getElementById('modifyModal'));
    alert('리뷰가 성공적으로 수정되었습니다.');
}

function handleDelete(button) {
    const index = parseInt(button.dataset.index, 10);
    const isConfirmed = confirm('정말로 이 리뷰를 삭제하시겠습니까?');

    if (isConfirmed) {
        const reviews = JSON.parse(localStorage.getItem('savedReviews')) || [];
        reviews.splice(index, 1);
        localStorage.setItem('savedReviews', JSON.stringify(reviews));
        renderMyReviews();
    }
}

function handleDetailView(item) {
    const index = parseInt(item.dataset.index, 10);
    const reviews = JSON.parse(localStorage.getItem('savedReviews'));
    populateReviewModal(reviews[index]);
    openModal(document.getElementById('reviewModal'));
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


// 목 데이터 설정 (리뷰 데이터만 포함)

function setupMockData() {
    const mockReviews = {
        "success": true, "statusCode": 200, "message": "성공적으로 조회되었습니다.",
        "data": [
            {   "id": 1, 
                "rate": 5, 
                "title": "부산 존잼", 
                "departure": "경주", 
                "content": "광안리 너무 예쁘고 감동이었어요. 음식 존맛탱! 바다 존예! ㅎㅎㅎ", 
                "arrival": "부산", 
                "img_path": "https://images.unsplash.com/photo-1574936145849-f8aa04d2a37c?q=80&w=400" 
            },
            { "id": 2, 
                "rate": 4, 
                "title": "제주 존예", 
                "departure": "제주", 
                "arrival": "성산일출봉", 
                "content": "가족들과 함께 성산일출봉에 다녀왔어요. 날씨가 조금 흐렸지만 경치가 정말 좋아서 만족스러운 여행이었습니다.", 
                "img_path": "https://images.unsplash.com/photo-1582238332992-a124fa9349c6?q=80&w=400" 
            }
        ]
    };
    localStorage.setItem('savedReviews', JSON.stringify(mockReviews.data));
}