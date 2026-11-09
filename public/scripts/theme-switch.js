// @ts-check
// Melhoria progressiva: o switch começa hidden no HTML e só aparece aqui.
(function () {
  const found = document.querySelector("[data-theme-toggle]");
  if (!found) return;
  const button = found;
  const root = document.documentElement;
  button.removeAttribute("hidden");

  // Sem escolha salva, o efetivo é o do sistema.
  function effective() {
    try {
      const t = localStorage.getItem("kf:theme");
      if (t === "light" || t === "dark") return t;
    } catch (e) {}
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function render() {
    button.setAttribute("aria-checked", String(effective() === "dark"));
  }

  button.addEventListener("click", function () {
    const next = effective() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("kf:theme", next);
    } catch (e) {}
    render();
  });

  // Enquanto não houver escolha salva, acompanha o sistema em tempo real.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);

  render();
})();
