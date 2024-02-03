let isShine = false;
export function notifyTitle() {
  const titleInit = document.title;
  let timerId = null;
  if (timerId) return;
  timerId = setInterval(function () {
    const title = document.title;
    if (isShine) {
      if (!/新/.test(title)) {
        document.title = "【您有新消息】";
      } else {
        document.title = "【　　　　　】";
      }
    } else {
      document.title = titleInit;
      clearInterval(timerId);
      timerId = null;
    }
  }, 300);
}

window.addEventListener("focus", () => {
  isShine = false;
});

window.addEventListener("blur", () => {
  isShine = true;
});

export function notifyWindow() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  if (Notification.permission == "granted") {
    new Notification("来消息了", {
      body: "莫大有一条新动态,请前往查看! ",
      silent: true,
      requireInteraction: true,
    });
  }
}
