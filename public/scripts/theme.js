// @ts-check
// Síncrono no <head>: aplica o tema salvo antes da primeira pintura.
(function () {
  try {
    var t = localStorage.getItem("kf:theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
