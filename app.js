// Upload tugmasi
document.getElementById("uploadBtn").addEventListener("click", () => {
  alert("📤 Qo‘shiq yuklash funksiyasi tez orada qo‘shiladi!");
});

// Eye (visibility) tugmasi
const visibilityBtn = document.getElementById("visibilityToggle");
const eyeIcon = document.getElementById("eyeIcon");

let isVisible = true;

visibilityBtn.addEventListener("click", () => {
  isVisible = !isVisible;
  if (isVisible) {
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
    visibilityBtn.classList.remove("hidden");
    visibilityBtn.title = "Ko‘rinish: yoqilgan";
  } else {
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
    visibilityBtn.classList.add("hidden");
    visibilityBtn.title = "Ko‘rinish: o‘chirilgan";
  }
});
