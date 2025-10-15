// ======================================================
// ✨ 1. 코드 실행 부분
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    initAiPlanResultPage(); // AI 여행 일정 결과 초기화
    initReviewFormPage();   // 리뷰 작성 페이지 초기화
});

// ======================================================
// ✨ 2. 함수 정의
// ======================================================

// --- AI 여행 일정 결과 페이지 초기화 ---
async function initAiPlanResultPage() {
    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';
    const savedTripResult = localStorage.getItem('aiTripResult');

    if (savedTripResult) {
        console.log("✅ LocalStorage에서 일정 불러옴");
        renderSchedule(JSON.parse(savedTripResult));
        return;
    }

    try {
        // userKey를 URL 파라미터에서 가져오기 (예: plan.html?userKey=abcd1234)
        const params = new URLSearchParams(window.location.search);
        const userKey = params.get('userKey');

        if (!userKey) {
            throw new Error("userKey가 없습니다. URL에 ?userKey=값 을 추가하세요.");
        }

        console.log(`🌐 서버에서 일정 불러오는 중... /plan/${userKey}`);
        const res = await fetch(`${BASE_URL}/plan/${userKey}`);

        if (!res.ok) {
            throw new Error(`서버 응답 오류 (status: ${res.status})`);
        }

        const result = await res.json();
        const aiTripResult = result.data;

        // LocalStorage에 저장
        localStorage.setItem('aiTripResult', JSON.stringify(aiTripResult));
        renderSchedule(aiTripResult);
    } catch (error) {
        console.error('🚨 AI 일정 로딩 오류:', error);
        const mainContainer = document.querySelector('.main-content');
        if (mainContainer) {
            mainContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }
}

// --- AI 일정 결과 화면 렌더링 ---
function renderSchedule(data) {
    if (!data) return;

    console.log("🎯 렌더링할 데이터:", data);

    // 제목
    const tripTitleEl = document.getElementById('trip-title');
    if (tripTitleEl) {
        tripTitleEl.innerHTML = `
            <span class="title-black">${data.departure || '출발지'}</span> →
            <span class="highlight">${data.region || '목적지'}</span> 여행 일정
        `;
    }

    // 부가 정보
    const tripInfoEl = document.getElementById('trip-info');
    if (tripInfoEl) {
        const companionsType = data.companionsType || '동행';
        const companions = data.companions || '0';
        const styles = data.travelStyles ? data.travelStyles.join(', ') : '';
        tripInfoEl.textContent = `${companionsType} ${companions}명 | ${styles}`;
    }

    // 여행지 설명 (없을 수 있음)
    const descriptionEl = document.getElementById('destination-description');
    if (descriptionEl) {
        descriptionEl.textContent = data.total_duration
            ? `총 여행 시간: ${data.total_duration}`
            : '';
    }

    // 타임라인
    const timelineEl = document.getElementById('timeline');
    if (timelineEl) {
        timelineEl.innerHTML = '';
        if (Array.isArray(data.schedule)) {
            data.schedule.forEach(item => {
                const div = document.createElement('div');
                div.className = 'timeline-item';
                div.innerHTML = `
                    <div class="time">${item.time || ''}</div>
                    <div class="details">
                        <div class="activity">${item.activity || ''}</div>
                        <div class="description">${item.location || ''}</div>
                    </div>
                `;
                timelineEl.appendChild(div);
            });
        } else {
            timelineEl.innerHTML = '<p>일정 정보가 없습니다.</p>';
        }
    }

    // 여행 팁 (없을 수 있음)
    const notesEl = document.getElementById('trip-notes');
    if (notesEl) {
        notesEl.innerHTML = '';
        if (Array.isArray(data.notes)) {
            data.notes.forEach(note => {
                const li = document.createElement('li');
                li.textContent = note;
                notesEl.appendChild(li);
            });
        }
    }
}


// ======================================================
// ✨ 리뷰 작성 기능
// ======================================================

function initReviewFormPage() {
    const form = document.querySelector('#reviewForm');
    if (!form) return;
    form.addEventListener("submit", handleReviewSubmit);
    setupDragAndDrop();
}

async function handleReviewSubmit(event) {
    event.preventDefault();

    const title = document.querySelector('#review-title')?.value.trim();
    const rate = document.querySelector('#review-rate')?.value.trim();
    const content = document.querySelector('#review-content')?.value.trim();
    const password = document.querySelector('#review-password')?.value.trim();
    const photoFile = document.querySelector('#photo-upload')?.files[0];

    if (!title || !rate || !content || !password) {
        alert("모든 필드를 입력해주세요!");
        return;
    }

    const aiTripData = JSON.parse(localStorage.getItem('aiTripResult'));
    const userKey = aiTripData?.userKey;

    if (!userKey) {
        alert("⚠️ 여행 일정 정보가 없습니다. 다시 시도해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append("userKey", userKey);
    formData.append("title", title);
    formData.append("rate", rate);
    formData.append("content", content);
    formData.append("password", password);
    formData.append("departure", aiTripData.departure);
    formData.append("arrival", aiTripData.recommendation.destinationName);
    if (photoFile) formData.append("img_file", photoFile);

    const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

    try {
        console.log(`🚀 리뷰 등록 요청 → /mypage/${userKey}/review`);
        const res = await fetch(`${BASE_URL}/mypage/${userKey}/review`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`리뷰 등록 실패 (status: ${res.status}, 내용: ${errText})`);
        }

        alert("🎉 리뷰가 성공적으로 등록되었습니다!");
        window.location.href = '../my-reviews/my-reviews.html';
    } catch (error) {
        console.error("리뷰 등록 중 오류:", error);
        alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    }
}

// ======================================================
// ✨ 파일 드래그 & 드롭
// ======================================================
function setupDragAndDrop() {
    const dropZone = document.querySelector('.drop-zone');
    if (!dropZone) return;

    const photoUpload = document.getElementById('photo-upload');
    const imagePreview = document.getElementById('image-preview');
    const dropZonePrompt = document.querySelector('.drop-zone-prompt');

    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            photoUpload.files = files;
            updateImagePreview();
        }
    });
    dropZone.addEventListener('click', () => photoUpload.click());
    photoUpload.addEventListener('change', updateImagePreview);

    function updateImagePreview() {
        if (!imagePreview) return;
        imagePreview.innerHTML = '';
        const file = photoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
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
