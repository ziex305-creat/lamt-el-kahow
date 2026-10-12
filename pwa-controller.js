const installButton = document.querySelector("#install-app-button");
const installHelpDialog = document.querySelector("#install-help-dialog");
const installInstructions = document.querySelector("#install-instructions");
const installDialogAction = document.querySelector("#install-dialog-action");
const INSTALL_NOTICE_KEY = "lamet-el-qahwa-install-notice-seen";
let installPrompt = null;

const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  || window.navigator.standalone === true;
const isAppleMobile = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
const isMobile = isAppleMobile || /android/i.test(window.navigator.userAgent);

if (!isStandalone) {
  installButton.classList.remove("hidden");
}

function showInstallHelp() {
  installInstructions.textContent = isAppleMobile
    ? "افتح الصفحة في Safari، واضغط زر المشاركة، ثم اختار «إضافة إلى الشاشة الرئيسية»."
    : "من قائمة المتصفح اختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». لو الخيار مش ظاهر، افتح الموقع في Chrome بعد نشره على اتصال آمن (HTTPS).";
  installDialogAction.textContent = installPrompt ? "تثبيت اللعبة" : "تمام";
  if (!installHelpDialog.open) installHelpDialog.showModal();
}

async function requestInstall() {
  if (!installPrompt) {
    installHelpDialog.close();
    return;
  }

  const prompt = installPrompt;
  installPrompt = null;
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") installButton.classList.add("hidden");
  } catch (error) {
    console.error("تعذر فتح نافذة تثبيت التطبيق.", error);
    showInstallHelp();
  }
}

function showAutomaticInstallHelp() {
  if (isStandalone || !isMobile || document.querySelector("#lobby-screen").classList.contains("hidden")) return;

  try {
    if (localStorage.getItem(INSTALL_NOTICE_KEY)) return;
    localStorage.setItem(INSTALL_NOTICE_KEY, "true");
  } catch (error) {
    console.error("تعذر حفظ تفضيل نافذة تثبيت التطبيق.", error);
  }

  showInstallHelp();
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  if (installHelpDialog.open) showInstallHelp();
});

installButton.addEventListener("click", async () => {
  if (installPrompt) {
    await requestInstall();
    return;
  }

  showInstallHelp();
});

installDialogAction.addEventListener("click", requestInstall);

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
  installPrompt = null;
});

window.setTimeout(showAutomaticInstallHelp, 1200);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.error("تعذر تفعيل التخزين المحلي لملفات التطبيق.", error);
  });
}
