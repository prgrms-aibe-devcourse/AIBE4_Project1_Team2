// 필요한 HTML 요소들을 미리 찾아 변수에 저장합니다.
const reviewCards = document.querySelectorAll('.review-card.clickable');
const modalOverlay = document.getElementById('reviewModal');
const closeButton = modalOverlay.querySelector('.close-button');
const body = document.body;

// 모달을 여는 함수
function openModal() {
  modalOverlay.classList.add('active'); // active 클래스 추가해서 모달 보이기
  body.classList.add('modal-open'); // 배경 스크롤 막기
}

// 모달을 닫는 함수
function closeModal() {
  modalOverlay.classList.remove('active'); // active 클래스 제거해서 모달 숨기기
  body.classList.remove('modal-open'); // 배경 스크롤 복원
}

// 모든 리뷰 카드에 대해 클릭 이벤트를 추가합니다.
reviewCards.forEach(card => {
  card.addEventListener('click', () => {
    // (실제 앱에서는 여기서 card의 정보를 가져와
    // 모달 내용을 해당 리뷰 데이터로 채워줍니다.)
    openModal();
  });
});

// 닫기 버튼을 클릭하면 모달을 닫습니다.
closeButton.addEventListener('click', closeModal);

// 모달 배경(오버레이)을 클릭하면 모달을 닫습니다.
modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

// 키보드의 'Esc' 키를 눌렀을 때 모달을 닫습니다.
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});