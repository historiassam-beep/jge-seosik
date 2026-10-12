"""독립기념관 '국내사적지 위치정보' CSV에서 광주·전남 사적지를 뽑아 history-cards 데이터로 만든다.
사용: python3 -I scripts/import_ik_sites.py <위치정보.csv>
- 원본 설명을 그대로 쓰고 사실을 새로 만들지 않는다. 이미 손으로 만든 장소는 건너뛴다.
"""
import csv, io, json, re, sys

SKIP = {142, 151, 269, 144, 285, 286}  # 수피아, 작은장터, 옛 광주역, 옛 전남도청, 목포 동척·영사관(places.js에 수동 입력)

def rd(p):
    b = open(p, "rb").read()
    for enc in ("utf-8-sig", "cp949"):
        try: return b.decode(enc)
        except UnicodeDecodeError: pass
    raise SystemExit("인코딩 오류")

def sp(s): return re.sub(r"\s+", " ", (s or "").strip())

rows = list(csv.DictReader(io.StringIO(rd(sys.argv[1]))))
keep = [r for r in rows if sp(r["주소_시도"]) in ("광주광역시", "전라남도")]
out_csv = io.StringIO(); w = csv.writer(out_csv)
w.writerow(["번호", "사적지명", "시도", "시군구", "주소_세부", "경도", "위도", "등록일", "운동계열", "설명"])
places = []
for r in keep:
    n = int(r["번호"]); name = sp(r["사적지명"]); sido = sp(r["주소_시도"]); gu = sp(r["주소_시군구"]); det = sp(r["주소_세부"])
    w.writerow([n, name, sido, gu, det, r["경도"], r["위도"], r["등록일"], sp(r["운동계열"]), sp(r["설명"])])
    if n in SKIP: continue
    lon, lat = float(r["경도"]), float(r["위도"])
    region = "광주" if sido.startswith("광주") else "전남"
    tags = [t for t in re.split(r"[/]", sp(r["운동계열"])) if t] + ["독립기념관 국내사적지"]
    places.append({
        "id": "ik-%d" % n, "name": name, "region": region, "category": "독립운동", "era": "근현대", "tags": tags,
        "eventDate": "설명 참조",
        "historicalName": "(자료에 별도 표기 없음)", "currentName": det or "(자료에 별도 표기 없음)",
        "currentAddress": " ".join(x for x in (sido, gu, det) if x), "status": "현장 확인 필요",
        "coordinate": {"latitude": lat, "longitude": lon, "accuracy": "PROBABLE",
                       "note": "독립기념관 국내사적지 위치정보(2016-11-17) 대표 좌표입니다. 정확한 지점과 현재 상태는 현장 확인이 필요합니다.", "sourceIds": ["ik-sites"]},
        "summary": sp(r["설명"]),
        "facts": [{"confidence": "FACT", "text": "독립기념관 국내사적지 목록(" + sp(r["등록일"]) + " 등록, 운동계열: " + sp(r["운동계열"]) + ")의 설명: " + sp(r["설명"]), "sourceIds": ["ik-sites"]}],
        "photos": [],
        "inquiryQuestion": "설명 문장에서 이 장소가 사건과 관련된 근거를 찾고, 더 확인해야 할 점을 말해 봅시다.",
        "teacherNote": "독립기념관 사적지 목록으로 만든 초안입니다. 사건 세부 설명과 사진은 원문 확인 후 보강하세요."})
open("history-cards/data/research/ik_sites_gwangju_jeonnam.csv", "w", encoding="utf-8-sig", newline="").write(out_csv.getvalue())
open("history-cards/data/places_ik.js", "w", encoding="utf-8").write(
    "// scripts/import_ik_sites.py로 생성. 직접 고치지 말고 스크립트 또는 원본 CSV를 고칠 것.\n"
    "window.HC.places = window.HC.places.concat(" + json.dumps(places, ensure_ascii=False, indent=1) + ");\n")
print("광주·전남 사적지", len(keep), "곳 중 신규 장소", len(places), "곳 생성")
