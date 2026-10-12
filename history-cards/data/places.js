// 장소·코스 데이터. 좌표는 모두 '대표 탐색점(개략)'이며 지도·현장 대조 전에는 PROBABLE로 둔다.
// photos의 url이 빈 문자열이면 '사진 주소 미등록'으로 표시된다. 원문에서 직접 확인한 주소와 이용조건만 채울 것.
// 새 지역/주제(예: 여순사건)는 category 값과 앱의 CATEGORIES 배열에 추가하면 된다.
window.HC = window.HC || {};
const LOC_NOTE = "개략 좌표입니다. 정확한 지점은 지도·현장에서 대조해야 합니다.";
// 주제 목록. 새 주제는 여기에 추가하면 필터에 나타난다(장소가 0곳이면 "준비 중"으로 표시).
window.HC.eras = ["근현대", "고려·조선"];   // 고려·조선은 장소를 추가하면 자동으로 "준비 중" 표시가 사라진다
window.HC.categories = ["독립운동", "여순사건", "5·18"];
window.HC.places = [
  {
    id: "sufia", name: "수피아여학교·수피아홀", region: "광주", category: "독립운동", era: "근현대",
    tags: ["3·1운동", "여학생", "양림동"], eventDate: "1919년 3월",
    historicalName: "수피아여학교", currentName: "수피아여자중·고등학교(수피아홀)",
    currentAddress: "광주광역시 남구 양림동 256 수피아여자중·고등학교", status: "현존",
    coordinate: { latitude: 35.136549, longitude: 126.909819, accuracy: "PROBABLE", note: "독립기념관 국내사적지 위치정보(2016-11-17)의 대표 좌표입니다. 학교 구내 건물의 정확한 위치는 확인하지 않았습니다.", sourceIds: ["ik-sites", "mfis-sufia"] },
    summary: "1919년 광주 3·10 만세시위를 앞두고 교사와 학생들이 준비에 참여한 곳으로 안내되는 학교입니다.",
    facts: [
      { confidence: "FACT", text: "수피아여학교는 국가보훈부 현충시설정보서비스에서 '만세시위 준비지'로 안내됩니다.", sourceIds: ["mfis-sufia"] },
      { confidence: "FACT", text: "독립기념관 국내사적지 목록은 '수피아여학교 3·1운동 만세시위 준비지'(양림동 256)를 '1919년 3월 10일 광주 만세시위에 적극 참여한 교사·학생들이 만세시위를 준비한 곳'으로 등록(2013-01-21)했습니다.", sourceIds: ["ik-sites"] },
      { confidence: "FACT", text: "광주의 3·1운동 만세시위는 1919년 3월 10일(장날)에 있었고 학생들이 참여했습니다.", sourceIds: ["ency-gj31"] },
      { confidence: "PROBABLE", text: "수피아홀의 건립 연도와, 1919년 당시 건물과 현재 수피아홀이 같은 건물인지는 자료 확인이 필요합니다. 현재 상태도 최근 현장답사로 확인하지 못했습니다.", sourceIds: ["mfis-sufia", "gj-archive"] }
    ],
    photos: [
      { type: "current", url: "", caption: "수피아홀 현재 모습(사진 미등록)", shootingYear: "", sourceId: "mfis-sufia", license: "이용조건 원문 확인 필요" }
    ],
    inquiryQuestion: "학교라는 공간이 만세시위 준비 장소가 된 이유는 무엇일까요?",
    teacherNote: "현존 건물이지만 '사건 당시 건물과 동일한가'는 별도로 확인해야 합니다. 사진을 등록할 때 이용조건을 반드시 기록하세요."
  },
  {
    id: "market1919", name: "1919년 작은 장터·만세시위 집결지", region: "광주", category: "독립운동", era: "근현대",
    tags: ["3·1운동", "광주천", "장터"], eventDate: "1919년 3월 10일",
    historicalName: "부동교 아래 작은 장터 / 광주교 아래 강둑 소시장 / 광주천 백사장·천변 장터 (자료별 표기 상이)",
    currentName: "광주천 부동교 일대 (대표 탐색점)",
    currentAddress: "광주광역시 동구 불로동 174 일대(독립기념관 사적지 지정 주소)", status: "장소 기능 소멸",
    coordinate: { latitude: 35.14471, longitude: 126.914898, accuracy: "PROBABLE", note: "독립기념관 국내사적지 위치정보(2016-11-17)가 '광주작은장터 3·1운동 만세시위지'(불로동 174 일대)로 등록한 대표 좌표입니다. 자료마다 부동교·광주교·천변 등 표현이 달라 같은 장소로 단정하지 않으며, 현재 부동교 좌표를 1919년 집결지의 확정 좌표로 쓰지 않았습니다.", sourceIds: ["ik-sites", "ency-gj31"] },
    summary: "1919년 3월 10일 광주 만세시위 참가자들이 모인 장소로 기록되지만, 자료마다 장터의 위치 표현이 다릅니다.",
    facts: [
      { confidence: "FACT", text: "1919년 3월 10일 광주에서 만세시위가 일어났습니다.", sourceIds: ["ency-gj31"] },
      { confidence: "FACT", text: "독립기념관 국내사적지 목록은 '광주작은장터 3·1운동 만세시위지'(불로동 174 일대)를 '1919년 3월 10일 광주 만세시위가 일어난 작은장터가 있던 곳'으로 등록(2013-01-21)했습니다.", sourceIds: ["ik-sites"] },
      { confidence: "PROBABLE", text: "집결지는 '부동교 아래 작은 장터', '광주교 아래 강둑 소시장', '광주천 백사장·천변 장터'처럼 자료마다 다르게 표현됩니다. 서로 같은 장소인지는 확정하지 않습니다.", sourceIds: ["ency-gj31", "gj-dh"] },
      { confidence: "PROBABLE", text: "현재의 부동교는 1933년 건립으로 안내되는 구조물이어서 1919년의 다리와 같은 구조물로 설명할 수 없습니다(건립 연도 원문 재확인 필요).", sourceIds: ["gj-archive"] },
      { confidence: "RECONSTRUCTED", text: "수피아여학교에서 광주천 방향으로 이어지는 선은 사건 장소를 연결한 교육용 선입니다. 실제 골목이나 다리 통과 경로가 아닙니다.", sourceIds: [] }
    ],
    photos: [],
    inquiryQuestion: "같은 사건을 다르게 부르는 자료들을 만났을 때, 장소를 확정하려면 어떤 근거가 더 필요할까요?",
    teacherNote: "옛 하천의 모래톱·장터 모습을 상상해 그린 이미지를 쓰지 않습니다. 과거 사진은 확보되지 않았으니 기록 설명으로 수업하세요."
  },
  {
    id: "oldstation", name: "옛 광주역 일대", region: "광주", category: "독립운동", era: "근현대",
    tags: ["광주학생운동", "1929", "대인동", "5·18과 구분"], eventDate: "1922 설치 · 1929 · 1969 기능 이전",
    historicalName: "광주역(대인동)", currentName: "동부소방서 일대",
    currentAddress: "광주광역시 동구 대인동 324-9 동부소방서(독립기념관 사적지 지정 주소)", status: "현장 확인 필요",
    coordinate: { latitude: 35.154571, longitude: 126.914697, accuracy: "PROBABLE", note: "독립기념관 국내사적지 위치정보(2016-11-17)의 '옛 광주역 터'(대인동 324-9, 동부소방서) 대표 좌표입니다. 옛 역사 건물이 현재 소방서 건물과 정확히 같은 위치라고 단정하지 않습니다.", sourceIds: ["ik-sites", "gj-archive"] },
    summary: "1922년 대인동에 설치되어 1929년 광주학생독립운동의 계기가 된 사건의 무대로 알려진 옛 광주역 일대입니다.",
    facts: [
      { confidence: "FACT", text: "광주역은 1922년 대인동에 설치되었고, 1969년 현재의 중흥동 광주역으로 기능이 옮겨졌습니다.", sourceIds: ["gj-archive", "gj-dh"] },
      { confidence: "FACT", text: "독립기념관 국내사적지 목록은 '옛 광주역 터 광주학생운동 시위지'를 '1929년 11월 1일과 3일 한국인과 일본인 학생들 사이에 충돌이 일어나 광주학생운동이 시발점이 된 곳'으로 등록(2013-11-13)했습니다.", sourceIds: ["ik-sites"] },
      { confidence: "FACT", text: "같은 목록은 '광주 토교 터'(대안동 245, 대인시장 동문다리 입구)를 1929년 11월 3일 광주역 앞에서 격투를 벌인 학생들이 대치하던 곳으로 등록했습니다(별도 장소 ik-270).", sourceIds: ["ik-sites"] },
      { confidence: "PROBABLE", text: "옛 광주역은 현 동부소방서 일대로 설명되지만, 옛 역사 건물이 소방서 건물과 정확히 같은 자리라고 단정할 수 없습니다.", sourceIds: ["gj-archive"] },
      { confidence: "RECONSTRUCTED", text: "1969년 이후의 광주역은 중흥동 역입니다. 1980년 5·18 당시의 광주역은 이 장소(옛 광주역)와 다른 곳이므로 1929년 사건과 혼동하지 마세요(5·18 사적지 지정 현황의 '광주역 광장'은 북구 독립로367번길 84, 즉 현재 광주역입니다).", sourceIds: ["gj518-list", "518-sites"] }
    ],
    photos: [],
    inquiryQuestion: "역이 사건의 계기가 된 이유는 무엇이며, 역의 위치가 옮겨지면 기억의 장소는 어떻게 될까요?",
    teacherNote: "옛 역사 사진과 현재 동부소방서 사진은 같은 촬영점의 비교가 아닙니다. 1929년(광주학생운동)과 1980년(5·18)을 구분해 가르치세요."
  },
  {
    id: "chonnam", name: "전남대학교 정문", region: "광주", category: "5·18", era: "근현대",
    tags: ["5·18", "대학", "공수부대"], eventDate: "1980년 5월 18일",
    historicalName: "전남대학교 교문(용봉천 앞)", currentName: "전남대학교 정문",
    currentAddress: "광주광역시 북구 용봉로 77 (5·18 사적지 세부 위치: 북구 용봉동 253-4)", status: "변형",
    coordinate: { latitude: 35.1741, longitude: 126.9052, accuracy: "PROBABLE", note: "현재 정문 좌표를 1980년 충돌 지점의 정밀 좌표로 단정하지 않습니다. " + LOC_NOTE, sourceIds: ["518-sites"] },
    summary: "1980년 5월 18일 오전 학생들이 계엄군에 항의하던 장소로 알려진 대학 정문입니다.",
    facts: [
      { confidence: "FACT", text: "5·18 사적지 지정 현황은 전남대학교 정문(북구 용봉동 253-4)을 '518진원지'로 지정했습니다.", sourceIds: ["gj518-list"] },
      { confidence: "FACT", text: "5·18 당일 오전 전남대 정문 앞에서 학생들과 계엄군이 대치했습니다.", sourceIds: ["518-archives", "518-sites"] },
      { confidence: "PROBABLE", text: "1980년 당시 교문과 현재 정문의 형태는 다르고, 당시 정문 앞 용봉천은 현재 복개되었습니다. 변화의 세부는 원문 확인이 필요합니다.", sourceIds: ["518-sites"] }
    ],
    photos: [],
    inquiryQuestion: "대학 정문이라는 공간은 시위에서 어떤 상징성을 가졌을까요?",
    teacherNote: "현재 정문 사진을 1980년 현장 사진처럼 보여 주지 마세요."
  },
  {
    id: "geumnam", name: "금남로·5·18민주화운동기록관 일대", region: "광주", category: "5·18", era: "근현대",
    tags: ["5·18", "금남로", "차량시위", "기록관"], eventDate: "1980년 5월 20일 전후",
    historicalName: "금남로", currentName: "금남로 / 5·18민주화운동기록관",
    currentAddress: "광주광역시 동구 금남로 일대(기록관 정확 주소 원문 확인 필요)", status: "현존",
    coordinate: { latitude: 35.1486, longitude: 126.917, accuracy: "PROBABLE", note: "금남로 구간 중 대표 탐색점입니다. " + LOC_NOTE, sourceIds: ["518-sites"] },
    summary: "5월 20일 차량시위와 시민 저항이 이어진 도심 대로로, 오늘날 기록관이 항쟁의 기록을 보존합니다.",
    facts: [
      { confidence: "FACT", text: "5·18 사적지 지정 현황은 금남로(동구 금남로 3가 3-5)를 '시민군 격전지, 최초 연좌시위' 장소로 지정했습니다.", sourceIds: ["gj518-list"] },
      { confidence: "FACT", text: "5·18 기간 금남로는 시위와 시민 저항의 중심 무대였고, 5월 20일에는 차량시위가 있었습니다.", sourceIds: ["518-archives", "518-sites"] },
      { confidence: "PROBABLE", text: "기록관의 정확한 위치·개관 정보와 현재 관람 상태는 공식 사이트에서 확인해야 합니다.", sourceIds: ["518-archives"] }
    ],
    photos: [],
    inquiryQuestion: "도심 대로가 시민 저항의 공간이 된 까닭과, 지금 그곳에 기록관이 있는 의미는 무엇일까요?",
    teacherNote: "거리(금남로)와 기록관 건물을 구분해 설명하세요."
  },
  {
    id: "doncheong", name: "옛 전남도청", region: "광주", category: "5·18", era: "근현대",
    tags: ["5·18", "최후 항쟁지", "복원"], eventDate: "1980년 5월 27일",
    historicalName: "전라남도청", currentName: "옛 전남도청(국립아시아문화전당 부지 일대)",
    currentAddress: "광주광역시 동구 광산동 13(독립기념관 사적지 지정 주소)", status: "변형",
    coordinate: { latitude: 35.146719, longitude: 126.920254, accuracy: "PROBABLE", note: "독립기념관 국내사적지 위치정보(2016-11-17)의 '옛 전남도청' 대표 좌표입니다. 건물 범위를 뜻하지 않습니다.", sourceIds: ["ik-sites", "518-sites"] },
    summary: "5·18 당시 항쟁의 거점이었고, 5월 27일 새벽 계엄군의 진압으로 최후 항쟁이 벌어진 곳으로 알려집니다.",
    facts: [
      { confidence: "FACT", text: "옛 전남도청은 5·18 당시 항쟁 거점이었고 5월 27일 새벽 최후 항쟁지였습니다.", sourceIds: ["518-archives", "518-sites", "518-cemetery"] },
      { confidence: "FACT", text: "독립기념관 국내사적지 목록은 옛 전남도청(광산동 13)을 '1896년부터 2005년까지 전남도청이 있던 곳'(일제통치/탄압기구 분류)으로 등록했고, 5·18 사적지 지정 현황은 '시민군본부 및 최후 항전지'로 지정했습니다.", sourceIds: ["ik-sites", "gj518-list"] },
      { confidence: "PROBABLE", text: "건물의 현존·증축·복원 범위와 최신 관람 상태는 공식 자료에서 확인한 뒤에만 확정적으로 말할 수 있습니다.", sourceIds: ["518-sites"] }
    ],
    photos: [],
    inquiryQuestion: "항쟁 거점이었던 건물을 복원할 때 무엇을 보존하고 무엇을 새로 해석해야 할까요?",
    teacherNote: "복원·개방 현황은 수업 직전에 공식 사이트에서 확인하세요."
  },
  {
    id: "nokdu", name: "녹두서점 옛터", region: "광주", category: "5·18", era: "근현대",
    tags: ["5·18", "녹두서점", "표지석"], eventDate: "1980년 5월 17일 밤 전후",
    historicalName: "녹두서점", currentName: "녹두서점 옛터(사적 표지)",
    currentAddress: "광주광역시 동구 제봉로 134(5·18 사적지 지정 현황)", status: "현장 확인 필요",
    coordinate: { latitude: 35.148, longitude: 126.92, accuracy: "PROBABLE", note: "5·18 사적지 지정 현황에는 주소만 있고 좌표가 없어, 지도상 위치는 개략 좌표입니다(주소 기준 대조 필요).", sourceIds: ["gj518-list", "much-nokdu"] },
    summary: "5·18 직전·직후 청년·시민이 모여 상황을 논의한 곳으로 알려진 서점 터입니다.",
    facts: [
      { confidence: "FACT", text: "5·18 사적지 지정 현황은 녹두서점 옛터(동구 제봉로 134)를 '항쟁대책 논의장소, 궐기대회 준비 및 현수막·화염병 제작 장소'로 지정했습니다.", sourceIds: ["gj518-list"] },
      { confidence: "PROBABLE", text: "5월 17일 밤 이곳에서 대책 논의가 있었다는 서술이 있으나 세부 내용은 원문 재확인이 필요합니다.", sourceIds: ["much-nokdu"] },
      { confidence: "PROBABLE", text: "서점의 폐업 연도와 건물 개보수·신축 시점은 자료마다 차이가 있어 확정하지 않습니다.", sourceIds: ["much-nokdu"] },
      { confidence: "RECONSTRUCTED", text: "자료연대(1980년 사건)와 사진의 실제 촬영연도(2018년 옛터 표지석 사진)는 서로 다릅니다.", sourceIds: [] }
    ],
    photos: [
      { type: "trace", url: "", caption: "녹두서점 옛터 표지석", shootingYear: "2018", sourceId: "much-nokdu", license: "이용조건 원문 확인 필요", warning: "2018년에 촬영한 옛터(표지석) 사진입니다. 1980년 당시 사진이 아닙니다." }
    ],
    inquiryQuestion: "사건 당시 사진과 후대에 찍은 표지석 사진은 역사 자료로서 어떻게 다를까요?",
    teacherNote: "1980년 당시 사진은 이 앱에 등록되지 않았습니다. 표지석 사진을 과거 사건 사진처럼 제시하지 마세요."
  },
  {
    id: "mokpo1", name: "목포근대역사관 1관", region: "전남", category: "독립운동", era: "근현대",
    tags: ["목포", "개항", "일본영사관", "식민 통치 유적", "근대 건축"], eventDate: "1900년 건립(자료 재확인 필요)",
    historicalName: "구 일본영사관", currentName: "목포근대역사관 1관",
    currentAddress: "전남 목포시 대의동2가 1-5(독립기념관 사적지 지정 주소)", status: "현존",
    coordinate: { latitude: 34.787525, longitude: 126.382161, accuracy: "PROBABLE", note: "독립기념관 국내사적지 위치정보(2016-11-17)의 '목포 일본영사관' 대표 좌표입니다.", sourceIds: ["ik-sites", "mokpo-1"] },
    summary: "개항 이후 일본이 세운 영사관 건물로, 지금은 목포의 근대사를 전시하는 역사관입니다.",
    facts: [
      { confidence: "FACT", text: "목포근대역사관 1관은 옛 일본영사관 건물을 활용한 전시관으로 안내됩니다.", sourceIds: ["mokpo-1", "much-mokpo"] },
      { confidence: "FACT", text: "독립기념관 국내사적지 목록은 목포 일본영사관(대의동2가 1-5)을 '1900년 12월 건립되어 1906년 1월까지 목포 일본영사관으로 사용된 곳'으로 등록(2014-12-12)했습니다. 같은 주소에 '목포 봉안전 터'와 '옛 목포부청 뒤 일제 방공호'도 등록되어 있습니다(ik-287, ik-288).", sourceIds: ["ik-sites"] },
      { confidence: "PROBABLE", text: "1906년 이후의 용도 변화는 공식 안내 원문에서 확인해야 합니다.", sourceIds: ["mokpo-1"] }
    ],
    photos: [{ type: "current", url: "", caption: "목포근대역사관 1관 현재 모습(사진 미등록)", shootingYear: "", sourceId: "mokpo-1", license: "이용조건 원문 확인 필요" }],
    inquiryQuestion: "영사관이라는 기능은 개항 이후 목포에서 어떤 역할을 했을까요?",
    teacherNote: "2관과 '기능'(외교·거류민 관리 vs 경제 수탈)을 비교하는 활동에 적합합니다."
  },
  {
    id: "mokpo2", name: "목포근대역사관 2관", region: "전남", category: "독립운동", era: "근현대",
    tags: ["목포", "동양척식주식회사", "식민 수탈", "식민 통치 유적", "근대 건축"], eventDate: "1920~1921년, 자료별 표기 차이 확인 필요",
    historicalName: "구 동양척식주식회사 목포지점", currentName: "목포근대역사관 2관",
    currentAddress: "전남 목포시 중앙동2가 6(독립기념관 사적지 지정 주소)", status: "현존",
    coordinate: { latitude: 34.785894, longitude: 126.381547, accuracy: "PROBABLE", note: "독립기념관 국내사적지 위치정보(2016-11-17)의 '동양척식주식회사 목포지점' 대표 좌표입니다.", sourceIds: ["ik-sites", "mokpo-2"] },
    summary: "일제강점기 토지 수탈 기관이던 동양척식주식회사 목포지점 건물을 활용한 역사관입니다.",
    facts: [
      { confidence: "FACT", text: "독립기념관 국내사적지 목록은 동양척식주식회사 목포지점(중앙동2가 6)을 '일제가 한국의 경제를 독점, 착취하기 위해 설립한 동양척식주식회사의 목포지점이 있던 곳'으로 등록(2014-12-12)했습니다.", sourceIds: ["ik-sites"] },
      { confidence: "FACT", text: "목포근대역사관 2관은 옛 동양척식주식회사 목포지점 건물로 안내됩니다.", sourceIds: ["mokpo-2", "much-mokpo"] },
      { confidence: "PROBABLE", text: "건립 시기가 공식 안내 자료에서 1920년 또는 1921년으로 다르게 나타날 수 있어 한쪽으로 통일하지 않았습니다. 1920~1921년, 자료별 표기 차이 확인 필요.", sourceIds: ["mokpo-2", "much-mokpo"] }
    ],
    photos: [{ type: "current", url: "", caption: "목포근대역사관 2관 현재 모습(사진 미등록)", shootingYear: "", sourceId: "mokpo-2", license: "이용조건 원문 확인 필요" }],
    inquiryQuestion: "같은 거리의 두 건물은 식민 지배의 서로 다른 면을 어떻게 보여 줄까요?",
    teacherNote: "연도 표기가 기관마다 다르다는 사실 자체를 사료 비판 활동으로 쓸 수 있습니다."
  }
];

