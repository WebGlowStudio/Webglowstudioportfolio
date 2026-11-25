(function () {
  "use strict";

  var desktop = window.matchMedia("(min-width: 980px)");
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".nav-panel");
  var form = document.querySelector(".book-form");
  var success = document.querySelector(".form-success");
  var errorBox = document.querySelector(".form-error");

  function setNav(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Zatvori meni" : "Otvori meni");
    panel.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("nav-open", open && !desktop.matches);
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNav(false);
    });
    desktop.addEventListener("change", function (event) {
      if (event.matches) setNav(false);
    });
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.hidden = !message;
    errorBox.textContent = message || "";
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form && success) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showError("");
      var data = new FormData(form);
      var name = String(data.get("ime") || "").trim();
      var email = String(data.get("mejl") || "").trim();
      var eventType = String(data.get("dogadjaj") || "").trim();
      var date = String(data.get("datum") || "").trim();
      if (name.length < 2 || !validEmail(email) || !eventType) {
        showError("Popunite ime, mejl i vrstu događaja.");
        form.reportValidity();
        return;
      }
      var guest = success.querySelector("[data-guest]");
      var detail = success.querySelector("[data-detail]");
      if (guest) guest.textContent = name;
      if (detail) {
        var when = date ? " za datum " + date : "";
        detail.textContent = "Upit za „" + eventType + "“" + when + " nije poslat. Ovo je predlog sajta — na pravom sajtu ovde biste dobili potvrdu na " + email + ".";
      }
      form.hidden = true;
      success.hidden = false;
    });

    var reset = success.querySelector("[data-reset]");
    if (reset) {
      reset.addEventListener("click", function () {
        form.reset();
        form.hidden = false;
        success.hidden = true;
        showError("");
        var nameInput = form.querySelector("#ime");
        if (nameInput) nameInput.focus();
      });
    }
  }
})();
