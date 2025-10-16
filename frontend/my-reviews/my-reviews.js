document.addEventListener('DOMContentLoaded', () => {
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
    const modifyPassword = document.getElementById('modifyPassword');
    
    const closeButtons = document.querySelectorAll('.close-button');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    // API 기본 URL (실제 운영 서버 주소로 확인 필요)
    const API_BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com'; 

    // 전역 데이터 저장소
    let myReviewsData = [];
    // 수정 시 최종 별점 값을 가져오기 위한 함수 스코프 변수
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
    // ----------------------------------------
    const fetchMyReviews = async () => {
        // 실제 서버 API 호출 로직
        const headers = {
            'Content-Type': 'application/json',
            // TODO: 실제 로그인 기능 구현 시, 토큰 추가 필요
            // 'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        };

        try {
            // サーバーの `reviews/my-reviews` エンドポイントに POST リクエストを送信します。
            const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                method: 'POST', // API 명세에 따라 GET 또는 POST로 변경
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                myReviewsData = result.data; // 서버에서 받은 데이터 저장
                renderReviews(myReviewsData);
            } else {
                alert(result.message || '리뷰를 불러오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('리뷰 조회 중 오류 발생:', error);
            alert('리뷰를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            // 에러 발생 시 샘플 UI를 보여주지 않도록 목록을 비워줍니다.
            reviewList.innerHTML = '<p class="no-reviews">리뷰를 불러올 수 없습니다.</p>';
        }
    };

    // =======================================================
    // #4. [수정] 수정 모달을 위한 별점 생성 및 이벤트 처리 함수
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
        
        return () => newRating; // 현재 선택된 별점 값을 반환하는 함수를 리턴
    };

    // ----------------------------------------
    // #5. 내가 작성한 후기 수정 (Update Review)
    // ----------------------------------------
    const handleModifySubmit = async (event) => {
        event.preventDefault();
        
        const reviewId = modifyReviewId.value;
        const finalRate = getFinalRating ? getFinalRating() : null; // 최종 별점 값 가져오기

        if (finalRate === null) {
            alert('별점을 선택해주세요.');
            return;
        }

        const updatedData = new FormData();
        updatedData.append('title', modifyTitle.value);
        updatedData.append('content', modifyContent.value);
        updatedData.append('rate', finalRate);
        updatedData.append('password', modifyPassword.value);
        // TODO: 이미지 파일이 있다면 추가 -> updatedData.append('image', fileInput.files[0]);

        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'PUT', // 또는 'PATCH'
                // FormData 사용 시 Content-Type은 브라우저가 자동으로 설정하므로 헤더에서 제외합니다.
                body: updatedData,
            });

            const result = await response.json();

            if (result.success) {
                alert('리뷰가 성공적으로 수정되었습니다.');
                closeModal(modifyModal);
                fetchMyReviews(); // 목록 새로고침
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
        
        // TODO: 삭제 시에도 비밀번호를 입력받는 UI가 필요하다면 추가 구현
        const password = prompt("리뷰 삭제를 위해 비밀번호를 입력하세요:");
        if (!password) {
            alert("삭제가 취소되었습니다.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password }),
            });

            const result = await response.json();

            if (result.success) {
                alert('리뷰가 삭제되었습니다.');
                fetchMyReviews(); // 목록 새로고침
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
        const reviewData = myReviewsData.find(item => item.review.reviewId === reviewId);
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
        const reviewData = myReviewsData.find(item => item.review.reviewId === reviewId);
        if (!reviewData) return;

        const { review } = reviewData;
        modifyReviewId.value = review.reviewId;
        modifyTitle.value = review.title;
        modifyContent.value = review.content;
        
        // 수정 모달이 열릴 때마다 별점 생성 함수를 호출하고,
        // 그 리턴값(최종 별점을 가져오는 함수)을 전역 변수에 할당
        getFinalRating = createStarRating(modifyRatingContainer, review.rate);
        
        openModal(modifyModal);
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
    fetchMyReviews();
});