const landingConfig = {
  version: "0.1.18",
  whatsappCountryCode: "86",
  whatsappNumber: "13357698090",
  prefilledMessage:
    "Hola, vi su anuncio sobre apoyo para abrir una tienda en TikTok Shop y quiero recibir mas informacion.",
};

function buildWhatsAppLink() {
  const fullNumber = `${landingConfig.whatsappCountryCode}${landingConfig.whatsappNumber}`;
  const message = encodeURIComponent(landingConfig.prefilledMessage);
  return `https://wa.me/${fullNumber}?text=${message}`;
}

function bindWhatsAppLinks() {
  const link = buildWhatsAppLink();
  document.querySelectorAll("[data-wa-link]").forEach((node) => {
    node.setAttribute("href", link);
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noreferrer noopener");
    node.addEventListener("click", () => {
      if (typeof window.fbq === "function") {
        window.fbq("track", "Contact");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindWhatsAppLinks();
});
