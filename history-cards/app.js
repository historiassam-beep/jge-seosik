(function () {
  "use strict";
  var HC = window.HC, PLACES = HC.places, SOURCES = HC.sources, COURSES = HC.courses;
  var SRC = {}; SOURCES.forEach(function (s) { SRC[s.id] = s; });
  var PLACE = {}; PLACES.forEach(function (p) { PLACE[p.id] = p; });
  var CONF = { FACT: "확인", PROBABLE: "추정·확인 필요", RECONSTRUCTED: "교육용 구성" };
  var PHOTO_TYPE = { historical: "과거 사진", current: "현재 사진", trace: "흔적·표지석 사진", reference: "참고 사진", reconstructed: "교육용 재구성 이미지(사료사진 아님)" };
  var KEY = "hc.v1", MAXLEN = 500, FIELDS = [["obs", "사진에서 관찰한 내용"], ["evidence", "역사적 근거"], ["todo", "추가 확인이 필요한 내용"], ["question", "수업에서 사용할 질문"]];

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : ""; }
  function badge(c, prefix) { return '<span class="conf c-' + c + '">' + esc((prefix || "") + CONF[c]) + "</span>"; }
  function statusGroup(s) { return s === "현존" ? "exist" : (s === "건물 소멸" ? "gone" : (s === "현장 확인 필요" ? "check" : "changed")); }
  function srcLink(id) {
    var s = SRC[id]; if (!s) return "";
    return '<a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(s.title) + "</a> <small>(" + esc(s.organization) + " · " + esc(s.checkedAt) + ")</small>";
  }

  // ---------- 저장소 ----------
  var state = { picked: [], notes: {}, myCourses: [] }, toastTimer;
  function toast(msg, err) {
    var t = $(".toast"); if (!t) { t = document.createElement("div"); t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.className = "toast" + (err ? " err" : ""); t.textContent = msg;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4000);
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { toast("이 브라우저에서는 기록을 저장할 수 없습니다. 새로고침하면 사라집니다.", true); return; }
    if (!raw) return;
    try {
      var o = JSON.parse(raw);
      if (!o || typeof o !== "object") throw new Error("bad");
      var picked = Array.isArray(o.picked) ? o.picked.filter(function (id) { return typeof id === "string" && PLACE[id]; }) : [];
      var notes = {};
      if (o.notes && typeof o.notes === "object") Object.keys(o.notes).forEach(function (id) {
        if (!PLACE[id] || !o.notes[id] || typeof o.notes[id] !== "object") return;
        var n = {}; FIELDS.forEach(function (f) { var v = o.notes[id][f[0]]; n[f[0]] = typeof v === "string" ? v.slice(0, MAXLEN) : ""; });
        notes[id] = n;
      });
      var my = [];
      if (Array.isArray(o.myCourses)) o.myCourses.forEach(function (m) {
        if (!m || typeof m.id !== "string" || typeof m.title !== "string" || !Array.isArray(m.tour)) return;
        var tour = m.tour.filter(function (id) { return typeof id === "string" && PLACE[id]; });
        if (tour.length >= 2) my.push({ id: m.id.slice(0, 40), title: m.title.slice(0, 40), tour: tour, question: typeof m.question === "string" ? m.question.slice(0, 200) : "" });
      });
      state = { picked: picked, notes: notes, myCourses: my.slice(0, 20) };
    } catch (e) {
      state = { picked: [], notes: {}, myCourses: [] };
      toast("저장된 기록이 손상되어 초기화했습니다.", true);
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { toast("저장하지 못했습니다(저장 공간 또는 브라우저 설정 확인). CSV로 내려받아 보관하세요.", true); return false; }
  }
  function courseById(id) {
    var c = COURSES.filter(function (x) { return x.id === id; })[0]; if (c) return c;
    var m = state.myCourses.filter(function (x) { return x.id === id; })[0];
    return m ? { id: m.id, title: "내 코스 · " + m.title, confidence: "RECONSTRUCTED", events: null, tour: m.tour, mine: true,
      disclaimer: "교사가 직접 구성한 학습 코스입니다. 실제 이동 경로나 사건 순서가 아니며, 순서는 구성한 사람이 정했습니다." + (m.question ? " 코스 질문: " + m.question : "") } : null;
  }
  function effMode() { var c = courseById(ui.course); return c && c.events ? ui.mode : "tour"; }
  function fillCourseSelect() {
    var sel = $("#courseSel"), cur = ui.course;
    sel.innerHTML = '<option value="">코스 선택 안 함</option>' + COURSES.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.title) + "</option>"; }).join("") +
      state.myCourses.map(function (m) { return '<option value="' + esc(m.id) + '">내 코스 · ' + esc(m.title) + "</option>"; }).join("");
    if (!courseById(cur)) { ui.course = ""; cur = ""; }
    sel.value = cur;
  }
  function isPicked(id) { return state.picked.indexOf(id) >= 0; }
  function togglePick(id) {
    var i = state.picked.indexOf(id);
    if (i >= 0) state.picked.splice(i, 1); else state.picked.push(id);
    save(); renderAll();
  }
  function noteOf(id) { return state.notes[id] || { obs: "", evidence: "", todo: "", question: "" }; }

  // ---------- 필터 ----------
  var ui = { level: "교사(전체)", showSensitive: false, q: "", region: "", district: "", event: "", group: "", era: "", cat: "", status: "", picked: false, selected: null, course: "", mode: "events", step: 0 };
  function levelHidden(p) { return ui.level === "초등학생" && !ui.showSensitive && HC.hiddenForElementary(p); }
  function filtered() {
    var terms = ui.q.toLowerCase().split(/\s+/).filter(Boolean);
    return PLACES.filter(function (p) {
      if (levelHidden(p)) return false;
      if (ui.region && p.region !== ui.region) return false;
      if (ui.district && p.districtKey !== ui.district) return false;
      if (ui.event && p.events.indexOf(ui.event) < 0) return false;
      if (ui.era && p.era !== ui.era) return false;
      if (ui.cat && p.category !== ui.cat) return false;
      if (ui.status && statusGroup(p.status) !== ui.status) return false;
      if (ui.picked && !isPicked(p.id)) return false;
      if (terms.length) {
        var hay = [p.name, p.historicalName, p.currentName, p.eventDate, p.tags.join(" "), p.currentAddress, p.summary].join(" ").toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) >= 0; });
      }
      return true;
    });
  }

  // ---------- 사진 ----------
  function careNote(p) {
    if (!HC.needsCare(p) || (ui.level !== "초등학생" && ui.level !== "중학생")) return "";
    return '<p class="note-warn care-note">⚠ 민간인 희생과 관련될 수 있는 장소입니다. 자극적인 표현·사진을 피하고 추모와 진상 이해의 관점에서 다루세요.</p>';
  }
  function hiddenCount() { return ui.level === "초등학생" && !ui.showSensitive ? PLACES.filter(HC.hiddenForElementary).length : 0; }
  function levelNotice() {
    var n = hiddenCount();
    return n ? '<div class="empty lvl-notice"><p><b>초등학생 보기:</b> 민간인 희생과 관련될 수 있는 장소 ' + n + '곳(여순사건 전체 포함)을 숨겼습니다.</p><p><button type="button" id="btnShowSens">교사 확인 후 모두 표시</button></p></div>' : "";
  }
  function cardSources(p) {
    var u = {}, ids = [];
    p.coordinate.sourceIds.concat.apply(p.coordinate.sourceIds, p.facts.map(function (f) { return f.sourceIds; })).forEach(function (s) { if (SRC[s] && !u[s]) { u[s] = 1; ids.push(s); } });
    return ids.map(function (s) { return '<a href="' + esc(safeUrl(SRC[s].url)) + '" target="_blank" rel="noopener noreferrer">' + esc(SRC[s].title) + "</a>"; }).join(" · ") || "없음(교육용 구성)";
  }
  function hasCoord(p) { return p.coordinate.latitude != null && p.coordinate.longitude != null; }
  function photoFigure(ph) {
    var u = safeUrl(ph.url), h = '<figure class="ph">';
    if (u) h += '<span class="imgwrap"><img class="hc-img" src="' + esc(u) + '" alt="' + esc(ph.caption) + '" loading="lazy" data-src="' + esc(u) + '" data-source="' + esc(SRC[ph.sourceId] ? SRC[ph.sourceId].url : "") + '"></span>';
    else h += "<span>사진 주소 미등록 — 원문 출처에서 확인하세요.</span>";
    h += "<figcaption><b>" + esc(PHOTO_TYPE[ph.type] || ph.type) + "</b> · " + esc(ph.caption) +
      "<br>촬영연도: <b>" + esc(ph.shootingYear || "미상") + "</b> · 출처: " + (srcLink(ph.sourceId) || "미상") +
      "<br>이용조건: " + esc(ph.license || "미확인");
    if (ph.warning) h += '<br><span class="warn">⚠ ' + esc(ph.warning) + "</span>";
    return h + "</figcaption></figure>";
  }
  function hasPast(p) { return p.photos.some(function (x) { return x.type !== "current"; }); }
  function pastMissingBox(p) {
    return '<div class="ph"><span class="warn">과거 사진 미확보</span><span>기록에 남은 당시 모습: ' + esc(p.summary) +
      "</span><span>현재 비교 지점: " + esc(p.currentName) + "</span><span>※ 정확한 촬영점 비교가 아닙니다.</span></div>";
  }
  function cardThumb(p) {
    var withUrl = p.photos.filter(function (x) { return safeUrl(x.url); })[0];
    if (withUrl) return photoFigure(withUrl);
    var lines = [];
    if (p.status !== "현존" && !p.photos.some(function (x) { return x.type === "historical"; })) lines.push('<span class="warn">과거 사진 미확보</span>');
    p.photos.forEach(function (x) { if (x.type === "trace") lines.push("<span>흔적 사진 있음 · 촬영연도 " + esc(x.shootingYear) + "(주소 미등록)</span>"); });
    if (!lines.length) lines.push("<span>사진 미등록</span>");
    return '<div class="ph thumb">' + lines.join("") + "</div>";
  }
  document.addEventListener("error", function (e) {
    var img = e.target; if (!img || img.tagName !== "IMG" || !img.classList.contains("hc-img")) return;
    var wrap = img.parentNode, src = img.getAttribute("data-src"), orig = img.getAttribute("data-source");
    wrap.innerHTML = '<span class="warn">사진을 불러오지 못했습니다.</span> ' +
      (safeUrl(orig) ? '<a href="' + esc(orig) + '" target="_blank" rel="noopener noreferrer">원문 출처 열기</a> ' : "") +
      '<button type="button" class="ghost" data-act="retry" data-src="' + esc(src) + '" data-source="' + esc(orig) + '">다시 불러오기</button>';
  }, true);

  // ---------- 카드 ----------
  function renderCards() {
    var list = filtered(), box = $("#cards");
    var noMap = list.filter(function (p) { return !hasCoord(p); }).length;
    $("#resultCount").textContent = "검색 결과 " + list.length + "곳 / 전체 " + PLACES.length + "곳" + (noMap ? " (좌표 미확인 " + noMap + "곳은 지도에 표시되지 않음)" : "") + (hiddenCount() ? " · 초등학생 보기로 " + hiddenCount() + "곳 숨김" : "");
    if (!list.length) { var soon = (ui.cat && !PLACES.some(function (p) { return p.category === ui.cat; })) ? ui.cat : ((ui.era && !PLACES.some(function (p) { return p.era === ui.era; })) ? ui.era : "");
      box.innerHTML = '<div class="empty"><p><b>' + (soon ? esc(soon) + " 장소는 아직 등록되지 않았습니다(자료 확인 후 추가 예정)." : "조건에 맞는 장소가 없습니다.") + "</b></p><p>검색어나 필터를 바꾸거나 초기화해 보세요.</p></div>" + levelNotice(); return; }
    function card(p) {
      var pk = isPicked(p.id);
      return '<article class="card' + (ui.selected === p.id ? " sel" : "") + '" data-id="' + esc(p.id) + '">' +
        "<h3>" + esc(p.name) + "</h3>" +
        '<div class="meta"><span class="tag">' + esc(p.region) + '</span><span class="tag">' + esc(p.category) + '</span><span class="tag">' + esc(p.eventDate) + '</span><span class="tag">상태: ' + esc(p.status) + "</span>" + (HC.isSensitive(p) ? '<span class="tag care">희생 관련 장소</span>' : "") +
        badge(p.coordinate.accuracy, "위치: ") + (hasCoord(p) ? "" : '<span class="tag">지도 좌표 미확인</span>') + "</div>" + cardThumb(p) +
        '<p class="names"><b>당시 지명</b> ' + esc(p.historicalName) + "<br><b>현재 지명</b> " + esc(p.currentName) + "</p>" +
        "<p>" + esc(ui.level === "초등학생" && p.easySummary ? p.easySummary : p.summary) + "</p>" + careNote(p) +
        '<p class="q">생각해 볼 질문: ' + esc(p.inquiryQuestion) + "</p>" +
        '<p class="srcs">출처: ' + cardSources(p) + "</p>" +
        '<div class="cardbtns"><button type="button" data-act="detail">자세히 보기</button>' +
        '<button type="button" class="ghost" data-act="find">지도에서 찾기</button>' +
        '<button type="button" class="ghost" data-act="pick" aria-pressed="' + pk + '">' + (pk ? "수업에서 빼기" : "수업에 담기") + "</button></div></article>";
    }
    var notice = levelNotice();
    if (!ui.group) { box.innerHTML = notice + list.map(card).join(""); return; }
    var groups = {}, keys = [];
    list.forEach(function (p) {
      (ui.group === "district" ? [p.districtKey || "(시군구 미상)"] : (p.events.length ? p.events : ["(사건 미분류)"])).forEach(function (k) { if (!groups[k]) { groups[k] = []; keys.push(k); } groups[k].push(p); });
    });
    keys.sort(ui.group === "district" ? districtCmp : eventCmp);
    box.innerHTML = notice + keys.map(function (k) { return '<section class="grp" aria-label="' + esc(k) + '"><h3 class="grp-h">' + esc(k) + " (" + groups[k].length + "곳)</h3>" + groups[k].map(card).join("") + "</section>"; }).join("");
  }
  function districtCmp(a, b) { var ra = HC.regionOrder.indexOf(a.split(" ")[0]), rb = HC.regionOrder.indexOf(b.split(" ")[0]); return (ra - rb) || a.localeCompare(b, "ko"); }
  function eventCmp(a, b) { var n = HC.eventList.map(function (e) { return e.name; }); return (n.indexOf(a) + 99 * (n.indexOf(a) < 0)) - (n.indexOf(b) + 99 * (n.indexOf(b) < 0)); }
  function fillDistricts() {
    var sel = $("#fDistrict"), counts = {}, keys = [];
    PLACES.forEach(function (p) { if (ui.region && p.region !== ui.region) return; var k = p.districtKey; if (!k) return; if (!counts[k]) { counts[k] = 0; keys.push(k); } counts[k]++; });
    keys.sort(districtCmp);
    if (ui.district && keys.indexOf(ui.district) < 0) ui.district = "";
    sel.innerHTML = '<option value="">전체</option>' + keys.map(function (k) { return '<option value="' + esc(k) + '">' + esc(k) + " (" + counts[k] + ")</option>"; }).join("");
    sel.value = ui.district;
  }

  // ---------- 코스 ----------
  function courseSteps() {
    var c = courseById(ui.course); if (!c) return null;
    if (ui.mode === "tour" || !c.events) return c.tour.map(function (id, i) { return { placeId: id, label: (i + 1) + "번째 답사지 · " + PLACE[id].name }; });
    return c.events;
  }
  function renderCourse() {
    var c = courseById(ui.course), panel = $("#coursePanel");
    $("#stepNav").hidden = panel.hidden = !c; $("#modeBox").hidden = !c || !c.events;
    if (!c) return;
    var steps = courseSteps(); ui.step = Math.max(0, Math.min(ui.step, steps.length - 1));
    var cur = steps[ui.step], p = PLACE[cur.placeId];
    $("#stepPos").textContent = (ui.step + 1) + " / " + steps.length + " 단계";
    $("#stepPrev").disabled = ui.step === 0; $("#stepNext").disabled = ui.step === steps.length - 1;
    var pastTxt = hasPast(p) ? (p.photos.filter(function (x) { return x.type !== "current"; }).map(function (x) { return PHOTO_TYPE[x.type] + "(촬영연도 " + (x.shootingYear || "미상") + ")"; }).join(", ")) : "과거 사진 미확보";
    panel.innerHTML = "<p>" + badge(c.confidence) + " <b>" + esc(c.title) + "</b></p>" +
      "<p>" + (effMode() === "events" ? "과거 사건 연결(시간순) — 지도의 갈색 점선" : "현재 탐구(답사) 순서 — 지도의 올리브색 실선") + "</p>" +
      "<ol>" + steps.map(function (s, i) { return '<li class="' + (i === ui.step ? "cur" : "") + '"><button type="button" data-step="' + i + '">' + esc(s.label) + "</button></li>"; }).join("") + "</ol>" +
      '<p class="note-warn">※ ' + esc(c.disclaimer) + "</p>" + (c.refSources ? '<p class="srcs">참고 자료: ' + c.refSources.map(srcLink).join(" · ") + "</p>" : "") +
      '<p id="stepInfo"><b>현재 단계: ' + esc(p.name) + "</b> (" + esc(p.eventDate) + ") " + badge(p.coordinate.accuracy, "위치: ") +
      "<br>위치 설명: " + esc(p.coordinate.note) + "<br>사진: <b>" + esc(pastTxt) + "</b></p>";
  }
  function goStep(i) {
    var steps = courseSteps(); if (!steps) return;
    ui.step = Math.max(0, Math.min(i, steps.length - 1));
    select(steps[ui.step].placeId, true); renderAll();
  }

  // ---------- 지도 ----------
  var M = { lat: 35.15, lon: 126.9, z: 11, tiles: {}, ptrs: {}, tileFail: false };
  var mapEl = $("#map"), tilesEl, svgEl, markersEl;
  function proj(lat, lon, z) { var n = 256 * Math.pow(2, z), s = Math.sin(lat * Math.PI / 180); return { x: (lon + 180) / 360 * n, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n }; }
  function unproj(x, y, z) { var n = 256 * Math.pow(2, z), lon = x / n * 360 - 180, t = Math.PI * (1 - 2 * y / n); return { lat: Math.atan(Math.sinh(t)) * 180 / Math.PI, lon: lon }; }
  function toPx(lat, lon) { var c = proj(M.lat, M.lon, M.z), p = proj(lat, lon, M.z); return { x: p.x - c.x + mapEl.clientWidth / 2, y: p.y - c.y + mapEl.clientHeight / 2 }; }
  function mapPlaces() {
    var ids = {}; filtered().forEach(function (p) { ids[p.id] = 1; });
    var steps = courseSteps(); if (steps) steps.forEach(function (s) { ids[s.placeId] = 1; });
    if (ui.selected) ids[ui.selected] = 1;
    return PLACES.filter(function (p) { return ids[p.id] && hasCoord(p) && !levelHidden(p); });
  }
  function initMap() {
    mapEl.innerHTML = '<div class="tiles"></div><svg aria-hidden="true"></svg><div class="markers"></div>' +
      '<div class="zoom"><button type="button" data-z="1" aria-label="확대">+</button><button type="button" data-z="-1" aria-label="축소">−</button></div>' +
      '<div class="attrib">© OpenStreetMap contributors</div>';
    tilesEl = $(".tiles", mapEl); svgEl = $("svg", mapEl); markersEl = $(".markers", mapEl);
    var drag = null, pinch = null;
    mapEl.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".mk,.zoom")) return;
      M.ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { mapEl.setPointerCapture(e.pointerId); } catch (_) {}
      var ids = Object.keys(M.ptrs);
      if (ids.length === 1) drag = { x: e.clientX, y: e.clientY }; else if (ids.length === 2) { drag = null; pinch = dist(); }
    });
    mapEl.addEventListener("pointermove", function (e) {
      if (!M.ptrs[e.pointerId]) return;
      M.ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(M.ptrs);
      if (ids.length === 2 && pinch) { var d = dist(); if (d > pinch * 1.5) { zoomBy(1); pinch = d; } else if (d < pinch / 1.5) { zoomBy(-1); pinch = d; } }
      else if (drag) { panBy(drag.x - e.clientX, drag.y - e.clientY); drag = { x: e.clientX, y: e.clientY }; }
    });
    function up(e) { delete M.ptrs[e.pointerId]; var ids = Object.keys(M.ptrs); pinch = null; drag = ids.length === 1 ? { x: M.ptrs[ids[0]].x, y: M.ptrs[ids[0]].y } : null; }
    mapEl.addEventListener("pointerup", up); mapEl.addEventListener("pointercancel", up);
    function dist() { var k = Object.keys(M.ptrs), a = M.ptrs[k[0]], b = M.ptrs[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; }
    var wheelT = 0;
    mapEl.addEventListener("wheel", function (e) { e.preventDefault(); var n = Date.now(); if (n - wheelT < 150) return; wheelT = n; zoomBy(e.deltaY < 0 ? 1 : -1); }, { passive: false });
    mapEl.addEventListener("keydown", function (e) {
      if (e.target !== mapEl) return;
      var k = e.key, d = 80;
      if (k === "ArrowLeft") panBy(-d, 0); else if (k === "ArrowRight") panBy(d, 0); else if (k === "ArrowUp") panBy(0, -d); else if (k === "ArrowDown") panBy(0, d);
      else if (k === "+" || k === "=") zoomBy(1); else if (k === "-" || k === "_") zoomBy(-1); else return;
      e.preventDefault();
    });
    mapEl.addEventListener("click", function (e) {
      var z = e.target.closest("[data-z]"); if (z) { zoomBy(+z.getAttribute("data-z")); return; }
      var mk = e.target.closest(".mk"); if (mk) { select(mk.getAttribute("data-id"), false); renderAll(); }
    });
    if (window.ResizeObserver) new ResizeObserver(function () { drawMap(); }).observe(mapEl);
  }
  function panBy(dx, dy) { var c = proj(M.lat, M.lon, M.z), p = unproj(c.x + dx, c.y + dy, M.z); M.lat = Math.max(-80, Math.min(80, p.lat)); M.lon = p.lon; drawMap(); }
  function zoomBy(d) { M.z = Math.max(5, Math.min(18, M.z + d)); drawMap(); }
  function fit(which) {
    var list = which === "all" ? PLACES : (which === "목포" ? PLACES.filter(function (p) { return p.currentAddress.indexOf("목포") >= 0; }) : PLACES.filter(function (p) { return p.region === which; }));
    list = list.filter(hasCoord);
    if (!list.length) return;
    var la = list.map(function (p) { return p.coordinate.latitude; }), lo = list.map(function (p) { return p.coordinate.longitude; });
    var minLa = Math.min.apply(null, la), maxLa = Math.max.apply(null, la), minLo = Math.min.apply(null, lo), maxLo = Math.max.apply(null, lo);
    var w = Math.max(mapEl.clientWidth, 200) - 120, h = Math.max(mapEl.clientHeight, 200) - 120, z = 18;
    for (; z > 5; z--) { var a = proj(maxLa, minLo, z), b = proj(minLa, maxLo, z); if (b.x - a.x <= w && b.y - a.y <= h) break; }
    M.z = Math.min(z, 16); M.lat = (minLa + maxLa) / 2; M.lon = (minLo + maxLo) / 2; drawMap();
  }
  function centerOn(p) { if (!hasCoord(p)) { toast("이 장소는 아직 좌표가 없어 지도에 표시되지 않습니다. 주소: " + p.currentAddress); return; } M.lat = p.coordinate.latitude; M.lon = p.coordinate.longitude; if (M.z < 13) M.z = 14; drawMap(); }
  function drawMap() {
    if (!markersEl) return;
    var W = mapEl.clientWidth, H = mapEl.clientHeight; if (!W || !H) return;
    var c = proj(M.lat, M.lon, M.z), z = Math.round(M.z), n = Math.pow(2, z), keep = {};
    var x0 = Math.floor((c.x - W / 2) / 256), x1 = Math.floor((c.x + W / 2) / 256), y0 = Math.floor((c.y - H / 2) / 256), y1 = Math.floor((c.y + H / 2) / 256);
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) {
      if (ty < 0 || ty >= n) continue;
      var wx = ((tx % n) + n) % n, key = z + "/" + wx + "/" + ty + "@" + tx, img = M.tiles[key];
      if (!img) {
        img = document.createElement("img"); img.alt = ""; img.draggable = false;
        img.onerror = function () { this.remove(); M.tileFail = true; $("#mapMsg").hidden = false; };
        img.src = "https://tile.openstreetmap.org/" + z + "/" + wx + "/" + ty + ".png";
        tilesEl.appendChild(img); M.tiles[key] = img;
      }
      img.style.left = Math.round(tx * 256 - c.x + W / 2) + "px"; img.style.top = Math.round(ty * 256 - c.y + H / 2) + "px"; keep[key] = 1;
    }
    Object.keys(M.tiles).forEach(function (k) { if (!keep[k]) { M.tiles[k].remove(); delete M.tiles[k]; } });

    var steps = courseSteps(), num = {};
    if (steps) steps.forEach(function (s, i) { (num[s.placeId] = num[s.placeId] || []).push(i + 1); });
    var html = "", svg = "";
    mapPlaces().forEach(function (p) {
      var q = toPx(p.coordinate.latitude, p.coordinate.longitude);
      if (p.status !== "현존") svg += '<circle cx="' + q.x + '" cy="' + q.y + '" r="26" fill="none" stroke="#8a5a2b" stroke-width="2" stroke-dasharray="4 4"/>';
      html += '<button type="button" class="mk' + (ui.selected === p.id ? " sel" : "") + (isPicked(p.id) ? " pick" : "") + '" data-id="' + esc(p.id) + '" style="left:' + q.x + "px;top:" + q.y + 'px" aria-label="' + esc(p.name + (num[p.id] ? " (" + num[p.id].join(",") + "단계)" : "")) + '"><span class="n">' + (num[p.id] ? num[p.id].join(",") : "●") + '</span><span class="lab">' + esc(p.name) + "</span></button>";
    });
    if (steps) for (var i = 1; i < steps.length; i++) {
      var a = PLACE[steps[i - 1].placeId], b = PLACE[steps[i].placeId];
      if (!hasCoord(a) || !hasCoord(b)) continue;
      var pa = toPx(a.coordinate.latitude, a.coordinate.longitude), pb = toPx(b.coordinate.latitude, b.coordinate.longitude);
      svg += '<line data-line="' + effMode() + '" x1="' + pa.x + '" y1="' + pa.y + '" x2="' + pb.x + '" y2="' + pb.y + '" ' +
        (effMode() === "events" ? 'stroke="#8a5a2b" stroke-width="3" stroke-dasharray="9 7"' : 'stroke="#6b7a2a" stroke-width="4"') + "/>";
    }
    svgEl.innerHTML = svg; markersEl.innerHTML = html;
  }

  // ---------- 선택·상세 ----------
  function select(id, center) {
    ui.selected = id;
    if (center && PLACE[id]) centerOn(PLACE[id]);
  }
  function renderAll() {
    $("#pickCount").textContent = "담은 장소 " + state.picked.length;
    renderCards(); renderCourse(); drawMap();
    var sel = $(".card.sel"); if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }
  function openDetail(id) {
    var p = PLACE[id]; if (!p) return;
    ui.selected = id; $("#dlgTitle").textContent = p.name;
    var cur = p.photos.filter(function (x) { return x.type === "current"; }), past = p.photos.filter(function (x) { return x.type !== "current"; });
    var left = past.length ? past.map(photoFigure).join("") : pastMissingBox(p);
    var right = cur.length ? cur.map(photoFigure).join("") : '<div class="ph"><span>현재 사진 미등록</span></div>';
    var photos = p.status === "현존" && !past.length
      ? "<div><h4>현재 장소 자료사진</h4>" + right + "</div>"
      : '<div class="compare"><div><h4>과거 사진 · 흔적 자료</h4>' + left + "</div><div><h4>현재 장소 자료사진</h4>" + right + "</div></div>";
    var used = {}; p.coordinate.sourceIds.forEach(function (s) { used[s] = 1; }); p.facts.forEach(function (f) { f.sourceIds.forEach(function (s) { used[s] = 1; }); });
    p.photos.forEach(function (x) { used[x.sourceId] = 1; });
    var n = noteOf(id), pk = isPicked(id);
    $("#dlgBody").innerHTML =
      '<div class="meta"><span class="tag">' + esc(p.region) + '</span><span class="tag">' + esc(p.category) + '</span><span class="tag">' + esc(p.eventDate) + '</span><span class="tag">상태: ' + esc(p.status) + "</span>" + badge(p.coordinate.accuracy, "위치: ") + "</div>" +
      '<p class="names"><b>당시 지명</b> ' + esc(p.historicalName) + "<br><b>현재 지명</b> " + esc(p.currentName) + "<br><b>현재 주소</b> " + esc(p.currentAddress) + "</p>" +
      "<p>" + esc(p.summary) + "</p>" +
      '<p class="note-warn">위치 불확실성: ' + esc(p.coordinate.note) + "</p>" + photos +
      "<section><h3>사실과 근거</h3>" + p.facts.map(function (f) {
        return '<div class="fact">' + badge(f.confidence) + "<span>" + esc(f.text) + "</span>" +
          (f.sourceIds.length ? '<span class="srcs">출처: ' + f.sourceIds.map(srcLink).join(" · ") + "</span>" : '<span class="srcs">출처: 없음(교육용 구성)</span>') + "</div>";
      }).join("") + "</section>" +
      '<section><h3>원문 출처</h3><ul class="srcs">' + Object.keys(used).map(function (s) { return "<li>" + srcLink(s) + "</li>"; }).join("") + "</ul></section>" +
      '<p class="q">생각해 볼 질문: ' + esc(p.inquiryQuestion) + "</p>" +
      '<p class="srcs"><b>교사 메모</b> ' + esc(p.teacherNote) + "</p>" +
      '<div class="cardbtns"><button type="button" data-act="d-find" data-id="' + esc(id) + '">지도에서 현재 위치 찾기</button>' +
      '<button type="button" class="ghost" data-act="d-pick" data-id="' + esc(id) + '" aria-pressed="' + pk + '">' + (pk ? "수업에서 빼기" : "수업에 담기") + "</button></div>" +
      '<section class="note"><h3>탐구 기록</h3><p class="note-warn">학생 이름·학번 등 개인정보는 입력하지 마세요. 이 브라우저에만 저장되며 각 ' + MAXLEN + "자까지입니다.</p>" +
      FIELDS.map(function (f) { return '<label for="n-' + f[0] + '">' + f[1] + '</label><textarea id="n-' + f[0] + '" data-field="' + f[0] + '" data-id="' + esc(id) + '" maxlength="' + MAXLEN + '">' + esc(n[f[0]]) + "</textarea>"; }).join("") +
      '<p class="savemsg" id="saveMsg" role="status"></p></section>';
    var d = $("#dlg"); if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
    $("#dlgBody").scrollTop = 0; renderAll();
  }

  // ---------- CSV · 인쇄 ----------
  function csvCell(v) {
    var s = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function placeSources(p) {
    var u = {}; p.coordinate.sourceIds.forEach(function (s) { u[s] = 1; }); p.facts.forEach(function (f) { f.sourceIds.forEach(function (s) { u[s] = 1; }); });
    return Object.keys(u).filter(function (s) { return SRC[s]; }).map(function (s) { return SRC[s].title + " " + SRC[s].url; }).join(" ; ");
  }
  function noteText(id) { var n = noteOf(id); return FIELDS.map(function (f) { return f[1] + ": " + n[f[0]]; }).join("\n"); }
  function buildCsv() {
    var rows = [["장소", "당시 지명", "현재 지명", "건물·장소 상태", "위치 확실성", "탐구 기록", "출처"]];
    PLACES.filter(function (p) { return isPicked(p.id); }).forEach(function (p) {
      rows.push([p.name, p.historicalName, p.currentName, p.status, CONF[p.coordinate.accuracy] + " — " + p.coordinate.note, noteText(p.id), placeSources(p)]);
    });
    return "﻿" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
  }
  function downloadCsv() {
    if (!state.picked.length) { toast("담은 장소가 없습니다. 먼저 '수업에 담기'를 눌러 주세요.", true); return; }
    var blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "역사장소카드_탐구기록.csv"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function buildPrint() {
    var ids = state.picked.length ? state.picked.slice() : (ui.selected ? [ui.selected] : []);
    var h = "", c = courseById(ui.course);
    if (!ids.length && !c) return "";
    if (c) h += '<section class="ws"><h2>' + esc(c.title) + '</h2><p><b>' + esc(CONF[c.confidence]) + '</b> — 실제 역사적 이동 경로가 아닙니다.</p>' + (c.events ? '<h4>시간순 단계(과거 사건 연결)</h4><ol>' +
      c.events.map(function (s) { return "<li>" + esc(s.label) + " — " + esc(PLACE[s.placeId].name) + "</li>"; }).join("") + '</ol>' : "") + '<h4>' + (c.events ? "현재 답사 순서" : "코스 순서") + '</h4><ol>' +
      c.tour.map(function (id) { return "<li>" + esc(PLACE[id].name) + "</li>"; }).join("") + '</ol><p class="caution">' + esc(c.disclaimer) + "</p></section>";
    ids.forEach(function (id) {
      var p = PLACE[id], n = noteOf(id);
      h += '<section class="ws"><h2>' + esc(p.name) + "</h2><p>" + esc(p.region) + " · " + esc(p.category) + " · " + esc(p.eventDate) + "</p>" +
        "<p><b>당시 지명</b> " + esc(p.historicalName) + "<br><b>현재 지명</b> " + esc(p.currentName) + "<br><b>장소 상태</b> " + esc(p.status) + "</p>" +
        '<div class="caution"><b>위치 정확도: ' + esc(CONF[p.coordinate.accuracy]) + "</b><br>" + esc(p.coordinate.note) + "</div>" +
        "<h4>탐구 질문</h4><p>" + esc(p.inquiryQuestion) + "</p>" +
        FIELDS.map(function (f) { return "<h4>" + f[1] + '</h4><div class="box">' + esc(n[f[0]]) + "</div>"; }).join("") +
        "<h4>핵심 사실과 출처</h4><ul>" + p.facts.map(function (f) { return "<li>[" + esc(CONF[f.confidence]) + "] " + esc(f.text) + (f.sourceIds.length ? " (출처: " + f.sourceIds.filter(function (s) { return SRC[s]; }).map(function (s) { return esc(SRC[s].title); }).join(", ") + ")" : "") + "</li>"; }).join("") + "</ul></section>";
    });
    return h + '<p style="font-size:9pt">제작 · 히스토리아쌤 · 출처 원문은 접속 확인 필요 상태일 수 있습니다.</p>';
  }
  function doPrint() {
    var h = buildPrint(); if (!h) { toast("담은 장소가 없습니다. 장소를 담거나 선택한 뒤 인쇄하세요.", true); return; }
    $("#printArea").innerHTML = h; window.print();
  }

  // ---------- 내 코스 만들기 ----------
  var draft = { title: "", tour: [], question: "" };
  function renderMyCourse() {
    var body = $("#mcBody"), pickedLeft = state.picked.filter(function (id) { return draft.tour.indexOf(id) < 0; });
    body.innerHTML =
      '<label for="mcTitle">코스 이름 (40자까지)</label><input id="mcTitle" type="text" maxlength="40" value="' + esc(draft.title) + '" autocomplete="off">' +
      "<h3>코스 순서 (" + draft.tour.length + "곳)</h3>" +
      (draft.tour.length ? '<ol id="mcList">' + draft.tour.map(function (id, i) {
        return "<li><span>" + esc(PLACE[id].name) + '</span> <button type="button" class="ghost" data-mc="up" data-i="' + i + '" aria-label="위로">↑</button><button type="button" class="ghost" data-mc="down" data-i="' + i + '" aria-label="아래로">↓</button><button type="button" class="ghost" data-mc="del" data-i="' + i + '" aria-label="뺌">✕</button></li>';
      }).join("") + "</ol>" : '<p class="note-warn">아래 "수업에 담은 장소"에서 추가하세요. 먼저 카드에서 장소를 담아야 합니다.</p>') +
      "<h3>수업에 담은 장소</h3>" + (pickedLeft.length ? '<ul class="mc-add">' + pickedLeft.map(function (id) { return "<li><span>" + esc(PLACE[id].name) + '</span> <button type="button" data-mc="add" data-id="' + esc(id) + '">추가</button></li>'; }).join("") + "</ul>" : "<p>추가할 장소가 없습니다.</p>") +
      '<label for="mcQuestion">코스 질문 (200자까지, 개인정보 입력 금지)</label><textarea id="mcQuestion" maxlength="200">' + esc(draft.question) + "</textarea>" +
      '<div class="cardbtns"><button type="button" data-mc="save"' + (draft.tour.length < 2 ? " disabled" : "") + ">코스 저장 (2곳 이상)</button></div>" +
      "<h3>저장한 내 코스</h3>" + (state.myCourses.length ? '<ul class="mc-add">' + state.myCourses.map(function (m) { return "<li><span>" + esc(m.title) + " (" + m.tour.length + '곳)</span> <button type="button" class="ghost" data-mc="remove" data-id="' + esc(m.id) + '">삭제</button></li>'; }).join("") + "</ul>" : "<p>아직 없습니다.</p>");
  }
  function openMyCourse() { renderMyCourse(); var d = $("#courseDlg"); if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); } }
  function bindMyCourse() {
    $("#btnMyCourse").addEventListener("click", openMyCourse);
    $("#mcClose").addEventListener("click", function () { $("#courseDlg").close(); });
    $("#mcBody").addEventListener("input", function (e) {
      if (e.target.id === "mcTitle") draft.title = e.target.value.slice(0, 40);
      if (e.target.id === "mcQuestion") draft.question = e.target.value.slice(0, 200);
    });
    $("#mcBody").addEventListener("click", function (e) {
      var b = e.target.closest("[data-mc]"); if (!b) return;
      var act = b.getAttribute("data-mc"), i = +b.getAttribute("data-i"), id = b.getAttribute("data-id");
      if (act === "add") draft.tour.push(id);
      else if (act === "del") draft.tour.splice(i, 1);
      else if (act === "up" && i > 0) { var t = draft.tour[i]; draft.tour[i] = draft.tour[i - 1]; draft.tour[i - 1] = t; }
      else if (act === "down" && i < draft.tour.length - 1) { var u = draft.tour[i]; draft.tour[i] = draft.tour[i + 1]; draft.tour[i + 1] = u; }
      else if (act === "save") {
        if (draft.tour.length < 2) return;
        if (state.myCourses.length >= 20) { toast("내 코스는 20개까지 저장할 수 있습니다.", true); return; }
        var m = { id: "my-" + Date.now().toString(36), title: (draft.title.trim() || "내 코스 " + (state.myCourses.length + 1)), tour: draft.tour.slice(), question: draft.question };
        state.myCourses.push(m); save(); fillCourseSelect(); ui.course = m.id; ui.step = 0; $("#courseSel").value = m.id;
        draft = { title: "", tour: [], question: "" }; toast("내 코스를 저장했습니다."); $("#courseDlg").close();
        var s = courseSteps(); if (s) select(s[0].placeId, true); renderAll(); return;
      } else if (act === "remove") { state.myCourses = state.myCourses.filter(function (x) { return x.id !== id; }); if (ui.course === id) ui.course = ""; save(); fillCourseSelect(); renderAll(); }
      renderMyCourse();
    });
  }

  // ---------- 이벤트 ----------
  function bind() {
    $("#q").addEventListener("input", function (e) { ui.q = e.target.value; renderAll(); });
    $("#fRegion").addEventListener("change", function (e) { ui.region = e.target.value; fillDistricts(); renderAll(); });
    $("#fDistrict").addEventListener("change", function (e) { ui.district = e.target.value; renderAll(); });
    $("#fEvent").addEventListener("change", function (e) { ui.event = e.target.value; renderAll(); });
    $("#fLevel").addEventListener("change", function (e) { ui.level = e.target.value; ui.showSensitive = false; try { localStorage.setItem("hc.level", ui.level); } catch (_) {} renderAll(); });
    $("#cards").addEventListener("click", function (e) { if (e.target.id === "btnShowSens") { ui.showSensitive = true; renderAll(); } });
    $("#fGroup").addEventListener("change", function (e) { ui.group = e.target.value; renderAll(); });
    $("#fEra").addEventListener("change", function (e) { ui.era = e.target.value; renderAll(); });
    $("#fCat").addEventListener("change", function (e) { ui.cat = e.target.value; renderAll(); });
    $("#fStatus").addEventListener("change", function (e) { ui.status = e.target.value; renderAll(); });
    $("#fPicked").addEventListener("change", function (e) { ui.picked = e.target.checked; renderAll(); });
    $("#btnReset").addEventListener("click", function () {
      ui.q = ui.region = ui.district = ui.event = ui.group = ui.era = ui.cat = ui.status = ""; ui.picked = false;
      $("#q").value = ""; $("#fEra").value = ""; $("#fRegion").value = ""; $("#fEvent").value = ""; $("#fGroup").value = ""; fillDistricts(); $("#fCat").value = ""; $("#fStatus").value = ""; $("#fPicked").checked = false; renderAll();
    });
    $("#courseSel").addEventListener("change", function (e) { ui.course = e.target.value; ui.step = 0; if (ui.course) { var s = courseSteps(); select(s[0].placeId, true); } renderAll(); });
    Array.prototype.forEach.call(document.querySelectorAll("input[name=mode]"), function (r) {
      r.addEventListener("change", function () { if (r.checked) { ui.mode = r.value; var s = courseSteps(); if (s) select(s[Math.min(ui.step, s.length - 1)].placeId, true); renderAll(); } });
    });
    $("#stepPrev").addEventListener("click", function () { goStep(ui.step - 1); });
    $("#stepNext").addEventListener("click", function () { goStep(ui.step + 1); });
    $("#coursePanel").addEventListener("click", function (e) { var b = e.target.closest("[data-step]"); if (b) goStep(+b.getAttribute("data-step")); });
    document.querySelector(".maptools").addEventListener("click", function (e) { var b = e.target.closest("[data-fit]"); if (b) fit(b.getAttribute("data-fit")); });
    $("#btnCsv").addEventListener("click", downloadCsv);
    $("#btnPrint").addEventListener("click", doPrint);
    $("#dlgClose").addEventListener("click", function () { $("#dlg").close(); });
    $("#dlg").addEventListener("click", function (e) { if (e.target === this) this.close(); });
    $("#cards").addEventListener("click", function (e) {
      var card = e.target.closest(".card"); if (!card) return;
      var id = card.getAttribute("data-id"), act = e.target.closest("[data-act]");
      if (act && act.getAttribute("data-act") === "detail") return openDetail(id);
      if (act && act.getAttribute("data-act") === "pick") return togglePick(id);
      select(id, !!(act && act.getAttribute("data-act") === "find")); renderAll();
      if (act) mapEl.scrollIntoView({ block: "nearest" });
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-act]"); if (!a) return;
      var act = a.getAttribute("data-act"), id = a.getAttribute("data-id");
      if (act === "retry") {
        var wrap = a.parentNode, src = a.getAttribute("data-src"), orig = a.getAttribute("data-source"), img = document.createElement("img");
        img.className = "hc-img"; img.alt = "재시도"; img.setAttribute("data-src", src); img.setAttribute("data-source", orig); img.src = src;
        wrap.innerHTML = ""; wrap.appendChild(img);
      } else if (act === "d-find") { $("#dlg").close(); select(id, true); renderAll(); mapEl.scrollIntoView({ block: "center" }); mapEl.focus(); }
      else if (act === "d-pick") { togglePick(id); openDetail(id); }
    });
    $("#dlgBody").addEventListener("input", function (e) {
      var t = e.target; if (!t.matches("textarea[data-field]")) return;
      var id = t.getAttribute("data-id"), f = t.getAttribute("data-field");
      state.notes[id] = noteOf(id); state.notes[id][f] = t.value.slice(0, MAXLEN);
      var ok = save(); var m = $("#saveMsg"); if (m) { m.className = "savemsg" + (ok ? "" : " err"); m.textContent = ok ? "저장됨" : "저장하지 못했습니다"; }
    });
  }

  function init() {
    PLACES.forEach(function (p) { p.events = HC.eventsOf(p); p.districtKey = HC.districtKey(p); });
    HC.eventList.forEach(function (ev) {
      var n = PLACES.filter(function (p) { return p.events.indexOf(ev.name) >= 0; }).length, o = document.createElement("option");
      o.value = ev.name; o.textContent = ev.name + " (" + n + ")"; $("#fEvent").appendChild(o);
    });
    fillDistricts();
    HC.eras.forEach(function (name) {
      var n = PLACES.filter(function (p) { return p.era === name; }).length, o = document.createElement("option");
      o.value = name; o.textContent = name + (n ? "" : " (준비 중)"); $("#fEra").appendChild(o);
    });
    HC.categories.forEach(function (name) {
      var n = PLACES.filter(function (p) { return p.category === name; }).length, o = document.createElement("option");
      o.value = name; o.textContent = name + (n ? "" : " (준비 중)"); $("#fCat").appendChild(o);
    });
    try { var lv = localStorage.getItem("hc.level"); if (lv && HC.levels.indexOf(lv) >= 0) { ui.level = lv; $("#fLevel").value = lv; } } catch (_) {}
    load(); fillCourseSelect(); initMap(); bind(); renderAll(); fit("all");
    bindMyCourse();
    window.HC_TEST = { csvCell: csvCell, buildCsv: buildCsv, buildPrint: buildPrint, state: function () { return state; } };
  }
  init();
})();
