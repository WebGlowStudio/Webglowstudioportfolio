(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktop = window.matchMedia("(min-width: 980px)");
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".nav-panel");
  var sliders = document.querySelectorAll("[data-slide]");
  var counters = document.querySelectorAll("[data-count]");
  var reveals = document.querySelectorAll(".reveal");
  var priceList = document.querySelector(".price-list");
  var form = document.querySelector(".book-form");
  var success = document.querySelector(".form-success");
  var errorBox = document.querySelector(".form-error");

  function motionOn() {
    return !reduced.matches;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function formatNum(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

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

  function progress(el, start, end) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var from = vh * start;
    var to = vh * end;
    return clamp((from - rect.top) / (from - to || 1), 0, 1);
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.toggle("is-shrunk", y > 18);
    if (!motionOn()) return;
    for (var i = 0; i < sliders.length; i++) {
      var slideP = progress(sliders[i], 0.95, 0.5);
      sliders[i].style.setProperty("--p", slideP.toFixed(4));
    }
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (!target && target !== 0) return;
    var duration = 1300;
    var start = 0;
    function frame(now) {
      if (!start) start = now;
      var t = clamp((now - start) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatNum(target * eased) + suffix;
      if (t < 1) window.requestAnimationFrame(frame);
      else el.textContent = formatNum(target) + suffix;
    }
    window.requestAnimationFrame(frame);
  }

  if (motionOn()) {
    for (var c = 0; c < counters.length; c++) {
      counters[c].textContent = "0" + (counters[c].getAttribute("data-suffix") || "");
    }
  }

  if (motionOn() && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        if (entry.target.hasAttribute("data-count")) animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

    for (var r = 0; r < reveals.length; r++) io.observe(reveals[r]);
    for (var n = 0; n < counters.length; n++) io.observe(counters[n]);
    if (priceList) io.observe(priceList);
  } else {
    for (var j = 0; j < reveals.length; j++) reveals[j].classList.add("is-in");
    if (priceList) priceList.classList.add("is-in");
    for (var k = 0; k < counters.length; k++) {
      var finalValue = parseInt(counters[k].getAttribute("data-count"), 10);
      counters[k].textContent = formatNum(finalValue) + (counters[k].getAttribute("data-suffix") || "");
    }
  }

  var dayNodes = document.querySelectorAll("[data-day]");
  if (dayNodes.length) {
    var today = String(new Date().getDay());
    for (var d = 0; d < dayNodes.length; d++) {
      if (dayNodes[d].getAttribute("data-day") === today) {
        dayNodes[d].classList.add("is-today");
      }
    }
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
      var service = String(data.get("usluga") || "").trim();
      var date = String(data.get("datum") || "").trim();
      if (name.length < 2 || !validEmail(email) || !service) {
        showError("Popunite ime, mejl i uslugu.");
        form.reportValidity();
        return;
      }
      var guest = success.querySelector("[data-guest]");
      var detail = success.querySelector("[data-detail]");
      if (guest) guest.textContent = name;
      if (detail) {
        var when = date ? " za datum " + date : "";
        detail.textContent = "Zahtev za „" + service + "“" + when + " nije poslat. Ovo je demo sajt — u pravom ateljeu ovde biste dobili potvrdu na " + email + ".";
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
