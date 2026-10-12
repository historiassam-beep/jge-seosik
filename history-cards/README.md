# 광주·전남 역사 장소카드 지도 (수업용 · 비공개)

의존성 없는 정적 사이트입니다. `index.html`을 열거나 `python3 -m http.server`로 실행합니다.

| 파일 | 역할 |
|---|---|
| `data/sources.js` | 출처(장소와 분리). 원문을 열어 확인하면 `checkedAt`을 날짜로 고친다 |
| `data/places.js` | 장소 9곳 · 코스 3개. 사진은 `photos`에 확인한 URL·촬영연도·이용조건만 추가 |
| `app.js` / `style.css` | 지도(OSM 타일, 실패 시 좌표 격자)·카드·필터·기록·CSV·인쇄 |
| `tests/check-data.js` | 데이터 점검 (`node tests/check-data.js`) |
| `tests/e2e.js` | Playwright 사용자 흐름 1~4·해상도 검증 |

## 비공개 유지
- 이 폴더는 접근 제어를 **하지 않는** 정적 파일입니다. `noindex, nofollow`만 걸려 있습니다.
- 이 저장소(`jge-seosik`)는 GitHub Pages로 공개 배포되므로 **main에 합치면 이 폴더도 공개 주소로 노출**됩니다. 비공개가 필요하면 소유자 전용 호스팅(기존 Sites 프로젝트 등)에 이 폴더만 올리세요.
- 학생 개인정보는 수집하지 않으며 기록은 브라우저 localStorage에만 저장됩니다.

## 한계
- 출처 원문에 접속하지 못해 모든 출처가 `원문 접속 확인 필요`입니다.
- 좌표는 개략 대표점(PROBABLE)이며 사진 URL은 아직 등록되지 않았습니다.
