(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var themeButton = document.getElementById("theme-toggle");
  var menuButton = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  if (themeButton) {
    try {
      var savedTheme = localStorage.getItem("desire-portfolio-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        root.setAttribute("data-theme", savedTheme);
      }
    } catch (error) {
      showToast("Theme preference could not be loaded.");
    }

    function updateThemeLabel() {
      var isDark = root.getAttribute("data-theme") === "dark" ||
        (!root.hasAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      themeButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeButton.setAttribute("aria-pressed", String(isDark));
      themeButton.textContent = isDark ? "☀" : "◐";
    }

    themeButton.addEventListener("click", function () {
      var nextTheme = themeButton.getAttribute("aria-pressed") === "true" ? "light" : "dark";
      root.setAttribute("data-theme", nextTheme);
      updateThemeLabel();
      try {
        localStorage.setItem("desire-portfolio-theme", nextTheme);
      } catch (error) {
        showToast("Theme changed for this visit, but could not be saved.");
      }
    });
    updateThemeLabel();
  }

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      menuButton.textContent = isOpen ? "☰" : "×";
      nav.classList.toggle("is-open", !isOpen);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.tagName !== "A") return;
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      menuButton.textContent = "☰";
    });
  }

  var currentPage = document.body.getAttribute("data-page");
  if (nav && currentPage) {
    var pageLinks = nav.querySelectorAll("[data-page]");
    Array.prototype.forEach.call(pageLinks, function (link) {
      if (link.getAttribute("data-page") === currentPage) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    Array.prototype.forEach.call(revealItems, function (item) {
      revealObserver.observe(item);
    });
  } else {
    Array.prototype.forEach.call(revealItems, function (item) {
      item.classList.add("is-visible");
    });
  }

  var progressBar = document.getElementById("scroll-progress");
  var backToTop = document.getElementById("back-to-top");
  var scrollFrame = 0;
  function updateScrollControls() {
    scrollFrame = 0;
    var scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    if (progressBar) progressBar.style.transform = "scaleX(" + Math.min(1, Math.max(0, progress)) + ")";
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 420);
  }
  window.addEventListener("scroll", function () {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollControls);
  }, { passive: true });
  window.addEventListener("resize", updateScrollControls);
  updateScrollControls();

  var copyButton = document.getElementById("copy-email");
  var emailLink = document.getElementById("email-address");
  if (copyButton && emailLink) {
    copyButton.addEventListener("click", function () {
      var email = emailLink.textContent.trim();
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        showToast("Copy the email address above to get in touch.");
        return;
      }
      navigator.clipboard.writeText(email).then(function () {
        showToast("Email copied.");
      }, function () {
        showToast("Copy failed. Select the email address above.");
      });
    });
  }

  var checklist = document.getElementById("checklist");
  if (checklist) {
    var checklistItems = checklist.querySelectorAll('input[type="checkbox"]');
    var checklistCount = document.getElementById("checklist-count");
    var checklistProgress = document.getElementById("checklist-progress");
    var checklistReset = document.getElementById("checklist-reset");
    var checklistStorageKey = "desire-portfolio-checklist";

    function updateChecklist() {
      var completed = 0;
      Array.prototype.forEach.call(checklistItems, function (item) {
        if (item.checked) completed += 1;
      });
      checklistCount.textContent = completed + " of " + checklistItems.length + " done";
      checklistProgress.style.width = (checklistItems.length ? completed / checklistItems.length * 100 : 0) + "%";
    }

    try {
      var savedChecklist = JSON.parse(localStorage.getItem(checklistStorageKey) || "[]");
      if (Array.isArray(savedChecklist)) {
        Array.prototype.forEach.call(checklistItems, function (item) {
          item.checked = savedChecklist.indexOf(item.value) !== -1;
        });
      }
    } catch (error) {
      showToast("Your saved checklist could not be loaded.");
    }
    updateChecklist();

    Array.prototype.forEach.call(checklistItems, function (item) {
      item.addEventListener("change", function () {
        var completedItems = [];
        Array.prototype.forEach.call(checklistItems, function (checkbox) {
          if (checkbox.checked) completedItems.push(checkbox.value);
        });
        updateChecklist();
        try {
          localStorage.setItem(checklistStorageKey, JSON.stringify(completedItems));
        } catch (error) {
          showToast("Progress updated, but could not be saved.");
        }
      });
    });

    checklistReset.addEventListener("click", function () {
      Array.prototype.forEach.call(checklistItems, function (item) {
        item.checked = false;
      });
      updateChecklist();
      try {
        localStorage.removeItem(checklistStorageKey);
      } catch (error) {
        showToast("Checklist reset, but saved progress could not be cleared.");
      }
    });
  }

  var timer = document.getElementById("focus-timer");
  if (timer) {
    var display = document.getElementById("timer-time");
    var status = document.getElementById("timer-status");
    var ring = document.getElementById("timer-ring");
    var durationSelect = document.getElementById("timer-duration");
    var startButton = document.getElementById("timer-start");
    var resetButton = document.getElementById("timer-reset");
    var remaining = Number(durationSelect.value) * 60;
    var endTime = 0;
    var interval = null;
    var running = false;

    function updateTimer() {
      var minutes = Math.floor(remaining / 60);
      var seconds = remaining % 60;
      display.textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
      var total = Number(durationSelect.value) * 60;
      ring.style.setProperty("--progress", (total ? remaining / total * 100 : 0) + "%");
    }

    function stopTimer(message) {
      window.clearInterval(interval);
      interval = null;
      running = false;
      durationSelect.disabled = false;
      startButton.textContent = "Start";
      status.textContent = message;
      updateTimer();
    }

    function tick() {
      remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      updateTimer();
      if (remaining === 0) stopTimer("Session complete. Nice work.");
    }

    durationSelect.addEventListener("change", function () {
      remaining = Number(durationSelect.value) * 60;
      status.textContent = "Ready when you are.";
      updateTimer();
    });
    startButton.addEventListener("click", function () {
      if (running) {
        remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        stopTimer("Paused.");
        return;
      }
      if (remaining <= 0) remaining = Number(durationSelect.value) * 60;
      running = true;
      endTime = Date.now() + remaining * 1000;
      durationSelect.disabled = true;
      startButton.textContent = "Pause";
      status.textContent = "Focus time. You’ve got this.";
      interval = window.setInterval(tick, 250);
      updateTimer();
    });
    resetButton.addEventListener("click", function () {
      remaining = Number(durationSelect.value) * 60;
      stopTimer("Ready when you are.");
    });
    updateTimer();
  }
}());
