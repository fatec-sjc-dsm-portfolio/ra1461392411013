// @ts-check
(function () {
  "use strict";

  /**
   * @param {string} value
   */
  function remember(value) {
    try {
      window.localStorage.setItem("kf:lang", value);
    } catch (err) {
      // localStorage blocked; the choice just won't be remembered.
    }
  }

  var hash = window.location.hash;
  /** @type {NodeListOf<HTMLAnchorElement>} */
  var switches = document.querySelectorAll("[data-lang-switch]");

  switches.forEach(function (link) {
    if (hash) {
      link.href = link.href + hash;
    }

    link.addEventListener("click", function () {
      var target = link.getAttribute("data-lang-switch");
      if (target) {
        remember(target);
      }
    });
  });
})();
