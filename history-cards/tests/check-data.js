// 데이터 점검: node tests/check-data.js
global.window = {};
require("../data/sources.js"); require("../data/places.js");
const { places, sources, courses } = window.HC;
const err = [];
const unverified = sources.filter(s => /미확인/.test(s.checkedAt)).length, noUrl = places.reduce((n, p) => n + p.photos.filter(x => !x.url).length, 0);
const ids = new Set(places.map(p => p.id)), sids = new Set(sources.map(s => s.id));
if (ids.size !== places.length) err.push("장소 id 중복");
if (places.length < 9) err.push("장소 9곳 미만");
const need = ["sufia","market1919","oldstation","chonnam","geumnam","doncheong","nokdu","mokpo1","mokpo2"];
need.forEach(i => { if (!ids.has(i)) err.push("필수 장소 없음 " + i); });
const ST = ["현존","변형","용도 변경","건물 소멸","장소 기능 소멸","현장 확인 필요"], CF = ["FACT","PROBABLE","RECONSTRUCTED"];
places.forEach(p => {
  ["name","region","category","eventDate","historicalName","currentName","currentAddress","summary","inquiryQuestion","teacherNote"].forEach(k => { if (!p[k]) err.push(p.id + " 빈 필드 " + k); });
  if (!ST.includes(p.status)) err.push(p.id + " status");
  if (!["광주","전남"].includes(p.region)) err.push(p.id + " region");
  if (!window.HC.categories.includes(p.category)) err.push(p.id + " category");
  if (!["FACT","PROBABLE"].includes(p.coordinate.accuracy)) err.push(p.id + " accuracy");
  const c = p.coordinate; if (!(c.latitude > 33 && c.latitude < 39 && c.longitude > 124 && c.longitude < 130)) err.push(p.id + " 좌표 범위");
  [...c.sourceIds, ...p.facts.flatMap(f => f.sourceIds), ...p.photos.map(x => x.sourceId)].forEach(s => { if (!sids.has(s)) err.push(p.id + " 없는 출처 " + s); });
  p.facts.forEach(f => { if (!CF.includes(f.confidence)) err.push(p.id + " confidence"); if (f.confidence !== "RECONSTRUCTED" && !f.sourceIds.length) err.push(p.id + " 출처 없는 사실"); });
  if (!window.HC.categories.includes(p.category)) err.push("cat");
  p.photos.forEach(x => { if (x.type === "trace" && /역사사진|1980년 당시 사진/.test(x.caption) && !x.warning) err.push(p.id + " 표지석 경고 없음"); });
  if (p.status !== "현존" && p.photos.some(x => x.type === "current") && !p.photos.some(x => x.type !== "current") && !/미확보|미등록/.test(JSON.stringify(p.photos))) { /* UI가 과거 사진 미확보를 표시 */ }
});
// 장소 기능 소멸 장소에 현재 건물 사진만 있는 경우를 UI가 '과거 사진 미확보'로 표시하는지는 e2e에서 확인
courses.forEach(c => {
  [...c.events.map(e => e.placeId), ...c.tour].forEach(i => { if (!ids.has(i)) err.push(c.id + " 코스 장소 없음 " + i); });
  if (c.confidence !== "RECONSTRUCTED") err.push(c.id + " 코스는 교육용 구성");
});
const B = courses.find(c => c.id === "B").events.map(e => e.placeId).join();
if (B !== "nokdu,chonnam,geumnam,doncheong") err.push("코스 B 순서 오류");
const m2 = places.find(p => p.id === "mokpo2"); if (!/1920~1921/.test(m2.eventDate)) err.push("2관 연도 표기");
const nk = places.find(p => p.id === "nokdu"); if (!nk.photos.some(x => x.type === "trace" && x.shootingYear === "2018" && x.warning)) err.push("녹두서점 2018 사진");
sources.forEach(s => { if (!/^https?:\/\//.test(s.url)) err.push("출처 URL " + s.id); });
if (err.length) { console.error("실패:\n" + err.join("\n")); process.exit(1); }
console.log("[주의] 원문 미확인 출처 " + unverified + "건, 주소 미등록 사진 " + noUrl + "건");
console.log("데이터 점검 통과: 장소 " + places.length + ", 출처 " + sources.length + ", 코스 " + courses.length);
