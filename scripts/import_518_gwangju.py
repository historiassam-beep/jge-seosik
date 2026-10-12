"""전남광주통합특별시 '518사적지 지정 현황'(2026-02-06) CSV → 광주 5·18 사적지 장소 데이터.
사용: python3 -I scripts/import_518_gwangju.py <518사적지_지정현황.csv>
이미 수동 입력된 4곳(전남대 정문·금남로·도청·녹두서점)은 건너뛴다. 원본에 좌표가 없으므로 CSV의 위도·경도 열이 비어 있으면 null(지도 비표시)."""
import csv, io, json, os, re, sys
OUT = "history-cards/data/research/518_gwangju_sites.csv"
SKIP = {"1", "4", "5-1", "8"}
FIX = {"금 남 로": "금남로", "상 무 관": "상무관", "도 청": "도청"}
def rd(p):
    b = open(p, "rb").read()
    for enc in ("utf-8-sig", "cp949"):
        try: return b.decode(enc)
        except UnicodeDecodeError: pass
def sp(s): return re.sub(r"\s+", " ", (s or "").strip())
old = {}
if os.path.exists(OUT):
    for r in csv.DictReader(open(OUT, encoding="utf-8-sig")): old[r["번호"]] = (r["위도"], r["경도"], r.get("변환정확도", ""))
rows = []
for r in list(csv.reader(io.StringIO(rd(sys.argv[1]))))[1:]:
    if not r: continue
    first = sp(r[0])
    m = re.match(r"(\d+)\s+도청과 518민주광장(5-1)\s*(.*)", first)
    if m: no, name = m.group(2), m.group(3)
    else:
        m = re.match(r"(\d+(?:-\d+)?)\s*(.*)", first); no, name = m.group(1), m.group(2)
    name = FIX.get(name, name)
    if name.startswith("광목간"): name = name  # 원문 표기 유지
    loc = sp(r[2])
    rows.append([no, name, sp(r[1]), loc, "광주광역시 " + loc, *old.get(no, ("", "", ""))])
assert len(rows) == 33, len(rows)  # 번호 1~30, 5번은 5-1~5-4로 나뉨
w = csv.writer(open(OUT, "w", encoding="utf-8-sig", newline=""))
w.writerow(["번호", "사적지명", "지정사유", "세부위치", "주소_전체", "위도", "경도", "변환정확도"]); w.writerows(rows)
out = []
for no, name, why, loc, full, la, lo, acc in rows:
    if no in SKIP: continue
    ok = bool(la and lo)
    out.append({
        "id": "518gj-" + no, "name": name, "region": "광주", "category": "5·18", "era": "근현대",
        "tags": ["5·18", "광주 5·18사적지", "사적지 " + no + "번"], "eventDate": "1980년 5월 (5·18사적지 지정)",
        "historicalName": "(자료에 별도 표기 없음)", "currentName": "(자료에 별도 표기 없음)",
        "currentAddress": full, "status": "현장 확인 필요",
        "coordinate": {"latitude": float(la) if ok else None, "longitude": float(lo) if ok else None, "accuracy": "PROBABLE",
                       "note": ("주소를 변환한 좌표입니다(" + (acc or "정확도 미기재") + "). 사적지의 정확한 지점과 다를 수 있어 현장 확인이 필요합니다." if ok else "원본 목록에 좌표가 없어 지도에 표시하지 않습니다. 주소를 좌표로 바꾼 뒤 현장에서 대조해야 합니다."), "sourceIds": ["gj518-list"]},
        "summary": why,
        "facts": [{"confidence": "FACT", "text": "5·18 사적지 지정 현황(2026-02-06)에 " + no + "번 '" + name + "'으로 지정되어 있습니다. 지정 사유: " + why + " / 세부 위치: " + loc, "sourceIds": ["gj518-list"]}],
        "photos": [],
        "inquiryQuestion": "지정 사유를 근거로 이 장소가 5·18 때 어떤 역할을 했는지 설명해 봅시다. 더 확인해야 할 점은 무엇일까요?",
        "teacherNote": "사적지 지정 현황의 이름·사유·위치만 옮긴 초안입니다. 사건 세부와 사진은 원문 확인 후 보강하세요."})
open("history-cards/data/places_518gj.js", "w", encoding="utf-8").write(
    "// scripts/import_518_gwangju.py로 생성. 직접 고치지 말고 research CSV(위도·경도 열)를 채운 뒤 다시 생성할 것.\n"
    "window.HC.places = window.HC.places.concat(" + json.dumps(out, ensure_ascii=False, indent=1) + ");\n")
print(len(rows), "건 중 신규", len(out), "곳 생성")
