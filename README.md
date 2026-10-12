# 전남광주 서식 꾸러미

전남광주통합특별시교육청 **공개 게시판**에 흩어진 학교 업무 서식을 한곳에서 찾는 비공식 모음입니다.
파일은 올려 두지 않고 원문 게시판으로 연결합니다. 로그인이 필요한 자료실은 바로가기만 안내합니다.

## GitHub Pages로 올리기 (10분)

1. github.com에서 **New repository** → 이름 `jge-seosik` → Public → Create
2. **Add file → Upload files**로 이 폴더의 `index.html`, `README.md`를 올리고 Commit
3. **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save
4. 1~2분 뒤 `https://<아이디>.github.io/jge-seosik/` 주소가 생깁니다

## 서식 추가하는 법

1. `서식수집양식.csv`에 한 줄씩 정리합니다 (원문 게시판 주소 필수)
2. `index.html`의 `const SEOSIK = [ ... ]` 안에 같은 형식으로 한 줄 추가합니다
   - `access`: 누구나 열리면 `"open"`, 로그인이 필요하면 `"login"`
   - `cat`: `CATS` 목록 중 하나
3. GitHub에서 파일 편집 → Commit 하면 1~2분 뒤 반영됩니다

## 지켜야 할 것

- 로그인 뒤에서 받은 파일은 이 저장소에 올리지 않습니다
- 서식 파일 자체를 저장소에 올리지 않고, 원문 주소만 연결합니다
- 화면 하단의 "교육청 공식 사이트가 아님" 문구를 유지합니다
