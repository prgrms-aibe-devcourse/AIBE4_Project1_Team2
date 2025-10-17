document.addEventListener('DOMContentLoaded', () => {
    const getReviewById = (reviewId) => {
        return myReviewsData.find(item => item.review.reviewId === reviewId);
    };
    // ----------------------------------------
    // #1. 전역 변수 및 DOM 요소 선택
    // ----------------------------------------
    const reviewList = document.querySelector('.review-list');
    
    // 모달 요소들
    const reviewModal = document.getElementById('reviewModal');
    const modalReviewTitle = document.getElementById('modalReviewTitle');
    const modalReviewAuthor = document.getElementById('modalReviewAuthor');
    const modalReviewRating = document.getElementById('modalReviewRating');
    const modalReviewPhoto = document.getElementById('modalReviewPhoto');
    const modalReviewContent = document.getElementById('modalReviewContent');

    const modifyModal = document.getElementById('modifyModal');
    const modifyForm = document.getElementById('modifyForm');
    const modifyReviewId = document.getElementById('modifyReviewId');
    const modifyTitle = document.getElementById('modifyTitle');
    const modifyRatingContainer = document.getElementById('modifyRating');
    const modifyContent = document.getElementById('modifyContent');
    
    const closeButtons = document.querySelectorAll('.close-button');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    // API 기본 URL
    const API_BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com'; 

    // 전역 데이터 저장소
    let myReviewsData = [];
    // let currentUserKey = null; // [삭제] 고유키 저장을 위한 변수 삭제
    let getFinalRating = null;

    // ----------------------------------------
    // #2. 데이터 화면 렌더링 (Data Rendering)
    // ----------------------------------------
    const renderReviews = (reviews) => {
        reviewList.innerHTML = '';
        if (!reviews || reviews.length === 0) {
            reviewList.innerHTML = '<p class="no-reviews">작성한 리뷰가 없습니다.</p>';
            return;
        }

        reviews.forEach(item => {
            const review = item.review;
            const card = document.createElement('div');
            card.className = 'review-item clickable'; 
            card.dataset.reviewId = review.reviewId;

            let stars = '★'.repeat(review.rate) + '☆'.repeat(5 - review.rate);
            
            card.innerHTML = `
                <img src="${review.img_path || 'default-image.jpg'}" alt="${review.title}" class="review-photo">
                <div class="review-details">
                    <h3>${review.title}</h3>
                    <p>${item.departure} → ${item.destinationName}</p>
                    <div class="star-rating-display">${stars}</div>
                </div>
                <div class="reviewBtn-group">
                    <button class="reviewModifyBtn" data-review-id="${review.reviewId}">수정</button>
                    <button class="deleteModifyBtn" data-review-id="${review.reviewId}">삭제</button>
                </div>
            `;
            reviewList.appendChild(card);
        });
    };

    // ----------------------------------------
    // #3. 내가 작성한 후기 조회 (Read Reviews)
    // [수정] 고유키 입력 로직 전체 삭제 및 fetch 방식 변경
    // ----------------------------------------
    const fetchMyReviews = async () => {
        try {
            // [수정] GET 방식으로 변경하고, body와 headers 일부를 제거
            const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                method: 'GET' // 'POST'에서 'GET'으로 변경
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                myReviewsData = result.data;
                renderReviews(myReviewsData);
            } else {
                alert(result.message || '리뷰를 불러오는 데 실패했습니다.');
                reviewList.innerHTML = '<p class="no-reviews">리뷰를 불러올 수 없습니다.</p>';
            }
        } catch (error) {
            console.error('리뷰 조회 중 오류 발생:', error);
            alert('리뷰를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            reviewList.innerHTML = '<p class="no-reviews">리뷰를 불러올 수 없습니다.</p>';
        }
    };

    // =======================================================
    // #4. 수정 모달을 위한 별점 생성 및 이벤트 처리 함수
    // =======================================================
    const createStarRating = (container, currentRating) => {
        container.innerHTML = '';
        let newRating = currentRating;

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.innerHTML = '★';
            star.dataset.value = i;
            if (i <= currentRating) {
                star.classList.add('selected');
            }
            container.appendChild(star);
        }

        container.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                newRating = parseInt(e.target.dataset.value, 10);
                const stars = container.querySelectorAll('span');
                stars.forEach(star => {
                    star.classList.toggle('selected', parseInt(star.dataset.value, 10) <= newRating);
                });
            }
        });
        
        return () => newRating;
    };

    // ----------------------------------------
    // #5. 내가 작성한 후기 수정 (Update Review)
    // ----------------------------------------
   const handleModifySubmit = async (event) => {
    event.preventDefault();
    
    const reviewId = modifyReviewId.value;
    const finalRate = getFinalRating ? getFinalRating() : null;

    if (finalRate === null) {
        alert('별점을 선택해주세요.');
        return;
    }

    // [수정] updatedData에서 userKey 속성 제거
    const updatedData = {
        title: modifyTitle.value,
        content: modifyContent.value,
        rate: finalRate
        // userKey: userKeyForModification // [삭제]
    };

    try {
        const response = await fetch(`${API_BASE_URL}/my-review/${reviewId}`, {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        const result = await response.json();

        if (result.success) {
            alert('리뷰가 성공적으로 수정되었습니다.');
            closeModal(modifyModal);
            await refreshReviewCache(); 
            
            window.location.href = "../reviews/reviews.html";
        } else {
            alert(result.message || '리뷰 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('리뷰 수정 중 오류 발생:', error);
        alert('리뷰 수정 중 오류가 발생했습니다.');
    }
};
    
    // ----------------------------------------
    // #6. 내가 작성한 후기 삭제 (Delete Review)
    // ----------------------------------------
    const handleDeleteReview = async (reviewId) => {
        if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/my-review/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json' 
                },
            });

            const result = await response.json();

            if (result.success) {
                alert('리뷰가 삭제되었습니다.');
                await refreshReviewCache(); 
            
                window.location.href = "../reviews/reviews.html";
            } else {
                alert(result.message || '리뷰 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('리뷰 삭제 중 오류 발생:', error);
            alert('리뷰 삭제 중 오류가 발생했습니다.');
        }
    };
    // ----------------------------------------
    // #7. 모달 관련 기능 (Modal Functions)
    // ----------------------------------------
    const openModal = (modal) => {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    };
    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    };

    const populateReviewModal = (reviewId) => {
        const reviewData = getReviewById(reviewId);
        if (!reviewData) return;

        const { review, departure, destinationName } = reviewData;
        modalReviewTitle.textContent = review.title;
        modalReviewAuthor.textContent = `${departure} → ${destinationName}`;
        modalReviewPhoto.src = review.img_path || 'default-image.jpg';
        modalReviewContent.textContent = review.content;
        modalReviewRating.textContent = '★'.repeat(review.rate) + '☆'.repeat(5 - review.rate);

        openModal(reviewModal);
    };

    const populateModifyModal = (reviewId) => {
        const reviewData = getReviewById(reviewId);
        if (!reviewData) return;

        const { review } = reviewData;
        const currentPhotoPreview = document.getElementById('currentPhotoPreview');
        currentPhotoPreview.src = review.img_path || 'default-image.jpg';
        modifyReviewId.value = review.reviewId;
        modifyTitle.value = review.title;
        modifyContent.value = review.content;
        
        getFinalRating = createStarRating(modifyRatingContainer, review.rate);
        
        openModal(modifyModal);
    };

    async function refreshReviewCache() {
        const res = await fetch(`${API_BASE_URL}/reviews`);
        if (!res.ok) throw new Error(`후기 목록 요청 실패: ${res.status}`);

        const { success, data, message } = await res.json();
        const reviews = data?.reviews ?? [];

        if (!success || !Array.isArray(reviews)) {
        throw new Error(message || "후기 데이터가 올바르지 않습니다.");
        }

        // reviews.html이 읽을 수 있도록 localStorage에 전체 리뷰 목록 저장
        localStorage.setItem("reviews", JSON.stringify(reviews)); 
    }

    // =======================================================
    // #7-1. [추가] 드래그 앤 드롭 및 이미지 미리보기 기능
    // =======================================================
    const setupImageUpload = (dropZoneId, inputId, previewId) => {
        const dropZone = document.getElementById(dropZoneId);
        const fileInput = document.getElementById(inputId);
        const previewContainer = document.getElementById(previewId);
        const promptElement = dropZone.querySelector('.drop-zone-prompt');

        if (!dropZone || !fileInput || !previewContainer) {
            console.warn('드래그 앤 드롭 요소를 찾을 수 없습니다.');
            return;
        }

        // --- 이벤트 핸들러 함수들 ---
        const handleFileSelect = (file) => {
            if (!file || !file.type.startsWith('image/')) return;

            promptElement.style.display = 'none';

            const reader = new FileReader();
            reader.onload = (e) => {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="미리보기 이미지" class="preview-image">
                    <button type="button" class="remove-preview-btn">&times;</button>
                `;
            };
            reader.readAsDataURL(file);
        };

        // --- 이벤트 리스너 연결 ---

        // 1. Drop Zone 클릭 시 파일 선택창 열기
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // 2. 파일 입력(input) 변경 시 미리보기 표시
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFileSelect(fileInput.files[0]);
            }
        });

        // 3. 드래그 오버(dragover): 드롭을 허용하도록 기본 동작 방지
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        // 4. 드래그 이탈(dragleave): 하이라이트 효과 제거
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        // 5. 드롭(drop): 파일 처리
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files; // input에 파일 정보 할당
                handleFileSelect(files[0]); // 미리보기 표시
            }
        });

        // 6. 미리보기 이미지 삭제
        previewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-preview-btn')) {
                fileInput.value = ''; // input의 파일 정보 초기화
                previewContainer.innerHTML = ''; // 미리보기 삭제

                promptElement.style.display = 'flex';
            }
        });
    };

    // ----------------------------------------
    // #8. 이벤트 리스너 연결 (Event Listeners)
    // ----------------------------------------
    reviewList.addEventListener('click', (event) => {
        const target = event.target;
        const modifyButton = target.closest('.reviewModifyBtn');
        const deleteButton = target.closest('.deleteModifyBtn');
        const reviewCard = target.closest('.review-item.clickable');

        if (modifyButton) {
            event.stopPropagation(); 
            const reviewId = parseInt(modifyButton.closest('.review-item').dataset.reviewId, 10);
            populateModifyModal(reviewId);
            return;
        }
        if (deleteButton) {
            event.stopPropagation();
            const reviewId = parseInt(deleteButton.closest('.review-item').dataset.reviewId, 10);
            handleDeleteReview(reviewId);
            return;
        }
        if (reviewCard) {
            const reviewId = parseInt(reviewCard.dataset.reviewId, 10);
            populateReviewModal(reviewId);
        }
    });
    
    modifyForm.addEventListener('submit', handleModifySubmit);

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.closest('.modal-overlay'));
        });
    });

    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    // ----------------------------------------
    // #9. 초기 데이터 로드 (Initial Load)
    // [코드 변경] 초기 로드 로직을 함수로 분리하고 수정
    // ----------------------------------------
    const loadInitialReviews = () => {
        const storedReviews = localStorage.getItem('myReviews');
        if (storedReviews) {
            // 로컬 스토리지에 데이터가 있으면 파싱해서 화면에 렌더링
            const reviewsData = JSON.parse(storedReviews);
            myReviewsData = reviewsData; // 전역 변수에도 할당
            renderReviews(reviewsData);
            // 한 번 사용한 데이터는 삭제하여 다음 접속 시 최신 데이터를 받도록 함
            localStorage.removeItem('myReviews');
        } else {
            // 로컬 스토리지에 데이터가 없으면 서버에 요청
            fetchMyReviews();
        }
    };

    loadInitialReviews(); // 수정한 초기 로드 함수 호출
    setupImageUpload('modifyDropZone', 'modifyPhotoUpload', 'modifyImagePreview');
});