"""전남 5·18 사적지 목록(제공 PDF 캡처를 옮긴 CSV) → history-cards/data/places_518jn.js
설명·좌표가 원본에 없으므로 만들어 내지 않는다. 좌표는 null(지도에 표시하지 않음)."""
import csv, json
rows = list(csv.DictReader(open("history-cards/data/research/518_jeonnam_sites.csv", encoding="utf-8")))
assert len(rows) == 29
out = []
for i, r in enumerate(rows, 1):
    raw = r["주소_원문"].strip(); full = r["주소_전체"].strip()
    la, lo = r.get("위도", "").strip(), r.get("경도", "").strip(); ok = bool(la and lo)
    out.append({
        "id": "518jn-%02d" % i, "name": r["사적지명"], "region": "전남", "category": "5·18", "era": "근현대",
        "tags": ["5·18", "전남 5·18사적지", r["호수"], r["시군"]],
        "eventDate": "1980년 5월 (5·18사적지 지정)",
        "historicalName": "(자료에 별도 표기 없음)", "currentName": "(자료에 별도 표기 없음)",
        "currentAddress": full, "status": "현장 확인 필요",
        "coordinate": {"latitude": float(la) if ok else None, "longitude": float(lo) if ok else None, "accuracy": "PROBABLE",
                       "note": ("주소를 변환한 좌표입니다. 사적지의 정확한 지점과 다를 수 있어 현장 확인이 필요합니다." if ok else "원본 목록에 좌표가 없어 지도에 표시하지 않습니다. 주소를 좌표로 바꾼 뒤 현장에서 대조해야 합니다."), "sourceIds": ["518org-jn"]},
        "summary": "전남 5·18사적지 " + r["호수"] + "입니다. 사건 설명은 아직 입력하지 않았습니다(원문에서 확인 필요).",
        "facts": [{"confidence": "FACT", "text": "전남 5·18사적지 목록(전체 29건)에 '" + r["호수"] + " 5·18사적지'로 등록되어 있으며, 원문 표기 주소는 '" + raw + "'입니다.", "sourceIds": ["518org-jn"]}],
        "photos": [],
        "inquiryQuestion": "광주 밖 전남 지역에도 5·18과 관련된 장소가 있는 이유는 무엇일까요? 이 장소가 어떤 일과 관련되는지 원문에서 찾아봅시다.",
        "teacherNote": "사적지 목록에서 이름과 주소만 옮긴 초안입니다. 사건 설명과 사진은 원문 확인 후 보강하세요(사진은 공공누리 4유형: 출처표시·비상업적·변경금지)."})
open("history-cards/data/places_518jn.js", "w", encoding="utf-8").write(
    "// scripts/import_518_jeonnam.py로 생성(제공 PDF 캡처 29건). 직접 고치지 말 것.\n"
    "window.HC.places = window.HC.places.concat(" + json.dumps(out, ensure_ascii=False, indent=1) + ");\n")
print(len(out), "곳 생성")
