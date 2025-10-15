// ======================================================
// ✨ 1. 코드 실행 부분
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    // ✨ 한 페이지에 두 기능이 모두 있으므로, 두 초기화 함수를 모두 실행합니다.
    initAiPlanResultPage();
    initReviewFormPage();
});


// ======================================================
// ✨ 2. 함수 정의
// ======================================================

// --- 페이지 초기화 함수 ---
function initAiPlanResultPage() {
    // 목 데이터를 Local Storage에 저장하고 화면에 렌더링
    localStorage.setItem('aiTripResult', JSON.stringify(mockAiTripResult));
    renderSchedule(mockAiTripResult);
}

function initReviewFormPage() {
    // 폼 요소를 찾아서 submit 이벤트 리스너를 연결합니다.
    const form = document.querySelector('#reviewForm');
    if (!form) return;

    form.addEventListener("submit", handleReviewSubmit);
    setupDragAndDrop();
}

// --- AI 일정 결과 페이지 기능 ---
function renderSchedule(data) {
    // data가 없으면 함수를 종료합니다.
    if (!data || !data.recommendation) return;

    const recommendation = data.recommendation;
    
    // 헤더 채우기
    const tripTitleEl = document.getElementById('trip-title');
    if (tripTitleEl) {
        tripTitleEl.innerHTML = `<span class="title-black">${data.departure}</span> → <span class="highlight">${recommendation.destinationName}</span> <span class="title-black">여행 일정</span>`;
    }

    // 부가 정보 채우기
    const tripInfoEl = document.getElementById('trip-info');
    if (tripInfoEl) {
        tripInfoEl.textContent = `${data.companionsType} ${data.companions}명 | ${data.travelStyles.join(', ')}`;
    }

    // 여행지 설명 채우기
    const descriptionEl = document.getElementById('destination-description');
    if (descriptionEl) {
        descriptionEl.textContent = recommendation.destinationDescription;
    }

    // 타임라인 채우기
    const timelineEl = document.getElementById('timeline');
    if (timelineEl) {
        timelineEl.innerHTML = '';
        recommendation.itinerary.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <div class="time">${item.time}</div>
                <div class="details">
                    <div class="activity">${item.activity}</div>
                    <div class="description">${item.description}</div>
                    <div class="transport">이동수단: ${item.transportation}</div>
                </div>
            `;
            timelineEl.appendChild(div);
        });
    }

    // 여행 팁 채우기
    const notesEl = document.getElementById('trip-notes');
    if (notesEl) {
        notesEl.innerHTML = '';
        recommendation.notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note;
            notesEl.appendChild(li);
        });
    }
}

// --- 리뷰 작성 폼 페이지 기능 ---
function handleReviewSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const password = document.getElementById('password').value;
    const photoFile = document.getElementById('photo-upload').files[0];
    const ratingChecked = document.querySelector('input[name="rating"]:checked');

    if (!ratingChecked) {
        alert("별점을 선택해주세요!");
        return;
    }
    const rate = parseInt(ratingChecked.value, 10);

    if (photoFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img_path = e.target.result;
            const newReview = createReviewObject(title, rate, content, img_path, password);
            saveReviewToLocalStorage(newReview);
        };
        reader.readAsDataURL(photoFile);
    } else {
        const newReview = createReviewObject(title, rate, content, null, password);
        saveReviewToLocalStorage(newReview);
    }
}

function createReviewObject(title, rate, content, img_path, password) {
    const aiTripData = JSON.parse(localStorage.getItem('aiTripResult'));
    return {
        id: Date.now(),
        title: title,
        rate: rate,
        content: content,
        img_path: img_path,
        password: password,
        departure: aiTripData ? aiTripData.departure : "정보 없음",
        arrival: aiTripData ? aiTripData.recommendation.destinationName : "정보 없음",
        createdAt: new Date().toISOString(),
    };
}

function saveReviewToLocalStorage(review) {
    const reviews = JSON.parse(localStorage.getItem('savedReviews')) || [];
    reviews.unshift(review);
    localStorage.setItem('savedReviews', JSON.stringify(reviews));
    alert('리뷰가 성공적으로 등록되었습니다!');
    // 리뷰 저장 후 마이페이지로 이동
    window.location.href = '../mypage/mypage.html';
}

function setupDragAndDrop() {
    const dropZone = document.querySelector('.drop-zone');
    if (!dropZone) return;

    const photoUpload = document.getElementById('photo-upload');
    const imagePreview = document.getElementById('image-preview');
    const dropZonePrompt = document.querySelector('.drop-zone-prompt');

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            photoUpload.files = files;
            updateImagePreview();
        }
    });
    dropZone.addEventListener('click', () => { photoUpload.click(); });
    photoUpload.addEventListener('change', updateImagePreview);

    function updateImagePreview() {
        if (!imagePreview) return;
        imagePreview.innerHTML = '';
        const file = photoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                imagePreview.appendChild(img);
                if (dropZonePrompt) dropZonePrompt.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            if (dropZonePrompt) dropZonePrompt.style.display = 'flex';
        }
    }
}


// ======================================================
// ✨ 3. 목 데이터 정의 (파일 하단)
// ======================================================

// 목 데이터 1: AI 여행 일정 추천 결과
const mockAiTripResult = {
    "userKey": 12345, "departure": "청주", "departureDate": "2025-10-19",
    "companionsType": "친구", "companions": "5", "travelStyles": ["힐링", "먹방여행"],
    "budget": "2000000", "budgetUnit": "KRW",
    "recommendation": {
        "destinationName": "강릉",
        "destinationDescription": "청주에서 약 2시간 30분~3시간 거리에 위치한 강릉은 동해의 아름다운 바다와 풍부한 해산물, 그리고 고유한 문화와 카페거리까지 완벽한 힐링과 먹방 여행지입니다. 친구들과 함께 멋진 추억을 만들 수 있을 거예요.",
        "estimatedBudget": { "min": "600000", "max": "800000", "unit": "KRW" },
        "itinerary": [
            { "time": "07:00", "activity": "청주 출발", "description": "청주에서 강릉으로 출발합니다...", "transportation": "자가용 또는 렌터카" },
            { "time": "10:00", "activity": "강릉 안목해변 카페거리 도착 및 해변 산책", "description": "아름다운 동해 바다를 바라보며...", "transportation": "도보" }
        ],
        "notes": [
            "5인 이동 시 자가용 이용이 가장 편리하며...",
            "강릉은 카페와 맛집이 워낙 많으니...",
        ]
    }
};

// 목 데이터 2: 리뷰 작성용 데이터 (참고용)
const mockReviewPreset = {
    "success": true, "statusCode": 200, "message": "성공적으로 조회되었습니다.",
    "data": [
        {
            "id": 5, "rate": 4, "title": "서울 당일치기",
            "content": "혼자 미술관 투어하고 한강에서 힐링했어요.",
            "departure": "수원", "arrival": "서울",
            "companionsType": "나홀로", "companions": 1,
            "travelStyles": "미술관 탐방",
            "img_path": "https://images.unsplash.com/photo/1590152285103-6f62d8a4d7b4?q=80&w=400",
            "ai_schedule": "오전 11시 서울 도착 후 국립현대미술관으로 이동..."
        }
    ]
};