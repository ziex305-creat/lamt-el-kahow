const installButton = document.querySelector("#install-app-button");
const installHelpDialog = document.querySelector("#install-help-dialog");
const installInstructions = document.querySelector("#install-instructions");
let installPrompt = null;

const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  || window.navigator.standalone === true;

if (!isStandalone) {
  installButton.classList.remove("hidden");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
});

installButton.addEventListener("click", async () => {
  if (installPrompt) {
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    return;
  }

  const isAppleMobile = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  installInstructions.textContent = isAppleMobile
    ? "افتح الصفحة في Safari، واضغط زر المشاركة، ثم اختار «إضافة إلى الشاشة الرئيسية»."
    : "من قائمة المتصفح اختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». لو الخيار مش ظاهر، افتح الموقع في Chrome بعد نشره على اتصال آمن (HTTPS).";
  installHelpDialog.showModal();
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
  installPrompt = null;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.error("تعذر تفعيل التخزين المحلي لملفات التطبيق.", error);
  });
}
