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
    let getFinalRating = null;
    let newBase64Image = "";
    // [제거] userKey 관련 전역 변수를 사용하지 않습니다.

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
    // ----------------------------------------
    const fetchMyReviews = async () => {
        try {
            // [수정] userKey 없이 GET 방식으로 나의 리뷰 목록을 요청합니다.
            // 서버는 브라우저의 쿠키/세션을 보고 누구의 요청인지 식별해야 합니다.
            // RESTful API 컨벤션에 따라, 수정/삭제 API('/my-review/{id}')의 경로를 참고하여
            // 목록 조회 API를 '/my-review'로 가정했습니다. 백엔드 주소를 확인해주세요.
            const response = await fetch(`${API_BASE_URL}/my-review`, {
                method: 'GET'
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

        const updatedData = {
            title: modifyTitle.value,
            content: modifyContent.value,
            rate: finalRate
        };

        if (newBase64Image) {
            updatedData.img_path = newBase64Image;
        }

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
        newBase64Image = "";
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

        newBase64Image = "";

        const { review } = reviewData;

        const currentPhotoPreview = document.getElementById('currentPhotoPreview');
        currentPhotoPreview.src = review.img_path || 'default-image.jpg';

        const newImagePreviewContainer = document.getElementById('modifyImagePreview');
        newImagePreviewContainer.innerHTML = '';

        modifyReviewId.value = review.reviewId;
        modifyTitle.value = review.title;
        modifyContent.value = review.content;

        getFinalRating = createStarRating(modifyRatingContainer, review.rate);

        openModal(modifyModal);
    };

    async function refreshReviewCache() {
        const res = await fetch(`${API_BASE_URL}/reviews`); // 👈 전체 리뷰 API 호출
        if (!res.ok) throw new Error(`후기 목록 요청 실패: ${res.status}`);

        const { success, data, message } = await res.json();
        const reviews = data?.reviews ?? []; // 서버 응답 구조에 따라 reviews 배열 추출

        if (!success || !Array.isArray(reviews)) {
        throw new Error(message || "후기 데이터가 올바르지 않습니다.");
        }

        // reviews.html 페이지가 사용할 수 있도록 'reviews' 키로 localStorage에 저장
        localStorage.setItem("reviews", JSON.stringify(reviews)); 
        // myReviews는 여기서 갱신할 필요는 없지만, reviews.html에 데이터 전송을 위해 'reviews'를 사용합니다.
    }


    // =======================================================
    // #7-1. 이미지 리사이즈 및 압축 (Base64 변환) 함수
    // =======================================================
    function resizeImage(file, maxWidth = 800, maxHeight = 800) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > height && width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    } else if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL("image/jpeg", 0.7);
                    resolve(compressed);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // =======================================================
    // #7-2. 드래그 앤 드롭 및 이미지 미리보기 기능
    // =======================================================
    const setupImageUpload = (dropZoneId, inputId, previewId) => {
        const dropZone = document.getElementById(dropZoneId);
        const fileInput = document.getElementById(inputId);
        const previewContainer = document.getElementById(previewId);

        if (!dropZone || !fileInput || !previewContainer) {
            console.warn('드래그 앤 드롭 요소를 찾을 수 없습니다.');
            return;
        }

        const processAndDisplayFile = async (file) => {
            if (!file || !file.type.startsWith('image/')) return;
            try {
                const resized = await resizeImage(file);
                newBase64Image = resized;
                previewContainer.innerHTML = `
                    <img src="${resized}" alt="새 이미지 미리보기" class="preview-image">
                    <button type="button" class="remove-preview-btn">&times;</button>
                `;
            } catch (err) {
                console.error("이미지 처리 오류:", err);
                alert("이미지를 처리하는 데 문제가 발생했습니다.");
            }
        };

        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) processAndDisplayFile(file);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files?.[0];
            if (file) {
                fileInput.files = e.dataTransfer.files;
                processAndDisplayFile(file);
            }
        });

        previewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-preview-btn')) {
                fileInput.value = '';
                previewContainer.innerHTML = '';
                newBase64Image = "";
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
    // ----------------------------------------
    const loadInitialData = () => {
        const storedReviews = localStorage.getItem('myReviews');
        if (storedReviews) {
            // common.js를 통해 들어온 경우, localStorage 데이터로 렌더링
            const reviewsData = JSON.parse(storedReviews);
            myReviewsData = reviewsData;
            renderReviews(reviewsData);
            // 한 번 사용한 데이터는 삭제
            localStorage.removeItem('myReviews');
        } else {
            // 페이지를 새로고침했거나 직접 접속한 경우, 서버에 다시 요청
            fetchMyReviews();
        }
    };

    loadInitialData();
    setupImageUpload('modifyDropZone', 'modifyPhotoUpload', 'modifyImagePreview');
});