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
    const modifyPassword = document.getElementById('modifyPassword');
    
    const closeButtons = document.querySelectorAll('.close-button');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    // API 기본 URL
    const API_BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com'; 

    // 전역 데이터 저장소
    let myReviewsData = [];
    let currentUserKey = null; // [코드 개선] 사용자 고유번호를 저장할 변수 추가
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
    // [코드 개선] 고유번호를 한 번만 묻도록 로직 수정
    // ----------------------------------------
    const fetchMyReviews = async () => {
        // currentUserKey가 없으면 사용자에게 물어보고 저장
        if (!currentUserKey) {
            const userKey = prompt("리뷰를 조회할 고유번호를 입력해주세요.");
            if (!userKey) {
                reviewList.innerHTML = '<p class="no-reviews">고유번호가 입력되지 않아 리뷰를 조회할 수 없습니다.</p>';
                return;
            }
            currentUserKey = userKey; // 입력받은 고유번호를 변수에 저장
        }

        try {
            const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userKey: currentUserKey }) // 저장된 고유번호 사용
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
                currentUserKey = null; // [코드 개선] 실패 시 고유번호 초기화하여 다시 입력받도록 함
            }
        } catch (error) {
            console.error('리뷰 조회 중 오류 발생:', error);
            alert('리뷰를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
        
        return () => newRating;
    };

    // ----------------------------------------
    // #5. 내가 작성한 후기 수정 (Update Review)
    // ----------------------------------------
   const handleModifySubmit = async (event) => {
    event.preventDefault();
    
    const reviewId = modifyReviewId.value;
    const finalRate = getFinalRating ? getFinalRating() : null;
    const userKeyForModification = currentUserKey; // 💡 1. 전역 변수에서 userKey 가져오기

    if (finalRate === null) {
        alert('별점을 선택해주세요.');
        return;
    }

    // 💡 2. 혹시 모를 예외 처리: 고유번호가 없는 경우
    if (!userKeyForModification) {
        alert("사용자 고유번호를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.");
        return;
    }

    // 💡 3. FormData 대신, 서버가 이해하기 쉬운 일반 JavaScript 객체(JSON)로 데이터를 만듭니다.
    const updatedData = {
        title: modifyTitle.value,
        content: modifyContent.value,
        rate: finalRate,
        userKey: userKeyForModification // 'password' 대신 'userKey'를 사용 (백엔드와 확인 필요!)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, { // 명세서 확인 필요!!
            method: 'PUT', 
            // 💡 4. 우리가 보내는 데이터가 JSON 형식임을 서버에 알려줍니다.
            headers: {
                'Content-Type': 'application/json',
            },
            // 💡 5. JavaScript 객체를 JSON 문자열로 변환하여 body에 담아 전송합니다.
            body: JSON.stringify(updatedData),
        });

        const result = await response.json();

        if (result.success) {
            alert('리뷰가 성공적으로 수정되었습니다.');
            closeModal(modifyModal);
            fetchMyReviews(); 
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
            // DELETE 대신 POST 메서드를 사용하고,
            const response = await fetch(`${API_BASE_URL}/my-review/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.success) {
                alert('리뷰가 삭제되었습니다.');
                fetchMyReviews(); 
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
        modifyReviewId.value = review.reviewId;
        modifyTitle.value = review.title;
        modifyContent.value = review.content;
        
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
});