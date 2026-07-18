const landingConfig = {
  version: "0.0.7",
  whatsappCountryCode: "52",
  whatsappNumber: "0000000000",
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
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindWhatsAppLinks();
});
