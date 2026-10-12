"""여순사건 유적지 목록(사용자 제공 텍스트 → history-cards/data/research/yeosun_sites.csv) → 장소 데이터.
사용: python3 -I scripts/import_yeosun.py
이름·주소만 있고 설명·좌표는 원본에 없다. CSV의 위도·경도 열이 비어 있으면 null(지도 비표시)."""
import csv, json
rows = list(csv.DictReader(open("history-cards/data/research/yeosun_sites.csv", encoding="utf-8-sig")))
assert len(rows) == 97
out = []
for r in rows:
    sg, no, name, raw, full = r["시군"], r["번호"], r["사적지명"], r["주소_원문"], r["주소_전체"]
    la, lo = r["위도"].strip(), r["경도"].strip(); ok = bool(la and lo)
    region = "경남" if full.startswith("경상남도") else "전남"
    tags = ["여순사건", "여순사건 유적지", sg]
    if "학살" in name or "암매장" in name or "공동묘지" in name or "희생자" in name: tags.append("희생 관련 장소")
    out.append({
        "id": "ys-%s-%02d" % ({"여수시": "yeosu", "순천시": "suncheon", "광양시": "gwangyang", "구례군": "gurye", "보성군": "boseong", "고흥군": "goheung"}[sg], int(no)),
        "name": name, "region": region, "category": "여순사건", "era": "근현대", "tags": tags,
        "eventDate": "1948년 (여순사건)",
        "historicalName": "(자료에 별도 표기 없음)", "currentName": "(자료에 별도 표기 없음)",
        "currentAddress": full or "주소 미기재(여수시 목록)", "status": "현장 확인 필요",
        "coordinate": {"latitude": float(la) if ok else None, "longitude": float(lo) if ok else None, "accuracy": "PROBABLE",
                       "note": ("주소를 변환한 좌표입니다. 유적의 정확한 지점과 다를 수 있어 현장 확인이 필요합니다." if ok else "원본 목록에 좌표가 없어 지도에 표시하지 않습니다. 주소를 좌표로 바꾼 뒤 현장에서 대조해야 합니다.") + (" 비고: " + r["비고"] if r["비고"] else ""), "sourceIds": ["ys-list"]},
        "summary": "여순사건 유적지 목록의 " + sg + " " + no + "번 장소입니다. 사건 설명은 아직 입력하지 않았습니다(원문에서 확인 필요).",
        "facts": [{"confidence": "FACT", "text": "여순사건 유적지 목록(사용자 제공)에 " + sg + " " + no + "번 '" + name + "'으로 올라 있으며, 목록 표기 주소는 '" + (raw or "(주소 없음)") + "'입니다.", "sourceIds": ["ys-list"]}],
        "photos": [],
        "inquiryQuestion": "이 장소가 여순사건과 어떻게 관련되는지 원문에서 근거를 찾고, 더 확인해야 할 점을 정리해 봅시다.",
        "teacherNote": "목록에서 이름·주소만 옮긴 초안입니다. 민간인 희생과 관련된 장소가 많으니 자극적인 사진·표현을 피하고 추모와 진상 이해의 관점에서 다루세요. 사건 설명과 사진은 원문 확인 후 보강하세요."})
open("history-cards/data/places_yeosun.js", "w", encoding="utf-8").write(
    "// scripts/import_yeosun.py로 생성. 직접 고치지 말고 research CSV를 고친 뒤 다시 생성할 것.\n"
    "window.HC.places = window.HC.places.concat(" + json.dumps(out, ensure_ascii=False, indent=1) + ");\n")
print(len(out), "곳 생성")
