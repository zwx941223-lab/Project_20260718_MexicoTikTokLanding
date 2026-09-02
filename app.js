const landingConfig = {
  version: "0.2.8",
  telegramUsername: "b23355",
  prefilledMessage:
    "Hola, vi su anuncio sobre apoyo para abrir una tienda en TikTok Shop y quiero recibir mas informacion.",
};

function buildTelegramLink() {
  return `https://t.me/${landingConfig.telegramUsername}`;
}

function bindTelegramLinks() {
  const link = buildTelegramLink();
  document.querySelectorAll("[data-telegram-link]").forEach((node) => {
    node.setAttribute("href", link);
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noreferrer noopener");
    node.addEventListener("click", () => {
      if (typeof window.fbq === "function") {
        window.fbq("track", "Contact", { channel: "telegram" });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindTelegramLinks();
});
