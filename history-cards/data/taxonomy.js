// 사건(세부 주제)·시군구 분류. 장소 데이터의 tags·category·currentAddress에서 계산한다(데이터를 따로 고치지 않아도 됨).
window.HC = window.HC || {};
(function (HC) {
  // 필터에 나타나는 순서. category는 큰 틀(주제)과의 관계를 보여 주는 용도.
  HC.eventList = [
    { name: "3·1운동", category: "독립운동" },
    { name: "학생운동(광주학생운동 등)", category: "독립운동" },
    { name: "의병·한말 구국운동", category: "독립운동" },
    { name: "식민 통치·수탈 기구", category: "독립운동" },
    { name: "사회·문화운동", category: "독립운동" },
    { name: "독립운동가·의열투쟁", category: "독립운동" },
    { name: "5·18 민주화운동", category: "5·18" },
    { name: "여순사건", category: "여순사건" }
  ];
  // 독립기념관 운동계열 태그(및 수동 입력 장소의 태그) → 사건
  var TAG = {
    "3·1운동": "3·1운동", "학생운동": "학생운동(광주학생운동 등)", "광주학생운동": "학생운동(광주학생운동 등)",
    "의병운동": "의병·한말 구국운동", "한말구국운동": "의병·한말 구국운동", "애국계몽운동": "의병·한말 구국운동",
    "일제통치": "식민 통치·수탈 기구", "탄압기구": "식민 통치·수탈 기구", "탄압": "식민 통치·수탈 기구", "수탈기구": "식민 통치·수탈 기구", "식민 통치 유적": "식민 통치·수탈 기구",
    "문화운동": "사회·문화운동", "사회운동": "사회·문화운동",
    "국내독립운동": "독립운동가·의열투쟁", "해외독립운동가 국내사적지": "독립운동가·의열투쟁", "의열투쟁": "독립운동가·의열투쟁"
  };
  HC.eventsOf = function (p) {
    if (p.category === "5·18") return ["5·18 민주화운동"];
    if (p.category === "여순사건") return ["여순사건"];
    var out = [];
    (p.tags || []).forEach(function (t) { var e = TAG[t]; if (e && out.indexOf(e) < 0) out.push(e); });
    return out;
  };
  // 시군구: 주소에서 시·도 접두를 떼고 첫 '시/군/구' 단어. 키는 '광주 동구'처럼 지역을 붙여 구분한다.
  HC.districtOf = function (p) {
    if (p.district) return p.district;   // 주소가 없는 장소는 목록의 시군 구분을 쓴다
    var a = String(p.currentAddress || "").replace(/^(전남광주통합특별시|광주광역시|전라남도|경상남도|전남)\s*/, "");
    var m = a.match(/^([가-힣]+(?:시|군|구))(?:\s|$)/);
    return m ? m[1] : "";
  };
  HC.districtKey = function (p) { var d = HC.districtOf(p); return d ? p.region + " " + d : ""; };
  HC.regionOrder = ["광주", "전남", "경남"];
})(window.HC);

// 민간인·희생과 직접 관련된 장소(학교급별 노출 조절용). 이름·지정 사유 문장의 낱말로 판단하므로 목록은 교사가 확인해야 한다.
(function (HC) {
  var RE = /학살|암매장|시신|고문|발포|사살|사망|총격|희생|묘지|형제묘|위령|연행|격전지/;
  HC.isSensitive = function (p) {
    var text = (p.name + " " + (p.summary || "")).replace(/남고문/g, "");   // '남고문'(나주 성문)의 '고문' 오탐 방지
    return RE.test(text) || (p.tags || []).indexOf("희생 관련 장소") >= 0;
  };
  // 초등학생 보기에서는 희생 관련 장소와 여순사건 전체(성격이 확인되지 않은 곳이 많음)를 기본으로 숨긴다.
  HC.hiddenForElementary = function (p) { return p.category === "여순사건" || HC.isSensitive(p); };
  HC.needsCare = function (p) { return HC.isSensitive(p) || p.category === "여순사건"; };
  HC.levels = ["교사(전체)", "초등학생", "중학생", "고등학생"];
})(window.HC);
