(function () {
  "use strict";

  var actions = document.querySelector(".hero__cta");
  if (!actions || actions.querySelector("[data-guardian-portal]")) return;

  var spanish = /^\/es(?:\/|$)/.test(window.location.pathname);
  var link = document.createElement("a");
  link.className = "hbtn hbtn--primary";
  link.href = window.GUARDIANS_APP_URL || "https://guardians-app.discloud.app/dashboard";
  link.setAttribute("data-guardian-portal", "");
  link.textContent = spanish ? "Mi Guardian →" : "My Guardian →";
  actions.insertBefore(link, actions.firstChild);
})();
