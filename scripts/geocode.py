"""주소 → 위도·경도 (인터넷이 되는 PC에서 실행). 카카오 로컬 API(REST 키 필요, 무료).
사용: KAKAO_REST_KEY=발급받은키 python3 scripts/geocode.py history-cards/data/research/518_jeonnam_sites.csv
- '주소_전체' 열을 읽어 비어 있는 '위도','경도' 열을 채워 같은 파일에 저장한다. 괄호 안 설명은 지우고 검색한다.
- 결과가 없거나 여러 개면 '확인필요' 메모를 stdout에 출력한다. 변환 좌표는 사적지 정확 지점이 아닐 수 있다.
- 키는 파일·저장소에 넣지 말 것. (이 스크립트는 이 환경에서 실행·검증하지 못했다)"""
import csv, json, os, re, sys, urllib.parse, urllib.request
key = os.environ.get("KAKAO_REST_KEY") or sys.exit("KAKAO_REST_KEY 환경변수를 설정하세요")
path = sys.argv[1]
rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
def look(q):
    url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + urllib.parse.quote(q)
    req = urllib.request.Request(url, headers={"Authorization": "KakaoAK " + key})
    return json.load(urllib.request.urlopen(req, timeout=15)).get("documents", [])
for r in rows:
    if r.get("위도") and r.get("경도"): continue
    q = re.sub(r"\(.*?\)", "", r["주소_전체"]).replace("전남광주통합특별시", "").strip()
    docs = look(q) or look("전라남도 " + q if "목포" in q or "나주" in q else q)
    if len(docs) == 1: r["경도"], r["위도"] = docs[0]["x"], docs[0]["y"]
    else: print("확인필요:", r.get("사적지명"), q, "후보", len(docs))
fn = list(rows[0].keys())
with open(path, "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fn); w.writeheader(); w.writerows(rows)
print("완료. 위도·경도가 비어 있는 행은 직접 확인하세요.")