// 코스: events = 사건 시간순(과거 사건 연결), tour = 현재 답사 순서.
window.HC.courses = [
  { id: "A", title: "코스 A · 1919년 준비에서 만세시위로", confidence: "RECONSTRUCTED",
    disclaimer: "수피아여학교에서 광주천 방향으로 이동했다는 기록은 있지만 세부 골목과 다리 통과 경로는 확정되지 않았습니다. 지도의 점선은 '과거 사건 연결선'이며 실제 보행 경로가 아닙니다.",
    events: [{ placeId: "sufia", label: "3월 초 · 학교에서 만세시위 준비" }, { placeId: "market1919", label: "3월 10일 · 작은 장터에 집결(위치 추정)" }],
    tour: ["sufia", "market1919"] },
  { id: "B", title: "코스 B · 1980년 오월의 장소들", confidence: "RECONSTRUCTED",
    disclaimer: "장소의 사건 시간을 연결한 학습 경로입니다. 특정 인물이나 하나의 시위대가 이 순서로 이동했다는 뜻이 아닙니다. 현재 답사 순서는 사건 순서와 다릅니다.",
    events: [{ placeId: "nokdu", label: "5월 17일 밤 · 대책 논의" }, { placeId: "chonnam", label: "5월 18일 오전 · 학생 항의" }, { placeId: "geumnam", label: "5월 20일 · 차량시위와 시민 저항" }, { placeId: "doncheong", label: "5월 27일 · 최후 항쟁" }],
    tour: ["chonnam", "nokdu", "geumnam", "doncheong"] },
  { id: "C", title: "코스 C · 목포의 두 근대 건축물", confidence: "RECONSTRUCTED",
    disclaimer: "역사적 행진 경로가 아닙니다. 건립 시기와 식민 통치 기능을 비교하기 위한 교육용 코스입니다.",
    events: [{ placeId: "mokpo1", label: "1관 · 구 일본영사관(외교·행정 기능)" }, { placeId: "mokpo2", label: "2관 · 구 동양척식주식회사 목포지점(경제 수탈 기능)" }],
    tour: ["mokpo1", "mokpo2"] }
];
