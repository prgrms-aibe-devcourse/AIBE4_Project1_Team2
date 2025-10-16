document.addEventListener("DOMContentLoaded", () => {
  /* ======================================================
     1. 요소 참조 및 전역 변수
  ====================================================== */
  const form = document.getElementById("reviewForm");
  const stars = document.querySelectorAll(".star");
  const ratingInput = document.getElementById("reviewRating");
  const fileInput = document.getElementById("reviewImage");
  const dropzone = document.getElementById("dropzone");
  const preview = document.getElementById("preview");
  const instruction = document.getElementById("dz-instruction");

  const API_BASE_URL = "https://aibe4-project1-team2-m9vr.onrender.com";
  let base64Image = "";

  /* ======================================================
     2. 별점 선택 기능
  ====================================================== */
  stars.forEach((star) => {
    star.addEventListener("click", (e) => {
      e.preventDefault();
      const value = Number(star.dataset.value);
      ratingInput.value = value;

      stars.forEach((s) =>
        s.classList.toggle("active", Number(s.dataset.value) <= value)
      );
    });
  });

  /* ======================================================
     3. 파일 업로드 & 드래그 미리보기
  ====================================================== */
  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFileSelect);

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--main-yellow)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "#ddd";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  });

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  }

  /* ======================================================
     4. 이미지 리사이즈 및 압축 (Base64 변환)
  ====================================================== */
  async function processFile(file) {
    try {
      const resized = await resizeImage(file);
      base64Image = resized;
      preview.src = resized;
      preview.style.display = "block";
      instruction.style.display = "none";
    } catch (err) {
      console.error("이미지 처리 오류:", err);
      alert("이미지를 불러오는데 문제가 발생했습니다.");
    }
  }

  function resizeImage(file, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // 비율 유지하며 리사이즈
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

  /* ======================================================
     5. 폼 제출 처리
  ====================================================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const planId = localStorage.getItem("selectedPlanId");
    const title = form.reviewTitle.value.trim();
    const content = form.reviewContent.value.trim();
    const rating = ratingInput.value;

    if (!title || !content || !rating || !base64Image || !planId) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const reviewData = {
      planId: Number(planId),
      rate: Number(rating),
      title,
      content,
      img_path: base64Image,
    };

    try {
      await submitReview(reviewData);
      await refreshReviewCache();

      alert("후기가 성공적으로 등록되었습니다!");
      resetForm();
      window.location.href = "../reviews/reviews.html";
    } catch (error) {
      console.error("후기 등록 실패:", error);
      alert("서버 요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  });

  /* ======================================================
     6. 서버 통신 함수
  ====================================================== */
  async function submitReview(data) {
    const res = await fetch(`${API_BASE_URL}/my-review/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || "후기 등록 중 오류 발생");
    }
  }

  async function refreshReviewCache() {
    const res = await fetch(`${API_BASE_URL}/reviews`);
    if (!res.ok) throw new Error(`후기 목록 요청 실패: ${res.status}`);

    const { success, data, message } = await res.json();
    const reviews = data?.reviews ?? [];

    if (!success || !Array.isArray(reviews)) {
      throw new Error(message || "후기 데이터가 올바르지 않습니다.");
    }

    localStorage.setItem("reviews", JSON.stringify(reviews));
    localStorage.removeItem("selectedPlanId");
  }

  /* ======================================================
     7. 폼 리셋
  ====================================================== */
  function resetForm() {
    form.reset();
    stars.forEach((s) => s.classList.remove("active"));
    preview.style.display = "none";
    instruction.style.display = "block";
    base64Image = "";
  }
});
