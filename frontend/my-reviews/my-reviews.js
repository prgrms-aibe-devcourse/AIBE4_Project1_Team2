document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------
    // #1. 전역 변수 및 DOM 요소 선택
    // ----------------------------------------
    const reviewList = document.querySelector('.review-list');
    const paginationContainer = document.querySelector('.pagination');

    // 상세 보기 모달 요소
    const reviewModal = document.getElementById('reviewModal');
    const modalReviewTitle = document.getElementById('modalReviewTitle');
    const modalReviewAuthor = document.getElementById('modalReviewAuthor'); // 출발지-도착지로 대체
    const modalReviewRating = document.getElementById('modalReviewRating');
    const modalReviewPhoto = document.getElementById('modalReviewPhoto');
    const modalReviewContent = document.getElementById('modalReviewContent');

    // 수정 모달 요소
    const modifyModal = document.getElementById('modifyModal');
    const modifyForm = document.getElementById('modifyForm');
    const modifyReviewId = document.getElementById('modifyReviewId');
    const modifyTitle = document.getElementById('modifyTitle');
    const modifyRatingContainer = document.getElementById('modifyRating');
    const modifyContent = document.getElementById('modifyContent');
    const modifyPassword = document.getElementById('modifyPassword');
    // TODO: 이미지 업로드 관련 요소 추가

    const closeButtons = document.querySelectorAll('.close-button');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    // API 기본 URL (실제 서버 주소로 변경해야 합니다)
    const API_BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com'; 

    // 임시 데이터 저장소 (API 호출 결과를 저장하여 불필요한 호출을 줄임)
    let myReviewsData = [];

    // ----------------------------------------
    // #2. 데이터 화면 렌더링 (Data Rendering)
    // ----------------------------------------
    const renderReviews = (reviews) => {
        reviewList.innerHTML = ''; // 기존 목록 초기화

        if (!reviews || reviews.length === 0) {
            reviewList.innerHTML = '<p class="no-reviews">작성한 리뷰가 없습니다.</p>';
            return;
        }

        reviews.forEach(item => {
            const review = item.review;
            const card = document.createElement('div');
            card.className = 'review-card';
            card.dataset.reviewId = review.reviewId; // 데이터 속성에 ID 저장

            // 별점 HTML 생성
            let stars = '';
            for (let i = 0; i < 5; i++) {
                stars += i < review.rate ? '★' : '☆';
            }

            card.innerHTML = `
                <img src="${review.img_path || 'default-image.jpg'}" alt="${review.title}" class="review-thumbnail">
                <div class="review-card-content">
                    <h3 class="review-card-title">${review.title}</h3>
                    <p class="review-card-destination">${item.departure} → ${item.destinationName}</p>
                    <div class="review-card-rating">${stars}</div>
                    <p class="review-card-excerpt">${review.content.substring(0, 50)}...</p>
                    <div class="review-card-actions">
                        <button class="modify-btn" data-review-id="${review.reviewId}">수정</button>
                        <button class="delete-btn" data-review-id="${review.reviewId}">삭제</button>
                    </div>
                </div>
            `;
            reviewList.appendChild(card);
        });
    };

    // ----------------------------------------
    // #3. 내가 작성한 후기 조회 (Read Reviews)
    // ----------------------------------------
    const fetchMyReviews = async () => {
        // 실제 API 통신 시에는 JWT 토큰 등을 헤더에 담아 보내야 합니다.
        const headers = {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') // 예시
        };

        try {
            const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                method: 'POST', 
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                myReviewsData = result.data; // 전체 데이터 저장
                renderReviews(myReviewsData);
            } else {
                alert(result.message || '리뷰를 불러오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('리뷰 조회 중 오류 발생:', error);
            alert('리뷰를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    // ----------------------------------------
    // #4. 내가 작성한 후기 수정 (Update Review)
    // ----------------------------------------
    const handleModifySubmit = async (event) => {
        event.preventDefault(); // 폼 기본 제출 동작 방지

        const reviewId = modifyReviewId.value;
        // TODO: 별점, 이미지 파일 등 수정된 데이터 가져오는 로직 
        const updatedData = {
            title: modifyTitle.value,
            content: modifyContent.value,
            rate: 3,
            password: modifyPassword.value,
            // img_path: ... // 이미지 파일은 FormData를 사용해야 합니다.
        };

        const headers = {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        };
        
        try {
            // API 명세서에 수정(PUT/PATCH) 엔드포인트가 없어 임의로 지정했습니다. 확인 후 수정해주세요.
            const response = await fetch(`${API_BASE_URL}/my-review/${reviewId}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
            alert('리뷰 수정 중 문제가 발생했습니다.');
        }
    };
    
    // ----------------------------------------
    // #5. 내가 작성한 후기 삭제 (Delete Review)
    // ----------------------------------------
    const handleDeleteReview = async (reviewId) => {
        if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        };

        try {
            const response = await fetch(`${API_BASE_URL}/my-review/${reviewId}`, {
                method: 'DELETE',
                headers: headers
            });
            
            if (!response.ok) {
                // 404 Not Found, 403 Forbidden 등 다양한 실패 케이스를 고려할 수 있습니다.
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // DELETE 요청은 성공 시 body가 비어있는 경우가 많습니다. (204 No Content)
            // 성공 여부만 판단합니다.
            alert('리뷰가 삭제되었습니다.');
            fetchMyReviews(); // 목록 새로고침

        } catch (error) {
            console.error('리뷰 삭제 중 오류 발생:', error);
            alert(`리뷰 삭제에 실패했습니다: ${error.message}`);
        }
    };

    // ----------------------------------------
    // #6. 모달 관련 기능 (Modal Functions)
    // ----------------------------------------
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';

    // 상세 보기 모달 채우기
    const populateReviewModal = (reviewId) => {
        const reviewData = myReviewsData.find(item => item.review.reviewId === reviewId);
        if (!reviewData) return;

        const { review, departure, destinationName } = reviewData;

        modalReviewTitle.textContent = review.title;
        modalReviewAuthor.textContent = `${departure} → ${destinationName}`;
        modalReviewPhoto.src = review.img_path || 'default-image.jpg';
        modalReviewContent.textContent = review.content;

        // 별점 표시
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < review.rate ? '★' : '☆';
        }
        modalReviewRating.textContent = stars;

        openModal(reviewModal);
    };

    // 수정 모달 채우기
    const populateModifyModal = (reviewId) => {
        const reviewData = myReviewsData.find(item => item.review.reviewId === reviewId);
        if (!reviewData) return;

        const { review } = reviewData;

        modifyReviewId.value = review.reviewId;
        modifyTitle.value = review.title;
        modifyContent.value = review.content;
        // TODO: 기존 별점, 이미지 미리보기를 채우는 로직 추가

        openModal(modifyModal);
    };

    // ----------------------------------------
    // #7. 이벤트 리스너 연결 (Event Listeners)
    // ----------------------------------------
    // 리뷰 목록에 이벤트 위임(Event Delegation) 설정
    reviewList.addEventListener('click', (event) => {
        const target = event.target;
        
        // closest 메서드를 사용하여 클릭된 요소가 어떤 버튼에 속하는지 확인
        const modifyButton = target.closest('.modify-btn');
        const deleteButton = target.closest('.delete-btn');
        const reviewCard = target.closest('.review-card');

        if (modifyButton) {
            const reviewId = parseInt(modifyButton.dataset.reviewId, 10);
            populateModifyModal(reviewId);
            return;
        }

        if (deleteButton) {
            const reviewId = parseInt(deleteButton.dataset.reviewId, 10);
            handleDeleteReview(reviewId);
            return;
        }

        if (reviewCard) {
            // 버튼 클릭이 아닐 때만 상세 보기 모달 열기
            const reviewId = parseInt(reviewCard.dataset.reviewId, 10);
            populateReviewModal(reviewId);
        }
    });
    
    // 수정 폼 제출 이벤트
    modifyForm.addEventListener('submit', handleModifySubmit);

    // 모든 닫기 버튼에 이벤트 리스너 추가
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.closest('.modal-overlay'));
        });
    });

    // 모달 외부 클릭 시 닫기
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) { // 모달 콘텐츠가 아닌 오버레이 부분을 클릭했을 때
                closeModal(overlay);
            }
        });
    });

    // ----------------------------------------
    // #8. 초기 데이터 로드 (Initial Load)
    // ----------------------------------------
    fetchMyReviews();
});