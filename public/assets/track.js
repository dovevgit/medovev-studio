/* מדידת פניות באתר (Vercel Web Analytics custom events). אין כאן שום מידע אישי: רק סוג הפעולה ושם העמוד.
   אירועים: whatsapp_click, phone_click, form_submit (kind: contact/quote), audio_play (track),
   video_play (video), outbound_click (host), scroll_depth (percent: 50/90).
   הקובץ זהה באתר medovev.co.il (medovev/public/assets) ובאתר medovev.com (offers/assets). */
(function () {
  function page() { return (location.pathname || "/").replace(/\/+$/, "") || "/"; }
  function send(name, data) {
    try { if (window.va) window.va("event", { name: name, data: data || {} }); } catch (e) { /* מדידה לא חייבת לעבוד */ }
  }

  // לחיצה על וואטסאפ או על מספר טלפון
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\b/i.test(href)) send("whatsapp_click", { page: page() });
    else if (/^tel:/i.test(href)) send("phone_click", { page: page() });
    else if (/^https?:\/\//i.test(href)) {
      var host = "";
      try { host = new URL(href, location.href).hostname.replace(/^www\./, ""); } catch (x) { /* לא תקין */ }
      if (host && host !== location.hostname.replace(/^www\./, "")) send("outbound_click", { host: host.slice(0, 60), page: page() });
    }
  }, true);

  // הפעלת סרטון (יוטיוב): כפתור בעמוד או אריח שפותח חלון סרטון. פעם אחת לכל סרטון בכל כניסה לעמוד.
  var vids = {};
  document.addEventListener("click", function (e) {
    try {
      var t = e.target && e.target.closest ? e.target : null;
      if (!t) return;
      var id = "";
      var yt = t.closest("[data-yt]");
      if (yt) id = yt.getAttribute("data-yt") || "";
      else {
        var vb = t.closest(".video-btn, .sample-btn");
        if (vb && vb.parentNode && vb.parentNode.getAttribute) id = vb.parentNode.getAttribute("data-id") || "";
      }
      id = String(id).slice(0, 20);
      if (id && !vids[id]) { vids[id] = true; send("video_play", { video: id, page: page() }); }
    } catch (x) { /* מדידה לא חייבת לעבוד */ }
  }, true);

  // עומק גלילה: 50% ו-90% מהעמוד, פעם אחת לכל כניסה
  var depthSent = {};
  var ticking = false;
  function checkDepth() {
    ticking = false;
    try {
      var de = document.documentElement;
      var total = Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0);
      var seen = (window.pageYOffset || de.scrollTop || 0) + (window.innerHeight || de.clientHeight || 0);
      if (total < (window.innerHeight || 0) * 1.5) return; // עמוד קצר מדי, אין משמעות
      [50, 90].forEach(function (p) {
        if (!depthSent[p] && seen / total * 100 >= p) { depthSent[p] = true; send("scroll_depth", { percent: p, page: page() }); }
      });
    } catch (x) { /* מדידה לא חייבת לעבוד */ }
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; setTimeout(checkDepth, 400); }
  }, { passive: true });

  // הפעלת דוגמת קול. פעם אחת לכל דוגמה בכל כניסה לעמוד (המשך אחרי עצירה לא נספר שוב).
  // עוקבים אחרי הפעולה play() עצמה, כך שזה עובד גם עם נגנים שלא מופיעים בעץ הדף (new Audio()).
  var played = {};
  var mediaPlay = window.HTMLMediaElement && HTMLMediaElement.prototype.play;
  if (mediaPlay) {
    HTMLMediaElement.prototype.play = function () {
      try {
        if (this.tagName === "AUDIO") {
          var src = (this.src || this.currentSrc || "").split("?")[0].split("/").pop();
          try { src = decodeURIComponent(src); } catch (x) { /* משאירים כמו שזה */ }
          src = src.replace(/\.[a-z0-9]+$/i, "").slice(0, 60);
          if (src && !played[src]) { played[src] = true; send("audio_play", { track: src, page: page() }); }
        }
      } catch (e) { /* מדידה לא חייבת לעבוד */ }
      return mediaPlay.apply(this, arguments);
    };
  }

  // שליחת טופס: נספרת רק כששרת האתר החזיר הצלחה (ok:true)
  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (url, opts) {
      var p = origFetch.apply(this, arguments);
      try {
        if (typeof url === "string" && url.indexOf("/api/contact") === 0 && opts && String(opts.method).toUpperCase() === "POST") {
          var kind = "contact";
          try { kind = (JSON.parse(opts.body) || {}).kind || "contact"; } catch (x) { /* ברירת מחדל */ }
          p.then(function (r) { return r.clone().json(); })
            .then(function (j) { if (j && j.ok) send("form_submit", { kind: String(kind).slice(0, 20), page: page() }); })
            .catch(function () { /* לא משנה לתהליך הטופס */ });
        }
      } catch (e) { /* לא משנה לתהליך הטופס */ }
      return p;
    };
  }
})();
