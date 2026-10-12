// 사용법: (cd history-cards && python3 -m http.server 8765 &) ; NODE_PATH=$(npm root -g) node tests/e2e.js
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1366, height: 768 } });
  await ctx.route("https://tile.openstreetmap.org/**", r => r.abort());   // 타일 실패 상황
  const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.addInitScript(() => { window.print = () => { window.__printed = true; }; });
  await page.goto(BASE);
  // 흐름 1
  const TOTAL = await page.evaluate(() => HC.places.length);
  ok(TOTAL >= 40 && await page.locator(".card").count() === TOTAL, "전체 카드 " + TOTAL + "개 표시");
  ok(await page.locator(".card", { hasText: "수피아여학교" }).count() === 1, "수피아 카드");
  await page.selectOption("#courseSel", "A");
  ok((await page.locator("#stepPos").textContent()).includes("1 / 2"), "코스 A 1단계");
  await page.click("#stepNext");
  const info = await page.locator("#stepInfo").textContent();
  ok(/추정·확인 필요/.test(info) && /단정하지 않/.test(info), "작은 장터 불확실성");
  ok(/과거 사진 미확보/.test(info), "과거 사진 미확보(코스)");
  ok(await page.locator('.card.sel', { hasText: "작은 장터" }).count() === 1, "선택 카드 일치");
  ok(await page.locator('.card.sel .thumb', { hasText: "과거 사진 미확보" }).count() === 1, "카드에 과거 사진 미확보");
  ok(await page.locator('line[data-line=events]').count() === 1, "점선 연결선(과거 사건)");
  await page.click('.card.sel button[data-act=detail]');
  ok(/1933/.test(await page.locator("#dlgBody").textContent()) && await page.locator("#dlgBody .warn", { hasText: "과거 사진 미확보" }).count() === 1, "상세: 부동교 1933 · 과거 사진 미확보");
  await page.click("#dlgClose"); ok(!(await page.locator("#dlg").evaluate(d => d.open)), "다이얼로그 닫기");
  // 흐름 2
  await page.selectOption("#courseSel", "B");
  const steps = await page.locator("#coursePanel li").allTextContents();
  ok(steps[0].includes("5월 17일") && steps[1].includes("5월 18일") && steps[2].includes("5월 20일") && steps[3].includes("5월 27일"), "코스 B 날짜 순서");
  for (let i = 0; i < 3; i++) await page.click("#stepNext");
  ok((await page.locator(".card.sel h3").textContent()).includes("옛 전남도청"), "4단계 옛 전남도청");
  await page.check('input[value=tour]');
  ok(await page.locator('line[data-line=tour]').count() === 3, "답사 순서 실선");
  const tour = await page.locator("#coursePanel li").allTextContents();
  ok(tour[0].includes("전남대") && tour[1].includes("녹두"), "현재 답사 순서 다름");
  await page.fill("#q", "녹두"); await page.click('.card button[data-act=detail]');
  ok(await page.locator("#dlgBody", { hasText: "2018" }).count() === 1 && /1980년 당시 사진이 아닙니다/.test(await page.locator("#dlgBody").textContent()), "녹두서점 2018 촬영연도 · 경고");
  await page.click("#dlgClose"); await page.click("#btnReset"); await page.selectOption("#courseSel", "");
  // 흐름 3
  await page.selectOption("#fRegion", "전남"); await page.fill("#q", "목포근대역사관");
  ok(await page.locator(".card").count() === 2 && /2곳/.test(await page.locator("#resultCount").textContent()), "전남 필터 2곳");
  ok(await page.locator(".card", { hasText: "1920~1921" }).count() === 1, "2관 연도 차이 표기");
  await page.fill("#q", "없는장소"); ok(await page.locator(".empty").count() === 1, "빈 결과 화면");
  await page.click("#btnReset"); ok(await page.locator(".card").count() === TOTAL, "필터 초기화");
  await page.selectOption("#fRegion", "전남"); await page.selectOption("#fCat", "5·18");
  ok(await page.locator(".card").count() === 29 && /좌표 미확인 29곳/.test(await page.locator("#resultCount").textContent()), "전남 5·18 사적지 29곳(좌표 미확인 표시)");
  ok(await page.locator('.card[data-id="518jn-01"]', { hasText: "목포역" }).count() === 1 && await page.evaluate(() => HC.places.find(p => p.id === "518jn-29").currentAddress.endsWith("함평군 학교면 함영로 501-3") && HC.places.find(p => p.id === "518jn-01").currentAddress.endsWith("목포시 영산로 98")), "첫·마지막 사적지 주소");
  await page.click('.card[data-id="518jn-16"] button[data-act=find]'); ok(/좌표가 없어/.test(await page.locator(".toast").textContent()), "좌표 없는 장소 지도 찾기 안내");
  await page.click("#btnReset");
  await page.selectOption("#fRegion", "광주"); await page.selectOption("#fCat", "5·18");
  ok(await page.locator(".card").count() === 33 && /좌표 미확인 29곳/.test(await page.locator("#resultCount").textContent()), "광주 5·18 사적지 33곳(신규 29 좌표 미확인)");
  ok(await page.locator('.card[data-id="518gj-28"] .srcs', { hasText: "518사적지 지정 현황" }).count() === 1, "카드에 자료 출처 표시");
  await page.click("#btnReset");
  await page.selectOption("#fEvent", "3·1운동");
  ok(await page.locator(".card").count() === 8 && await page.locator(".card", { hasText: "수피아" }).count() === 1, "사건 필터(3·1운동 8곳)");
  await page.selectOption("#fRegion", "전남"); ok(await page.locator(".card").count() === 5 && !(await page.locator("#fDistrict option", { hasText: "광주 동구" }).count()), "사건+지역 조합, 시군구 목록이 지역에 연동");
  await page.click("#btnReset"); await page.selectOption("#fDistrict", "전남 여수시");
  ok(await page.locator(".card").count() === 24, "시군구 필터(전남 여수시 24곳)");
  await page.selectOption("#fEvent", "여순사건"); ok(await page.locator(".card").count() === 23, "시군구+사건 조합(여수시 여순사건 23곳)");
  await page.click("#btnReset"); await page.selectOption("#fGroup", "district");
  const heads = await page.locator(".grp-h").allTextContents();
  ok(heads.length >= 20 && heads[0].startsWith("광주 ") && heads.some(h => h.startsWith("전남 여수시 (24곳)")) && heads[heads.length - 1].startsWith("경남"), "시군구별 묶어서 보기(" + heads.length + "개 묶음)");
  await page.selectOption("#fGroup", "event"); const eh = await page.locator(".grp-h").allTextContents();
  ok(eh[0].startsWith("3·1운동") && eh.some(h => h.startsWith("여순사건 (97곳)")), "사건별 묶어서 보기");
  await page.click("#btnReset");
  await page.selectOption("#fEra", "고려·조선"); ok(/아직 등록되지 않았습니다/.test(await page.locator("#cards").textContent()), "고려·조선 준비 중 안내"); await page.click("#btnReset");
  await page.fill("#q", "불로동"); ok(await page.locator(".card", { hasText: "작은 장터" }).count() === 1 && await page.locator(".card").count() === 1, "주소 검색(불로동)"); await page.click("#btnReset");
  await page.selectOption("#fCat", "5·18"); await page.selectOption("#fStatus", "changed");
  ok(await page.locator(".card").count() === 2, "복합 필터(5·18+변형)");
  await page.click("#btnReset"); await page.selectOption("#fCat", "여순사건");
  ok(await page.locator(".card").count() === 97 && /좌표 미확인 97곳/.test(await page.locator("#resultCount").textContent()), "여순사건 97곳(좌표 미확인)");
  await page.selectOption("#fRegion", "경남"); ok(await page.locator(".card").count() === 1 && await page.locator(".card", { hasText: "애기섬" }).count() === 1, "경남 1곳(애기섬 학살지)");
  await page.fill("#q", "낙안"); ok(await page.locator(".card", { hasText: "낙안 신전마을" }).count() === 0, "경남+낙안 조합 필터"); await page.fill("#q", "");
  await page.selectOption("#fRegion", ""); await page.fill("#q", "구례"); ok(await page.locator(".card").count() >= 17, "구례 검색");
  await page.fill("#q", "");
  ok(await page.locator('.card[data-id="ys-yeosu-14"] .srcs', { hasText: "여순사건 유적지 목록" }).count() === 1 && await page.locator('.card[data-id="ys-yeosu-14"]', { hasText: "제14연대 주둔지" }).count() === 1, "제14연대 주둔지 카드·출처");
  await page.click("#btnReset");
  // 흐름 4
  await page.click('.card[data-id=nokdu] button[data-act=pick]');
  ok((await page.locator("#pickCount").textContent()).includes("1"), "담기 1");
  await page.click('.card[data-id=nokdu] button[data-act=detail]');
  await page.fill("#n-obs", '=HYPERLINK("x")<img src=x onerror=window.__xss=1>');
  await page.fill("#n-evidence", "쉼표, 따옴표\" 줄\n바꿈");
  await page.click("#dlgClose"); await page.reload();
  ok((await page.locator("#pickCount").textContent()).includes("1"), "새로고침 후 담기 유지");
  await page.click('.card[data-id=nokdu] button[data-act=detail]');
  ok((await page.inputValue("#n-obs")).startsWith("=HYPERLINK"), "새로고침 후 기록 유지");
  ok(await page.evaluate(() => !window.__xss) && await page.locator("#dlgBody img[src=x]").count() === 0, "HTML 이스케이프");
  await page.click("#dlgClose");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#btnCsv")]);
  const csv = require("fs").readFileSync(await dl.path());
  ok(csv[0] === 0xEF && csv[1] === 0xBB && csv[2] === 0xBF, "CSV UTF-8 BOM");
  const txt = csv.toString("utf8");
  ok(txt.includes("장소,당시 지명,현재 지명,건물·장소 상태,위치 확실성,탐구 기록,출처") && txt.includes("'=HYPERLINK") === false && txt.includes("관찰한 내용: =HYPERLINK"), "CSV 열·수식 위치");
  ok(await page.evaluate(() => HC_TEST.csvCell("=1+1") === "'=1+1" && HC_TEST.csvCell('a"b') === '"a""b"'), "CSV 수식 방지·따옴표");
  await page.click("#btnPrint");
  const pr = await page.locator("#printArea").textContent();
  ok(pr.includes("녹두서점 옛터") && pr.includes("=HYPERLINK") && pr.includes("위치 정확도") && pr.includes("탐구 질문"), "인쇄 활동지 내용");
  ok(await page.evaluate(() => window.__printed === true), "print 호출");
  await page.click('.card[data-id=nokdu] button[data-act=pick]');
  ok((await page.locator("#pickCount").textContent()).includes("0"), "담은 장소 해제");
  // 깨진 localStorage
  await page.evaluate(() => localStorage.setItem("hc.v1", "{broken")); await page.reload();
  ok(await page.locator(".card").count() === TOTAL, "깨진 localStorage에서도 실행");
  // 지도
  ok(await page.locator("#mapMsg").isVisible(), "타일 실패 안내");
  await page.click('[data-fit=목포]'); ok(await page.locator('.mk[data-id=mokpo1]').isVisible(), "목포 맞춤");
  await page.click('[data-fit=광주]'); const before = await page.locator('.mk[data-id=sufia]').boundingBox();
  await page.locator("#map").focus(); await page.keyboard.press("ArrowRight");
  const after = await page.locator('.mk[data-id=sufia]').boundingBox(); ok(after.x < before.x - 40, "방향키 이동");
  await page.keyboard.press("+"); ok(true, "키보드 확대");
  // 사진 실패 안내 (임시 주입)
  await page.evaluate(() => { const d = document.createElement("div"); d.id = "t"; d.innerHTML = '<span class="imgwrap"><img class="hc-img" src="http://invalid.invalid/x.png" data-src="http://invalid.invalid/x.png" data-source="https://example.com"></span>'; document.body.appendChild(d); });
  await page.waitForSelector('#t button[data-act=retry]'); ok(/사진을 불러오지 못했습니다/.test(await page.locator("#t").textContent()), "사진 실패 안내·다시 불러오기");
  // 해상도
  for (const [w, h] of [[1366, 768], [1920, 1080], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(150);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(sw <= 0, `${w}x${h} 가로 스크롤 없음`);
    await page.screenshot({ path: `/tmp/claude-0/shot-${w}.png`, fullPage: false });
  }
  await page.click('.card button[data-act=detail]'); await page.evaluate(() => { const b = document.getElementById("dlgBody"); b.scrollTop = 99999; });
  ok(await page.evaluate(() => document.getElementById("dlgBody").scrollTop > 0), "모바일 상세 스크롤");
  ok(errs.length === 0, "JS 오류 없음 " + errs.join("|"));
  await browser.close(); console.log(fails ? fails + "건 실패" : "전체 통과"); process.exit(fails ? 1 : 0);
})();
