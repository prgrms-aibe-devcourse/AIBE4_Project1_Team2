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
async function initAiPlanResultPage() {
    // 1️⃣ 먼저 Local Storage에서 데이터 확인
    const savedTripResult = localStorage.getItem('aiTripResult');
    if (savedTripResult) {
        console.log("✅ Local Storage에서 AI 여행 일정 데이터 불러옴");
        const aiTripResult = JSON.parse(savedTripResult);
        renderSchedule(aiTripResult); // 저장된 데이터로 화면 렌더링
        return; // 함수 종료
    }
    
    // 2️⃣ Local Storage에 데이터가 없으면 서버에 요청 (오류가 발생하는 경우에만)
    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';
    
    try {
        // 서버에서 AI 생성 여행 일정 데이터를 GET 요청으로 받아옵니다.
        // 서버의 올바른 API 엔드포인트로 변경하세요. (예: /plan/1234)
        // 현재 `/plan` 엔드포인트가 없으므로 404 에러가 발생합니다.
        const res = await fetch(`${BASE_URL}/plan`); // ⚠️ 이 URL이 올바른지 다시 확인해야 합니다. 
        if (!res.ok) {
            throw new Error(`AI 여행 일정을 불러오는 데 실패했습니다. (상태 코드: ${res.status})`);
        }

        const result = await res.json();
        const aiTripResult = result.data; // 서버 응답의 data 필드에 실제 데이터가 있다고 가정
        
        // 받아온 데이터를 Local Storage에 저장
        localStorage.setItem('aiTripResult', JSON.stringify(aiTripResult));
        
        // 화면에 렌더링
        renderSchedule(aiTripResult);

    } catch (error) {
        console.error('AI 일정 로딩 중 오류 발생:', error);
        // 사용자에게 오류 메시지 표시
        const mainContainer = document.querySelector('.main-content');
        if (mainContainer) {
            mainContainer.innerHTML = '<p class="error-message">여행 일정을 불러오는 데 문제가 발생했습니다. 다시 시도해주세요.</p>';
        }
    }
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
async function handleReviewSubmit(event) {
    // ... (기존 코드)

    const aiTripData = JSON.parse(localStorage.getItem('aiTripResult'));
    const userKey = aiTripData ? aiTripData.userKey : null;
    
    // 이전에 planId를 userKey로 변경했기 때문에 planId 변수 대신 userKey 변수를 사용했습니다.
    if (!userKey) {
        alert("여행 일정 정보가 없어 리뷰를 저장할 수 없습니다.");
        return;
    }

    // 2. FormData 객체를 사용하여 이미지 파일과 데이터를 함께 전송 준비
    const formData = new FormData();
    // ⚠️ 수정 시작: userKey를 formData에 명시적으로 추가
    formData.append("userKey", userKey);
    // ⚠️ 수정 끝
    formData.append("title", title);
    formData.append("rate", rate);
    formData.append("content", content);
    formData.append("password", password);
    formData.append("departure", aiTripData.departure);
    formData.append("arrival", aiTripData.recommendation.destinationName);
    
    if (photoFile) {
        // 파일이 있을 경우 formData에 추가
        formData.append("img_file", photoFile);
    }

    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';
    
    try {
        // 3. 서버에 POST 요청 보내기
        const res = await fetch(`${BASE_URL}/mypage/${planId}/review`, {
            method: 'POST',
            body: formData, // FormData를 body로 보냅니다.
            // FormData 사용 시 'Content-Type' 헤더는 자동으로 설정됩니다.
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`리뷰 등록에 실패했습니다. (상태 코드: ${res.status}, 에러: ${errorText})`);
        }

        alert('리뷰가 성공적으로 등록되었습니다!');
        // 리뷰 저장 후 마이페이지로 이동
        window.location.href = '../mypage/mypage.html';
        
    } catch (error) {
        console.error('리뷰 등록 중 오류 발생:', error);
        alert('리뷰 등록 중 문제가 발생했습니다. 다시 시도해주세요.');
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