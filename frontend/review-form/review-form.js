document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reviewForm");
  const stars = document.querySelectorAll(".star");
  const ratingInput = document.getElementById("reviewRating");
  const fileInput = document.getElementById("reviewImage");
  const dropzone = document.getElementById("dropzone");
  const preview = document.getElementById("preview");
  const instruction = document.getElementById("dz-instruction");

  let base64Image = "";

  /* ======================================================
     1. 별점 클릭 (data-value 기반)
  ====================================================== */
  stars.forEach((star) => {
    star.addEventListener("click", (e) => {
      e.preventDefault();
      const value = Number(star.dataset.value);
      ratingInput.value = value;

      // 클릭한 별 이하 모두 활성화
      stars.forEach((s) =>
        s.classList.toggle("active", Number(s.dataset.value) <= value)
      );
    });
  });

  /* ======================================================
     2. 이미지 미리보기 및 리사이즈 (용량 제한)
  ====================================================== */
  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFile);

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--main-yellow)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "#ddd";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) previewFile(file);
  });

  async function handleFile(e) {
    const file = e.target.files[0];
    if (file) await previewFile(file);
  }

  async function previewFile(file) {
    const resizedBase64 = await resizeImage(file);
    base64Image = resizedBase64;
    preview.src = resizedBase64;
    preview.style.display = "block";
    instruction.style.display = "none";
  }

  /* ======================================================
     3. 이미지 리사이즈 함수
     - 800px 기준으로 비율 유지
     - JPEG 품질 0.7로 압축
  ====================================================== */
  function resizeImage(file, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
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
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ======================================================
     4. 폼 제출 (Base64 JSON 전송)
  ====================================================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("reviewTitle").value.trim();
    const content = document.getElementById("reviewContent").value.trim();
    const rating = ratingInput.value;
    const planId = localStorage.getItem("selectedPlanId");

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
      const response = await fetch(
        "https://aibe4-project1-team2-m9vr.onrender.com/my-review/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData),
        }
      );

      const result = await response.json();
      console.log("서버 응답:", result);

      if (!response.ok || !result.success) {
        alert(result.message || "리뷰 등록 중 오류가 발생했습니다.");
        console.error("서버 응답:", result);
        return;
      }

      alert("리뷰가 성공적으로 등록되었습니다!");
      localStorage.removeItem("selectedPlanId");
      form.reset();
      stars.forEach((s) => s.classList.remove("active"));
      preview.style.display = "none";
      instruction.style.display = "block";

      window.location.href = "../my-reviews/my-reviews.html";
    } catch (error) {
      console.error("서버 요청 중 오류:", error);
      alert("서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  });
});
