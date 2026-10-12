"""주소 → 위도·경도 (인터넷이 되는 PC에서 실행). 서비스를 골라 쓴다.
  GEOCODER=nominatim  키 없음(OpenStreetMap, 초당 1건, 한국 지번 주소는 못 찾는 경우가 많음)
  GEOCODER=vworld     VWORLD_KEY 필요(국토교통부 브이월드, 무료)
  GEOCODER=kakao      KAKAO_REST_KEY 필요(기본값)
사용: GEOCODER=nominatim python3 scripts/geocode.py history-cards/data/research/518_jeonnam_sites.csv
- '주소_전체' 열을 읽어 비어 있는 '위도','경도','변환정확도' 열을 채워 같은 파일에 저장한다. 괄호 안 설명은 지우고 검색한다.
- 주소가 정확히 안 맞으면 리·동 단위로 줄여 다시 찾고 '변환정확도'에 '마을·도로 수준'이라고 적는다(사적지 정확 지점이 아님).
- 결과가 없거나 여러 개면 비워 두고 '확인필요'를 출력한다. 키는 파일·저장소에 넣지 말 것.
- 이 스크립트는 서비스 응답을 이 환경에서 실행·검증하지 못했다(parse 함수는 모의 응답으로만 시험)."""
import csv, json, os, re, sys, time, urllib.parse, urllib.request

PROVIDER = os.environ.get("GEOCODER", "kakao").lower()

def _get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    return json.load(urllib.request.urlopen(req, timeout=20))

def parse_kakao(d):  return [(x["x"], x["y"]) for x in d.get("documents", [])]
def parse_vworld(d):
    r = (d.get("response") or {}).get("result")
    return [(r["point"]["x"], r["point"]["y"])] if r and r.get("point") else []
def parse_nominatim(d): return [(x["lon"], x["lat"]) for x in d]

def look(q):
    """[(경도, 위도), ...] 후보 목록"""
    qq = urllib.parse.quote(q)
    if PROVIDER == "kakao":
        key = os.environ.get("KAKAO_REST_KEY") or sys.exit("KAKAO_REST_KEY 환경변수를 설정하세요")
        return parse_kakao(_get("https://dapi.kakao.com/v2/local/search/address.json?query=" + qq, {"Authorization": "KakaoAK " + key}))
    if PROVIDER == "vworld":
        key = os.environ.get("VWORLD_KEY") or sys.exit("VWORLD_KEY 환경변수를 설정하세요")
        for typ in ("road", "parcel"):   # 도로명 → 지번 순서로 시도
            out = parse_vworld(_get("https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&format=json&type=%s&key=%s&address=%s" % (typ, key, qq)))
            if out: return out
        return []
    if PROVIDER == "nominatim":
        time.sleep(1.1)   # 이용 정책: 초당 1건 이하
        return parse_nominatim(_get("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=2&countrycodes=kr&accept-language=ko&q=" + qq, {"User-Agent": "history-cards-geocode/1.0 (education)"}))
    sys.exit("GEOCODER는 kakao, vworld, nominatim 중 하나")

def clean(addr):
    return re.sub(r"\(.*?\)", "", addr).replace("전남광주통합특별시", "").replace("번지", "").strip()

def village(addr):
    """주소에서 지번·번지(숫자, '산 숫자')가 시작되기 직전까지만 남긴다. 예: '해남군 옥천면 영춘리 산 51-1' → '해남군 옥천면 영춘리'."""
    out = []
    for t in addr.split():
        if t == "산" or re.match(r"^산?\d", t): break
        out.append(t)
    return " ".join(out)

def run(path):
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    for r in rows: r.setdefault("변환정확도", "")
    for r in rows:
        if r.get("위도") and r.get("경도"): continue
        q = clean(r["주소_전체"])
        if not q: print("확인필요(주소 없음):", r.get("사적지명")); continue
        docs, acc = look(q), "주소 일치"
        if len(docs) != 1:
            v = village(q)
            if v and v != q:
                d2 = look(v)
                if d2: docs, acc = d2[:1], "마을·도로 수준(주소 정확 일치 아님)"
        if len(docs) == 1: r["경도"], r["위도"], r["변환정확도"] = docs[0][0], docs[0][1], acc
        else: print("확인필요:", r.get("사적지명"), q, "후보", len(docs))
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    print("완료. 위도·경도가 비어 있는 행은 직접 확인하세요.")

if __name__ == "__main__":
    run(sys.argv[1])
