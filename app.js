const landingConfig = {
  version: "0.2.6",
  telegramUsername: "b23355",
  prefilledMessage:
    "Hola, vi su anuncio sobre apoyo para abrir una tienda en TikTok Shop y quiero recibir mas informacion.",
};

const landingContent = {
  content_id: "telegram_contact",
  content_type: "product_group",
  content_name: "Telegram contact",
};

function buildTelegramLink() {
  return `https://t.me/${landingConfig.telegramUsername}`;
}

function trackTikTokEvent(eventName, properties = {}) {
  if (window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track(eventName, properties);
  }
}

function bindTelegramLinks() {
  const link = buildTelegramLink();
  document.querySelectorAll("[data-telegram-link]").forEach((node) => {
    node.setAttribute("href", link);
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noreferrer noopener");
    node.addEventListener("click", () => {
      trackTikTokEvent("ClickButton", {
        contents: [landingContent],
      });
      trackTikTokEvent("Contact", { contents: [landingContent] });
      if (typeof window.fbq === "function") {
        window.fbq("track", "Contact", { channel: "telegram" });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindTelegramLinks();
});
