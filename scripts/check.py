"""서식 목록(data/seosik.csv) 점검: 빠진 칸, 잘못된 값, 중복을 알려 줍니다.

실행: python scripts/check.py
"""
import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ["분류", "서식명", "기관", "게시판", "공개여부", "적용지역", "원문주소"]
ACCESS = {"open", "login"}
REGIONS = {"공통", "구 광주", "구 전남"}


def read(path):
    raw = path.read_bytes()
    for enc in ("utf-8-sig", "cp949"):
        try:
            return list(csv.DictReader(raw.decode(enc).splitlines()))
        except UnicodeDecodeError:
            continue
    sys.exit(f"{path.name}: 글자 인코딩을 읽을 수 없습니다. 'CSV UTF-8'로 다시 저장해 주세요.")


def main():
    rows = read(ROOT / "data" / "seosik.csv")
    problems, seen = [], {}
    for n, r in enumerate(rows, start=2):  # 1행은 머리글
        for col in REQUIRED:
            if not (r.get(col) or "").strip():
                problems.append(f"{n}행: '{col}' 칸이 비어 있습니다")
        if r.get("공개여부") and r["공개여부"].strip() not in ACCESS:
            problems.append(f"{n}행: 공개여부는 open 또는 login 이어야 합니다 (지금: {r['공개여부']})")
        if r.get("적용지역") and r["적용지역"].strip() not in REGIONS:
            problems.append(f"{n}행: 적용지역은 공통 / 구 광주 / 구 전남 중 하나여야 합니다 (지금: {r['적용지역']})")
        url = (r.get("원문주소") or "").strip()
        if url and not url.startswith(("https://", "http://")):
            problems.append(f"{n}행: 원문주소가 http(s)로 시작하지 않습니다")
        key = (r.get("서식명") or "").strip()
        if key in seen:
            problems.append(f"{n}행: '{key}' 가 {seen[key]}행과 겹칩니다")
        seen.setdefault(key, n)

    print(f"서식 {len(rows)}건 점검")
    if problems:
        print("\n".join(problems))
        sys.exit(1)
    print("문제 없음")


if __name__ == "__main__":
    main()
