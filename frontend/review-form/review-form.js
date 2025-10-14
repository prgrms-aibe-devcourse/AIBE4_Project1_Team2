document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('.review-form-container form');

    // 폼 submit 이벤트
    form.addEventListener("submit", (event)=>{
        event.preventDefault();

        // 폼에서 입력된 값 가져오기
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const password = document.getElementById('password').value;
        const photoFile = document.getElementById('photo-upload').files[0];

        // 별접 값 가져오기
        const ratingChecked = document.querySelector('input[name="rating"]:checked');
        if(!ratingChecked) {
            alert("별점을 선택해주세요!")
            return; 
        }
        const rate = parseInt(ratingChecked.value, 10);

        // 이미지 처리
        if(photoFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img_path = e.target.result; //Base64로 인코딩된 이미지 데이터
                const newReview = createReviewObject(title, rate, content, img_path, password);
                // 완성된 객체를 localStorage에 저장
                saveReviewToLocalStorage(newReview);
            };
            reader.readAsDataURL(photoFile);
        } else {
            const newReview = createReviewObject(title, rate, content, null, password);
            saveReviewToLocalStorage(newReview);
        }
    });

    // 사진 첨부 요소
    const dropZone = document.querySelector('.drop-zone');
    const photoUpload = document.getElementById('photo-upload');
    const imagePreview = document.getElementById('image-preview');
    const dropZonePrompt = document.querySelector('.drop-zone-prompt');

    // 드래그 앤 드롭 이벤트 처리
    // 1. 드래그 중인 파일이 dropZone 위에 올라왔을 때
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault(); // 브라우저 기본 동작 방지
        dropZone.classList.add('drag-over');
    });

    // 2. 드래그 중인 파일이 dropZone을 벗어났을 때
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    // 3. 파일이 dropZone에 드롭되었을 때
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            photoUpload.files = files; // input에 파일 목록을 할당
            updateImagePreview();
        }
    });

    // dropZone을 클릭해도 파일 선택창이 뜨도록 연결
    dropZone.addEventListener('click', () => {
      photoUpload.click();
    });

    // --- 파일이 직접 선택되었을 때 미리보기 업데이트 ---
    photoUpload.addEventListener('change', updateImagePreview);

    function updateImagePreview() {
        // 이전 미리보기 삭제
        imagePreview.innerHTML = ''; 

        const file = photoUpload.files[0];
        if (file) {
            // 파일 읽기
            const reader = new FileReader();
            reader.onload = (e) => {
                // 이미지 태그 생성 및 추가
                const img = document.createElement('img');
                img.src = e.target.result;
                imagePreview.appendChild(img);
                dropZonePrompt.style.display = 'none'; // 기본 안내 문구 숨기기
            };
            reader.readAsDataURL(file);
        } else {
            dropZonePrompt.style.display = 'flex'; // 파일 없으면 기본 안내 문구 보이기
        }
    }
});

// 리뷰 데이터를 객체로 만들어주는 함수
function createReviewObject(title, rate, content, img_path, password) {
    const reviewData = {
        id: Date.now(), // 각 리뷰를 구별할 고유 ID (현재 시간으로 생성)
        title: title,
        rate: rate,
        content: content,
        img_path: img_path,
        password: password,
        createdAt: new Date().toISOString(), // 리뷰 작성 시간
    };
    return reviewData;
}

function saveReviewToLocalStorage(review) {
    const reviews = JSON.parse(localStorage.getItem('savedReviews')) || [];
    reviews.unshift(review);

    localStorage.setItem('savedReviews', JSON.stringify(reviews));

    alert('리뷰가 성공적으로 등록되었습니다!');
    window.location.href = '../mypage/mypage.html'; 
}

// 목 데이터
// ⚠️ 목 데이터
function setupMockData() {
    // 1. 제공해주신 새로운 목 데이터를 변수에 저장합니다.
    const newMockData = {
        "success": true,
        "statusCode": 200,
        "message": "성공적으로 조회되었습니다.",
        "data": [
            {
                "id": 5,
                "rate": 4,
                "title": "서울 당일치기",
                "content": "혼자 미술관 투어하고 한강에서 힐링했어요.",
                "departure": "수원",
                "arrival": "서울",
                "companionsType": "나홀로",
                "companions": 1,
                "travelStyles": "미술관 탐방",
                "img_path": "https://images.unsplash.com/photo-1590152285103-6f62d8a4d7b4?q=80&w=400", // 예시 이미지 URL
                "ai_schedule": "오전 11시 서울 도착 후 국립현대미술관으로 이동..."
            }
        ]
    };

    // 2. 새로운 데이터의 'data' 배열을 localStorage에 저장합니다.
    // 이번 예시에서는 '내 일정'과 '내 리뷰'에 동일한 데이터를 사용합니다.
    localStorage.setItem('savedItineraries', JSON.stringify(newMockData.data));
    localStorage.setItem('savedReviews', JSON.stringify(newMockData.data));
    
    // 사용자에게 저장이 완료되었음을 알림
    console.log('새로운 테스트용 데이터가 Local Storage에 성공적으로 저장되었습니다!');
}