// 페이지 로딩 완료 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 1. 두 종류의 목 데이터를 Local Storage에 저장하는 함수 호출
    setupMockData();
    
    // 2. 초기 기능 설정
    setupTabs();
    renderItineraryCards();
    renderMyReviews();
    setupEventListeners();
});

// 탭 기능
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// '내 일정' 카드 생성
function renderItineraryCards() {
    // ✨ 'savedItineraries' 키에서 데이터 가져오기
    const itineraries = JSON.parse(localStorage.getItem('savedItineraries')) || [];
    const grid = document.querySelector('#itinerary .itinerary-grid');
    grid.innerHTML = '';

    itineraries.forEach((plan, index) => {
        const card = document.createElement('div');
        card.className = 'itinerary-card clickable';
        card.dataset.type = 'itinerary';
        card.dataset.index = index;
        card.innerHTML = `
            <h3>${plan.departure} - ${plan.arrival}</h3>
            <button class="itinerary-deleteBtn" data-type="itinerary" data-index="${index}">삭제하기</button>
        `;
        grid.appendChild(card);
    });
}

// '내 리뷰' 목록 생성
function renderMyReviews() {
    // ✨ 'savedReviews' 키에서 데이터 가져오기
    const reviews = JSON.parse(localStorage.getItem('savedReviews')) || [];
    const listContainer = document.querySelector('#reviews .review-list');
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
                <button class="reviewModifyBtn" data-index="${index}">수정하기</button>
                <button class="deleteModifyBtn" data-type="review" data-index="${index}">삭제하기</button>
            </div>
        `;
        listContainer.appendChild(reviewItem);
    });
}

// 이벤트 리스너 설정 (클릭 관리)
function setupEventListeners() {
    const contentArea = document.querySelector('.content-area');
    
    contentArea.addEventListener('click', (event) => {
        const target = event.target;

        // 일정 삭제 버튼 클릭 처리
        if (target.matches('.itinerary-deleteBtn')) {
            event.stopPropagation(); // 모달이 열리는 것을 방지
            handleDelete(target);
            return;
        }

        // 리뷰 내 버튼
        // 수정 버튼 클릭 처리
        if (target.matches('.reviewModifyBtn')) {
            event.stopPropagation(); // 모달이 열리는 것을 방지
            handleModify(target);
            return;
        }

        // 삭제 버튼 클릭 처리
        if (target.matches('.deleteModifyBtn')) {
            event.stopPropagation();
            handleDelete(target);
            return;
        }

        // ✨ 상세 보기 클릭 처리 (이벤트 위임)
        const clickableItem = target.closest('.clickable');
        if (clickableItem) {
            handleDetailView(clickableItem);
        }
    });

    const reviewBtn = document.querySelector("#reviewBtn");
    reviewBtn.addEventListener("click", (event) => {
        window.location.href = '../review-form/review-form.html';
    })

    // 모달 닫기 버튼 이벤트
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal-overlay');
            closeModal(modal);
        });
    });
}

// '수정하기' 처리 함수
function handleModify(button) {
    const type = button.dataset.type;
    const index = parseInt(button.dataset.index, 10);

    let dataToModify;

    if (type === 'itinerary') {
        const itineraries = JSON.parse(localStorage.getItem('savedItineraries'));
        dataToModify = itineraries[index];
    } else if (type === 'review') {
        const reviews = JSON.parse(localStorage.getItem('savedReviews'));
        dataToModify = reviews[index];
    }

    if (dataToModify) {
        // 수정할 데이터를 localStorage에 임시 저장
        localStorage.setItem('dataToModify', JSON.stringify(dataToModify));
        
        // 수정 페이지로 이동
        window.location.href = '../review-form/review-form.html';
    }
}

// '삭제하기' 처리 함수
function handleDelete(button) {
    const type = button.dataset.type;
    const index = parseInt(button.dataset.index, 10);
    const isConfirmed = confirm(`정말로 이 ${type === 'itinerary' ? '일정' : '리뷰'}을(를) 삭제하시겠습니까?`);

    if (isConfirmed) {
        if (type === 'itinerary') {
            const itineraries = JSON.parse(localStorage.getItem('savedItineraries')) || [];
            itineraries.splice(index, 1);
            localStorage.setItem('savedItineraries', JSON.stringify(itineraries));
            renderItineraryCards();
        } else if (type === 'review') {
            const reviews = JSON.parse(localStorage.getItem('savedReviews')) || [];
            reviews.splice(index, 1);
            localStorage.setItem('savedReviews', JSON.stringify(reviews));
            renderMyReviews();
        }
    }
}

function handleDetailView(item) {
    const type = item.dataset.type;
    const index = parseInt(item.dataset.index, 10);
    
    if (type === 'itinerary') {
        const itineraries = JSON.parse(localStorage.getItem('savedItineraries'));
        populateItineraryModal(itineraries[index]);
        openModal(document.getElementById('itineraryModal'));
    } else if (type === 'review') {
        const reviews = JSON.parse(localStorage.getItem('savedReviews'));
        populateReviewModal(reviews[index]);
        openModal(document.getElementById('reviewModal'));
    }
}

// ✨ [일정] 모달 내용 채우기
function populateItineraryModal(data) {
    document.getElementById('modalItineraryTitle').textContent = `${data.departure} → ${data.arrival} 여행`;
    document.getElementById('modalItineraryDuration').textContent = `${data.companionsType} | 총 ${
    data.companions
  }명 | 예산 약 ${Number(
    data.budget
  ).toLocaleString()}원`;
    const body = document.getElementById('modalItineraryBody');
    body.innerHTML = `
        <div class="day-plan">
            <h4>AI 추천 일정</h4>
            <p>${data.ai_schedule}</p>
        </div>
    `;
}

// ✨ [리뷰] 모달 내용 채우기
function populateReviewModal(data) {
    document.getElementById('modalReviewTitle').textContent = data.title;
    document.getElementById('modalReviewRating').textContent = generateStars(data.rate);
    document.getElementById('modalReviewPhoto').src = data.img_path;
    document.getElementById('modalReviewContent').textContent = data.content;
}

// 별점 생성 함수
function generateStars(rate) {
    const filledStar = '★';
    const emptyStar = '☆';
    return filledStar.repeat(rate) + emptyStar.repeat(5 - rate);
}

// [모달을 열고 닫는 범용 함수]
const body = document.body;

// 모달 여는 함수
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        body.classList.add('modal-open'); // 배경 스크롤 방지
    }
}

// 모달 닫는 함수
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        body.classList.remove('modal-open'); // 배경 스크롤 복원
    }
}

// ⚠️ 목 데이터
function setupMockData() {
    // '내 일정' 목 데이터 (서버 응답이라고 가정)
    const mockItineraries = {
        "success": true, "statusCode": 200, "message": "성공적으로 조회되었습니다.",
        "data": [
            {
                "id": 1, "rate": 5, "departure": "경주", "arrival": "부산", "companionsType": "친구", "companions": 3,
                "travelStyles": "자연과 함께", "budget": 100000, "additionalInfo": "추가적인 세부사항",
                "img_path": "img_url", "ai_schedule": "오전 9시 경주역에서 KTX 탑승 (약 30분 소요) 하여 부산역 도착..."
            },
            {
                "id": 2, "rate": 4, "title": "제주도 가족 여행", "departure": "서울", "arrival": "제주", "companionsType": "가족", "companions": 5,
                "travelStyles": "액티비티", "budget": 100000, "additionalInfo": "추가적인 세부사항",
                "img_path": "img_url", "ai_schedule": "오전 10시 제주공항 렌터카 수령 후 성산일출봉으로 이동 (약 1시간 30분 소요)..."
            }
        ]
    };

    // '내 리뷰' 목 데이터 (서버 응답이라고 가정)
    const mockReviews = {
        "success": true, "statusCode": 200, "message": "성공적으로 조회되었습니다.",
        "data": [
            {
                "id": 1, "rate": 5, "title": "부산 존잼", "departure": "경주", "arrival": "부산",
                "content": "광안리 너무 예쁘고 감동이었어요. 음식 존맛탱! 바다 존예! ㅎㅎㅎ",
                "img_path": "https://images.unsplash.com/photo-1574936145849-f8aa04d2a37c?q=80&w=400"
            },
            {
                "id": 2, "rate": 4, "title": "제주 존예", "departure": "제주", "arrival": "성산일출봉",
                "content": "가족들과 함께 성산일출봉에 다녀왔어요. 날씨가 조금 흐렸지만 경치가 정말 좋아서 만족스러운 여행이었습니다.",
                "img_path": "https://images.unsplash.com/photo-1582238332992-a124fa9349c6?q=80&w=400"
            }
        ]
    };

    // 각 데이터를 Local Storage에 저장
    localStorage.setItem('savedItineraries', JSON.stringify(mockItineraries.data));
    localStorage.setItem('savedReviews', JSON.stringify(mockReviews.data));
}

// 사용자에게 저장이 완료되었음을 알림
alert('테스트용 일정 및 리뷰 데이터가 Local Storage에 성공적으로 저장되었습니다!');