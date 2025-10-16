document.addEventListener("DOMContentLoaded", () => {
  const selectedPlanId = localStorage.getItem("selectedPlanId");
  const savedPlans = JSON.parse(localStorage.getItem("aiSchedules")) || [];

  // === 일정 요약 정보 ===
  const plan = savedPlans.find((p) => p.planId === Number(selectedPlanId));
  if (!plan) {
    document.getElementById("plan-detail").innerHTML =
      "<p>⚠️ 일정을 찾을 수 없습니다.</p>";
    return;
  }

  const rec = plan.recommendation;
  const date = plan.departureDate;
  const companionType = plan.companionsType;
  const companions = plan.companions;
  const styles = plan.travelStyles.join(", ");
  const budget = plan.budget.toLocaleString() + plan.budgetUnit;
  const description = rec.destinationDescription;
  const shortItinerary = rec.itinerary
    .slice(0, 5)
    .map((i) => i.activity)
    .join(", ");

  document.getElementById("plan-detail").innerHTML = `
    <h2>${plan.departure} → <span style="color:#ff7b42">${rec.destinationName}</span></h2>
    <p>${date} | ${companionType} | 총 ${companions}명 | ${styles}</p>
    <p>예산 약 ${budget}</p>
    <p style="margin-top:10px; line-height:1.5;">${description}</p>
    <p style="margin-top:10px; font-weight:600;">추천일:
      <span style="font-weight:400;">${shortItinerary}</span>
    </p>
  `;

  // === 별점 ===
  const starWrap = document.getElementById("star-rating");
  const starBtns = Array.from(starWrap.querySelectorAll(".star"));
  const ratingInput = document.getElementById("review-rating");
  let currentRating = 0;

  function paintStars(n) {
    starBtns.forEach((btn, i) => {
      btn.classList.toggle("is-filled", i < n);
      btn.setAttribute("aria-checked", i === n - 1 ? "true" : "false");
    });
  }

  function setRating(n) {
    currentRating = n;
    ratingInput.value = String(n);
    paintStars(n);
  }

  starBtns.forEach((btn) => {
    btn.addEventListener("click", () => setRating(Number(btn.dataset.value)));
  });

  starWrap.addEventListener("keydown", (e) => {
    const focusIndex = starBtns.indexOf(document.activeElement);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(
        focusIndex >= 0 ? focusIndex + 1 : currentRating,
        4
      );
      starBtns[next].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(
        focusIndex >= 0 ? focusIndex - 1 : currentRating - 2,
        0
      );
      starBtns[prev].focus();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const idx = focusIndex >= 0 ? focusIndex : currentRating - 1;
      setRating(idx + 1);
    }
  });

  paintStars(0);

  // === 드래그 앤 드롭 ===
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("review-image");
  const previewImg = document.getElementById("preview");
  const instruction = document.getElementById("dz-instruction");
  let selectedFile = null;

  function showPreview(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result;
      previewImg.style.display = "block";
      instruction.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  function acceptFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 최대 10MB까지 가능합니다.");
      return;
    }
    selectedFile = file;
    showPreview(file);
  }

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => acceptFile(e.target.files[0]));

  ["dragenter", "dragover"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    })
  );

  ["dragleave", "dragend", "drop"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    })
  );

  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    acceptFile(file);
  });

  // === 폼 제출 ===
  const form = document.getElementById("review-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!ratingInput.value) {
      alert("별점을 선택해주세요.");
      return;
    }

    const payload = new FormData();
    payload.append(
      "title",
      document.getElementById("review-title").value.trim()
    );
    payload.append(
      "content",
      document.getElementById("review-content").value.trim()
    );
    payload.append("userKey", document.getElementById("review-userKey").value);
    payload.append("rating", ratingInput.value);
    payload.append("planId", selectedPlanId);
    if (selectedFile) payload.append("image", selectedFile);
    
    const response = await fetch(
        `https://aibe4-project1-team2-m9vr.onrender.com/mypage/${payload.planId}/review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
    const data = await response.json()

    alert(`✅ 리뷰가 등록되었습니다! ${data.message}`);
    window.location.href = "../reviews/reviews.html";
  });
});
