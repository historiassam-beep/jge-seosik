// 인터넷이 되는 PC에서 실행: node tests/verify-sources.js
// 각 출처·사진 URL이 열리는지(HTTP 상태, 페이지 제목)를 표로 보여 준다. 내용 검증은 사람이 해야 한다.
global.window = {}; require("../data/sources.js"); require("../data/places.js");
const { sources, places } = window.HC;
async function probe(url) {
  try {
    const r = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (history-cards verify)" }, signal: AbortSignal.timeout(15000) });
    const t = await r.text(), m = t.match(/<title[^>]*>([^<]*)/i);
    return r.status + " " + (m ? m[1].trim().slice(0, 50) : (r.headers.get("content-type") || ""));
  } catch (e) { return "실패 " + (e.cause && e.cause.code || e.message); }
}
(async () => {
  console.log("== 출처 =="); for (const s of sources) console.log(s.id.padEnd(14), (await probe(s.url)).padEnd(60), s.checkedAt);
  console.log("== 사진 =="); for (const p of places) for (const x of p.photos) if (x.url) console.log(p.id.padEnd(12), (await probe(x.url)).padEnd(40), x.shootingYear, x.license);
})();
