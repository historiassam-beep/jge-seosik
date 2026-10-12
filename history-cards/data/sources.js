// 출처 데이터 (장소 데이터와 분리). 이 환경에서는 원문에 접속하지 못했으므로 checkedAt은 모두 미확인.
// 원문을 직접 열어 확인하면 checkedAt을 'YYYY-MM-DD'로 고친다.
window.HC = window.HC || {};
const U = "미확인 · 원문 접속 확인 필요";
window.HC.sources = [
  // 아래 두 건은 사용자가 제공한 공공데이터 파일을 직접 열어 확인했다(개별 데이터셋 주소·이용허락 조건은 확인 필요).
  { id: "ik-sites", organization: "독립기념관", title: "독립기념관_국내사적지 위치정보_20161117 (공공데이터 파일)", url: "https://www.data.go.kr/", sourceType: "공식기관", checkedAt: "2026-10-12 (제공 파일 확인)", licenseNote: "공공데이터포털 파일데이터. 데이터셋별 이용허락 범위 확인 필요. 2016년 기준 자료" },
  { id: "gj518-list", organization: "전남광주통합특별시", title: "518사적지 지정 현황_20260206 (공공데이터 파일)", url: "https://www.data.go.kr/", sourceType: "공식기관", checkedAt: "2026-10-12 (제공 파일 확인)", licenseNote: "공공데이터포털 파일데이터. 데이터셋별 이용허락 범위 확인 필요" },
  { id: "ency-gj31", organization: "한국학중앙연구원", title: "한국민족문화대백과사전 — 광주 3·1운동", url: "https://encykorea.aks.ac.kr/Article/E0078009", sourceType: "학술자료", checkedAt: U },
  { id: "mfis-sufia", organization: "국가보훈부 현충시설정보서비스", title: "수피아여학교 만세시위 준비지", url: "https://mfis.mpva.go.kr/memorial/movementView.do?gubunCode=DR&sid=663", sourceType: "공식기관", checkedAt: U },
  { id: "egonghun", organization: "국가보훈부", title: "공훈전자사료관", url: "https://e-gonghun.mpva.go.kr/", sourceType: "공훈록", checkedAt: U },
  { id: "nikh-1929", organization: "국사편찬위원회", title: "1929년 광주학생운동 사료", url: "https://contents.history.go.kr/front/hm/view.do?levelId=hm_124_0090", sourceType: "공식기관", checkedAt: U },
  { id: "518-archives", organization: "5·18민주화운동기록관", title: "5·18민주화운동기록관", url: "https://www.518archives.go.kr/", sourceType: "공식기관", checkedAt: U },
  { id: "518-sites", organization: "5·18민주화운동기록관", title: "5·18 사적지 안내", url: "https://www.518archives.go.kr/dcma/DcmaPageLink.do?baseMenuNo=1000000&link=1040000", sourceType: "공식기관", checkedAt: U },
  { id: "518-cemetery", organization: "국립5·18민주묘지", title: "국립5·18민주묘지 안내", url: "https://mpva.go.kr/518/contents.do?key=418", sourceType: "공식기관", checkedAt: U },
  { id: "much-nokdu", organization: "대한민국역사박물관 근현대사아카이브", title: "구 녹두서점 터", url: "https://archive.much.go.kr/data/01/folderView.do?idnbr=2019030311&jobdirSeq=1335", sourceType: "사진자료", checkedAt: U, licenseNote: "이용조건은 원문 페이지에서 확인" },
  { id: "gj-archive", organization: "광주광역시", title: "시청각자료실 — 건축물의 변천사", url: "https://www.gwangju.go.kr/gjarchive/contentsView.do?pageId=gjarchive22", sourceType: "공식기관", checkedAt: U },
  { id: "gj-dh", organization: "한국학중앙연구원", title: "광주문화예술인문스토리플랫폼", url: "https://dh.aks.ac.kr/~gwangju/", sourceType: "지역사 연구", checkedAt: U },
  { id: "mokpo-1", organization: "목포시 문화관광", title: "목포근대역사관 1관", url: "https://www.mokpo.go.kr/tour/attraction/area?idx=7449&mode=view", sourceType: "공식기관", checkedAt: U },
  { id: "mokpo-2", organization: "목포시 문화관광", title: "목포근대역사관 2관", url: "https://www.mokpo.go.kr/tour/attraction/area?idx=7451&mode=view", sourceType: "공식기관", checkedAt: U },
  { id: "much-mokpo", organization: "대한민국역사박물관", title: "목포근대역사관", url: "https://www.much.go.kr/cooperation/net/mok.do", sourceType: "공식기관", checkedAt: U },
  { id: "kto", organization: "한국관광공사", title: "대한민국 구석구석 관광정보", url: "https://korean.visitkorea.or.kr/", sourceType: "공식기관", checkedAt: U }
];
