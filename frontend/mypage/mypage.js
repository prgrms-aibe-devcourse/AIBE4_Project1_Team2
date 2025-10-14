// 1. 필요한 HTML 요소들을 모두 선택합니다.
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const deleteBtn = document.querySelectorAll(".delete-button");

// 2. 모든 탭 버튼에 대해 클릭 이벤트를 추가합니다.
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 3. 클릭된 버튼에서 data-tab 값을 가져옵니다. (예: "itinerary")
        const tabId = button.dataset.tab;

        // 4. 모든 버튼과 콘텐츠에서 'active' 클래스를 제거하여 비활성화합니다.
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 5. 클릭된 버튼과 그에 맞는 콘텐츠에만 'active' 클래스를 추가합니다.
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

deleteBtn.forEach(button => {
    button.addEventListener("click", (event) => {
        const confirmAlert = confirm("정말로 이 일정을 삭제하시겠습니까?");

        if(confirmAlert) {
            const itemToDelete = event.currentTarget.closest(".itinerary-card, .review-item");

            if(itemToDelete) {
                itemToDelete.remove();
            }
        }
    })
});