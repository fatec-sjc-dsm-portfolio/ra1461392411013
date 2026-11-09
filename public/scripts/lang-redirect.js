// @ts-check
(function () {
  "use strict";

  /** @type {string[]} */
  var BRAZIL_TIME_ZONES = [
    "America/Araguaina",
    "America/Bahia",
    "America/Belem",
    "America/Boa_Vista",
    "America/Campo_Grande",
    "America/Cuiaba",
    "America/Eirunepe",
    "America/Fortaleza",
    "America/Maceio",
    "America/Manaus",
    "America/Noronha",
    "America/Porto_Velho",
    "America/Recife",
    "America/Rio_Branco",
    "America/Santarem",
    "America/Sao_Paulo",
    "America/Porto_Acre",
    "Brazil/Acre",
    "Brazil/DeNoronha",
    "Brazil/East",
    "Brazil/West",
  ];

  /**
   * @returns {"pt" | "en" | null}
   */
  function fromStorage() {
    try {
      var stored = window.localStorage.getItem("kf:lang");
      if (stored === "pt" || stored === "en") {
        return stored;
      }
    } catch (err) {
      // localStorage blocked; ignore and detect again.
    }
    return null;
  }

  /**
   * @returns {string}
   */
  function primaryLanguage() {
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      return navigator.languages[0] || "";
    }
    return navigator.language || "";
  }

  /**
   * @returns {boolean}
   */
  function isBrazilTimeZone() {
    try {
      var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return BRAZIL_TIME_ZONES.indexOf(timeZone) !== -1;
    } catch (err) {
      return false;
    }
  }

  /**
   * @returns {"pt" | "en"}
   */
  function detectLanguage() {
    var saved = fromStorage();
    if (saved) {
      return saved;
    }

    if (primaryLanguage().toLowerCase().indexOf("pt") === 0) {
      return "pt";
    }

    if (isBrazilTimeZone()) {
      return "pt";
    }

    return "en";
  }

  var currentScript = document.currentScript;
  var base = (currentScript && currentScript.getAttribute("data-base")) || "/";
  var lang = detectLanguage();
  var destination = base + lang + "/" + window.location.hash;

  window.location.replace(destination);
})();
