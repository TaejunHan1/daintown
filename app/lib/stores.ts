// lib/stores.ts
export interface Store {
  id: string;                 // URL용 고유 식별자
  name: string;               // 매장 이름
  floor: string;              // 층 (예: "1f")
  category: string;           // 매장 카테고리
  shortDescription: string;   // 짧은 설명
  description: string;        // HTML 형식의 상세 설명
  contact?: string;           // 연락처 (옵션)
  hours?: string;             // 영업시간 (옵션)
  image?: string;             // 매장 이미지 (옵션)
  mapImage?: string;          // 매장 위치 이미지 (옵션)
}

// 모든 매장 데이터
const stores: Store[] = [
  // 1층 매장
  {
    id: 'yangpyeong-soup',
    name: '양평해장국',
    floor: '1f',
    category: '음식점',
    shortDescription: '건강한 재료로 만든 전통 해장국',
    description: `
      <p>양평해장국은 신선한 국내산 재료만을 사용하여 정성껏 끓여낸 전통 해장국 전문점입니다.</p>
      <p>특제 양념과 오랜 시간 우려낸 육수로 깊은 맛을 느낄 수 있으며, 해장국 외에도 다양한 한식 메뉴를 제공합니다.</p>
      <h3>대표 메뉴</h3>
      <ul>
        <li>양평해장국 - 8,000원</li>
        <li>소고기 해장국 - 9,000원</li>
        <li>황태해장국 - 9,000원</li>
        <li>콩나물해장국 - 7,500원</li>
      </ul>
    `,
    contact: '032-123-4567',
    hours: '매일 06:00 - 21:00',
    image: '/images/stores/1F/haejang/haejang1.jpg'
  },
  {
    id: 'bbeogeum-vape',
    name: '뻐끔뻐끔전자담배',
    floor: '1f',
    category: '전자담배',
    shortDescription: '다양한 전자담배 제품과 액상 판매',
    description: `
      <p>뻐끔뻐끔전자담배는 최신 전자담배 기기와 다양한 액상을 판매하는 전문점입니다.</p>
      <p>친절한 상담과 함께 개인에게 맞는 제품을 추천해드리며, 액상 시향 서비스도 제공합니다.</p>
      <h3>취급 제품</h3>
      <ul>
        <li>전자담배 기기 (포드형, 박스형)</li>
        <li>다양한 맛의 액상</li>
        <li>코일, 베이프 액세서리</li>
      </ul>
    `,
    contact: '032-234-5678',
    hours: '매일 10:00 - 22:00',
    image: '/images/stores/1F/puffpuff/puffpuff1.jpeg'
  },
  {
    id: 'jongno-kimbap',
    name: '종로김밥',
    floor: '1f',
    category: '분식',
    shortDescription: '맛있고 건강한 김밥과 분식 전문점',
    description: `
      <p>종로김밥은 신선한 재료로 만든 다양한 김밥과 분식을 제공하는 매장입니다.</p>
      <p>매일 아침 준비하는 신선한 재료와 정성이 담긴 요리로 많은 고객분들께 사랑받고 있습니다.</p>
      <h3>대표 메뉴</h3>
      <ul>
        <li>원조김밥 - 3,000원</li>
        <li>참치김밥 - 3,500원</li>
        <li>라볶이 - 5,000원</li>
        <li>오뎅탕 - 6,000원</li>
      </ul>
    `,
    contact: '032-345-6789',
    hours: '매일 07:00 - 21:00 (일요일 휴무)',
    image: '/images/stores/1F/jongro/jongro1.jpeg'
  },
  {
    id: 'vintage-multishop',
    name: '빈티지멀티샵',
    floor: '1f',
    category: '의류',
    shortDescription: '개성 있는 빈티지 의류와 액세서리',
    description: `
      <p>빈티지멀티샵은 유니크한 스타일을 추구하는 분들을 위한 빈티지 의류 전문점입니다.</p>
      <p>엄선된 빈티지 제품들과 함께 트렌디한 현대 스타일을 믹스매치할 수 있는 다양한 아이템을 제공합니다.</p>
      <h3>주요 상품</h3>
      <ul>
        <li>빈티지 자켓 & 코트</li>
        <li>유니크한 티셔츠 & 셔츠</li>
        <li>데님 & 팬츠</li>
        <li>액세서리 & 가방</li>
      </ul>
    `,
    contact: '032-876-5432',
    hours: '매일 11:00 - 21:00 (월요일 휴무)',
    image: '/images/stores/1F/vintage/vintage1.jpg'
  },
  {
    id: 'seonbi-kimbap',
    name: '선비꼬마김밥',
    floor: '1f',
    category: '분식',
    shortDescription: '정갈한 재료로 만든 소형 김밥 전문점',
    description: `
      <p>선비꼬마김밥은 작고 정갈한 꼬마김밥을 전문으로 하는 분식점입니다.</p>
      <p>엄선된 신선한 재료만을 사용하여 작은 사이즈로 한 입에 즐길 수 있는 꼬마김밥과 다양한 분식 메뉴를 제공합니다.</p>
      <h3>대표 메뉴</h3>
      <ul>
        <li>꼬마김밥 8개 - 3,500원</li>
        <li>참치꼬마김밥 8개 - 4,000원</li>
        <li>치즈꼬마김밥 8개 - 4,000원</li>
        <li>떡볶이 - 4,500원</li>
        <li>어묵탕 - 5,000원</li>
      </ul>
    `,
    contact: '032-456-9870',
    hours: '매일 08:00 - 20:00',
    image: '/images/stores/1F/kkoma/kkoma1.jpeg'
  },
  {
    id: 'skt',
    name: 'SK텔레콤',
    floor: '1f',
    category: '통신사',
    shortDescription: 'SK텔레콤 공식 대리점',
    description: `
      <p>SK텔레콤 공식 대리점으로, 휴대폰 개통 및 기기 판매, 요금제 상담 등 다양한 서비스를 제공합니다.</p>
      <p>최신 휴대폰 모델과 다양한 액세서리를 전시 판매하고 있으며, 전문 상담원의 친절한 상담을 받으실 수 있습니다.</p>
      <h3>주요 서비스</h3>
      <ul>
        <li>신규 가입 및 번호이동</li>
        <li>기기 변경</li>
        <li>요금제 상담</li>
        <li>휴대폰 액세서리 판매</li>
      </ul>
    `,
    contact: '032-456-7890',
    hours: '평일 09:00 - 18:00, 토요일 09:00 - 14:00 (일요일 휴무)',
    image: '/images/stores/skt.jpg'
  },
  {
    id: 'paris-baguette',
    name: '파리바게트',
    floor: '1f',
    category: '베이커리',
    shortDescription: '신선한 빵과 케이크를 제공하는 베이커리',
    description: `
      <p>파리바게트는 매일 아침 구워내는 신선한 빵과 케이크를 판매하는 프리미엄 베이커리입니다.</p>
      <p>엄선된 원재료로 만든 다양한 빵과 디저트, 케이크를 만나보실 수 있습니다.</p>
      <h3>대표 제품</h3>
      <ul>
        <li>크로아상</li>
        <li>단팥빵</li>
        <li>생크림 케이크</li>
        <li>샌드위치</li>
      </ul>
    `,
    contact: '032-567-8901',
    hours: '매일 07:00 - 22:00',
    image: '/images/stores/1F/pb/pb1.jpg'
  },
  {
    id: 'onnuri-pharmacy',
    name: '온누리약국',
    floor: '1f',
    category: '약국',
    shortDescription: '전문 약사의 상담을 받을 수 있는 약국',
    description: `
      <p>온누리약국은 전문 약사의 상담과 함께 의약품 및 건강기능식품을 제공하는 약국입니다.</p>
      <p>처방전 조제는 물론, 다양한 일반의약품과 건강기능식품을 구비하고 있어 건강 관리에 도움을 드립니다.</p>
      <h3>주요 서비스</h3>
      <ul>
        <li>처방전 조제</li>
        <li>일반의약품 판매</li>
        <li>건강기능식품 상담 및 판매</li>
        <li>혈압 및 혈당 측정</li>
      </ul>
    `,
    contact: '032-678-9012',
    hours: '평일 09:00 - 19:00, 토요일 09:00 - 13:00 (일요일 휴무)',
    image: '/images/stores/1F/pharmacy/pharmacy1.jpeg'
  },
  
  // 2층 매장
  {
    id: 'gukmin-pilates',
    name: '국민필라테스',
    floor: '2f',
    category: '피트니스',
    shortDescription: '전문 강사진과 함께하는 맞춤형 필라테스',
    description: `
      <p>국민필라테스는 전문 자격을 갖춘 강사진과 함께 개인별 맞춤 필라테스 프로그램을 제공합니다.</p>
      <p>최신 필라테스 기구와 쾌적한 환경에서 체형 교정, 자세 개선, 통증 완화 등 다양한 목표에 맞는 운동을 경험할 수 있습니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>1:1 개인 필라테스</li>
        <li>소규모 그룹 필라테스</li>
        <li>재활 필라테스</li>
        <li>임산부 필라테스</li>
      </ul>
    `,
    contact: '032-789-0123',
    hours: '평일 06:00 - 22:00, 주말 10:00 - 18:00',
    image: '/images/stores/2F/kukmin/kukmin1.jpg'
  },
  {
    id: 'genie24-studycafe',
    name: '지니24 스터디카페',
    floor: '2f',
    category: '학습공간',
    shortDescription: '24시간 이용 가능한 집중 학습 공간',
    description: `
      <p>지니24 스터디카페는 24시간 운영되는 쾌적한 학습 공간으로, 집중력을 높일 수 있는 최적의 환경을 제공합니다.</p>
      <p>개인 좌석, 1인실, 회의실 등 다양한 공간 옵션과 무료 와이파이, 충전 설비, 음료 서비스 등 편의 시설을 갖추고 있습니다.</p>
      <h3>이용 요금</h3>
      <ul>
        <li>시간권: 2,000원/시간</li>
        <li>종일권: 10,000원</li>
        <li>월 정기권: 150,000원</li>
        <li>회의실: 15,000원/시간</li>
      </ul>
    `,
    contact: '032-890-1234',
    hours: '연중무휴 24시간',
    image: '/images/stores/2F/studycafe/studycafe1.jpeg'
  },
  {
    id: 'baba-hair',
    name: '바바헤어',
    floor: '2f',
    category: '미용실',
    shortDescription: '트렌디한 스타일링과 건강한 모발 관리',
    description: `
      <p>바바헤어는 최신 트렌드를 반영한 헤어 스타일링과 건강한 모발 관리를 제공하는 미용실입니다.</p>
      <p>경험 풍부한 디자이너들이 고객 개개인의 얼굴형, 두상, 라이프스타일에 맞는 스타일을 제안하고, 고급 제품을 사용하여 모발 손상을 최소화합니다.</p>
      <h3>주요 서비스</h3>
      <ul>
        <li>커트 - 20,000원~</li>
        <li>염색 - 60,000원~</li>
        <li>펌 - 80,000원~</li>
        <li>헤드 스파 - 40,000원~</li>
      </ul>
    `,
    contact: '032-901-2345',
    hours: '매일 10:00 - 20:00 (월요일 휴무)',
    image: '/images/stores/2F/babahair/babahair1.jpeg'
  },
  
  // 3층 매장
  {
    id: '108-karaoke',
    name: '108 가라오케',
    floor: '3f',
    category: '노래방',
    shortDescription: '최신 음향 시스템과 넓은 공간의 노래방',
    description: `
      <p>108 가라오케는 최신 음향 시스템과 넓은 공간을 갖춘 프리미엄 노래방입니다.</p>
      <p>매일 업데이트되는 최신곡과 클래식 명곡, 쾌적한 환경에서 친구, 가족, 동료들과 즐거운 시간을 보낼 수 있습니다.</p>
      <h3>이용 요금</h3>
      <ul>
        <li>일반실: 15,000원/시간</li>
        <li>파티룸: 30,000원/시간</li>
        <li>음료 및 안주 주문 가능</li>
      </ul>
    `,
    contact: '032-012-3456',
    hours: '매일 12:00 - 익일 03:00',
    image: '/images/stores/3F/108karaoke/108karaoke1.jpeg'
  },
  {
    id: 'ci-coin-karaoke',
    name: '씨아이코인노래방',
    floor: '3f',
    category: '노래방',
    shortDescription: '동전으로 즐기는 가성비 좋은 노래방',
    description: `
      <p>씨아이코인노래방은 동전을 넣어 이용하는 합리적인 가격의 노래방입니다.</p>
      <p>혼자서도 부담 없이 즐길 수 있는 1인 부스와 친구들과 함께할 수 있는 일반 룸을 갖추고 있으며, 최신 곡부터 인기 가요까지 다양한 노래를 제공합니다.</p>
      <h3>이용 방법</h3>
      <ul>
        <li>1곡당 500원</li>
        <li>5곡 묶음 코인 2,000원</li>
        <li>10곡 묶음 코인 3,500원</li>
      </ul>
    `,
    contact: '032-123-4567',
    hours: '매일 11:00 - 익일 02:00',
    image: '/images/stores/3F/singingroom/singingroom1.jpeg'
  },
  {
    id: 'dieth-clinic',
    name: '디에뜨의원',
    floor: '3f',
    category: '피부과/성형외과',
    shortDescription: '맞춤형 피부 관리와 미용 시술',
    description: `
      <p>디에뜨의원은 개인별 맞춤형 피부 관리와 미용 시술을 제공하는 전문 클리닉입니다.</p>
      <p>피부과 전문의의 정확한 진단을 바탕으로 피부 질환 치료는 물론, 레이저 시술, 보톡스, 필러 등 다양한 미용 시술을 안전하게 받을 수 있습니다.</p>
      <h3>주요 시술</h3>
      <ul>
        <li>여드름/흉터 치료</li>
        <li>레이저 토닝</li>
        <li>보톡스/필러</li>
        <li>리프팅 시술</li>
      </ul>
    `,
    contact: '032-234-5678',
    hours: '평일 10:00 - 19:00, 토요일 10:00 - 15:00 (일요일 휴무)',
    image: '/images/stores/3F/dietclinic/dietclinic1.jpeg'
  },
  
  // 4층 매장
  {
    id: 'isense blacklabel-pc',
    name: '아이센스 블랙라벨PC방',
    floor: '4f',
    category: 'PC방',
    shortDescription: '고사양 컴퓨터와 쾌적한 환경의 PC방',
    description: `
       <p>블랙라벨PC방은 최고 사양의 컴퓨터와 쾌적한 환경을 갖춘, 게이머를 위한 공간입니다.</p>
      <p>144Hz 모니터, 게이밍 마우스와 키보드, 음성 방송이 가능한 고급 헤드셋 등 최상의 장비를 제공하며, 다양한 음식과 음료도 즐길 수 있습니다.</p>
      <h3>이용 요금</h3>
      <ul>
        <li>전자기기 판매</li>
        <li>스마트폰 수리</li>
        <li>컴퓨터 유지보수</li>
        <li>맞춤형 IT 솔루션</li>
      </ul>
    `,
    contact: '032-345-6789',
    hours: '연중무휴 24시간',    
    image: '/images/stores/4F/isenseblacklabelpc/isenseblacklabelpc1.jpeg'
  },
  {
    id: 'ko-gym',
    name: '복싱전문 케이오짐',
    floor: '4f',
    category: '스포츠',
    shortDescription: '복싱 전문 트레이닝과 체력 관리',
    description: `
      <p>케이오짐은 복싱을 중심으로 한 전문 트레이닝과 체력 관리 프로그램을 제공하는 피트니스 센터입니다.</p>
      <p>전문 복싱 코치의 지도 아래 기초 기술부터 고급 기술까지 배울 수 있으며, 체중 관리와 체력 향상을 위한 다양한 프로그램도 운영합니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>복싱 기초 클래스</li>
        <li>1:1 복싱 트레이닝</li>
        <li>복싱 다이어트</li>
        <li>체력 강화 프로그램</li>
      </ul>
    `,
    contact: '032-567-8901',
    hours: '평일 06:00 - 23:00, 주말 09:00 - 18:00',
    image: '/images/stores/4F/kogym/kogym1.jpeg'
  },
  {
    id: 'zenith-clinic',
    name: '제니스',
    floor: '4f',
    category: '피부/비뇨기과',
    shortDescription: '피부 질환과 비뇨기과 질환 전문 클리닉',
    description: `
      <p>제니스는 피부 질환과 비뇨기과 질환을 전문적으로 진료하는 의원입니다.</p>
      <p>최신 의료 장비와 숙련된 의료진이 정확한 진단과 효과적인 치료를 제공하여 환자의 건강과 삶의 질 향상에 기여합니다.</p>
      <h3>주요 진료 분야</h3>
      <ul>
        <li>여드름, 아토피 등 피부 질환</li>
        <li>요로 감염, 전립선 질환 등 비뇨기과 질환</li>
        <li>레이저 피부 시술</li>
        <li>성기능 장애 치료</li>
      </ul>
    `,
    contact: '032-678-9012',
    hours: '평일 09:00 - 18:00, 토요일 09:00 - 13:00 (점심시간 13:00-14:00, 일요일 휴무)',
    image: '/images/stores/medical.jpg'
  },
  
  // 5층 매장
  {
    id: 'savezone-culture',
    name: '세이브존 문화센터',
    floor: '5f',
    category: '교육/문화',
    shortDescription: '다양한 문화 강좌와 취미 활동 공간',
    description: `
      <p>세이브존 문화센터는 다양한 연령대를 위한 문화 강좌와 취미 활동 공간을 제공합니다.</p>
      <p>요리, 미술, 음악, 어학, 공예 등 다양한 분야의 전문 강사진과 함께 새로운 취미를 발견하고 자기계발의 기회를 가질 수 있습니다.</p>
      <h3>주요 강좌</h3>
      <ul>
        <li>요리 클래스 (한식, 양식, 베이킹)</li>
        <li>미술 교실 (수채화, 유화, 드로잉)</li>
        <li>음악 레슨 (피아노, 기타, 우쿨렐레)</li>
        <li>어학 강좌 (영어, 일본어, 중국어)</li>
        <li>DIY 공예 (가죽공예, 목공예, 도자기)</li>
      </ul>
    `,
    contact: '032-789-0123',
    hours: '평일 10:00 - 21:00, 주말 10:00 - 18:00',
    image: '/images/stores/culture.jpg'
  },
  
  // 6층 매장
  {
    id: 'huhan-clinic',
    name: '후한의원',
    floor: '6f',
    category: '피부/비만/통증',
    shortDescription: '피부, 비만, 통증 치료 전문 의원',
    description: `
      <p>후한의원은 피부 질환, 비만, 통증을 종합적으로 치료하는 전문 의원입니다.</p>
      <p>최신 의료 기술과 개인별 맞춤 치료 프로그램으로 환자의 건강한 삶을 지원합니다.</p>
      <h3>주요 진료 분야</h3>
      <ul>
        <li>피부 질환 (여드름, 아토피, 건선)</li>
        <li>비만 클리닉 (지방 분해, 체중 관리)</li>
        <li>통증 치료 (허리, 목, 관절 통증)</li>
        <li>레이저 치료</li>
      </ul>
    `,
    contact: '032-890-1234',
    hours: '평일 09:00 - 18:00, 토요일 09:00 - 13:00 (일요일 휴무)',
    image: '/images/stores/medical-clinic.jpg'
  },
  {
    id: 's-flying-pilates',
    name: 'S플라잉&필라테스',
    floor: '6f',
    category: '피트니스',
    shortDescription: '공중 요가와 필라테스를 결합한 프리미엄 운동',
    description: `
      <p>S플라잉&필라테스는 공중 요가와 필라테스를 결합한 프리미엄 피트니스 센터입니다.</p>
      <p>특수 천을 이용한 플라잉 요가, 리포머와 캐딜락 등 다양한 필라테스 기구를 활용한 전문적인 수업을 제공합니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>플라잉 요가</li>
        <li>리포머 필라테스</li>
        <li>맨몸 필라테스</li>
        <li>임산부 필라테스</li>
      </ul>
    `,
    contact: '032-901-2345',
    hours: '평일 06:00 - 22:00, 주말 09:00 - 18:00',
    image: '/images/stores/6F/pilates/pilates1.jpeg'
  },
  {
    id: 'st-academy',
    name: '에스티어학원',
    floor: '6f',
    category: '교육',
    shortDescription: '전문적인 외국어 교육 어학원',
    description: `
      <p>에스티어학원은 영어, 중국어, 일본어 등 다양한 외국어 교육을 제공하는 전문 어학원입니다.</p>
      <p>원어민 강사와 체계적인 커리큘럼으로 실용적인 언어 능력을 기를 수 있으며, 시험 대비 과정도 운영합니다.</p>
      <h3>주요 강좌</h3>
      <ul>
        <li>회화 중심 영어/중국어/일본어</li>
        <li>토익/토플/HSK/JLPT 시험 대비</li>
        <li>비즈니스 외국어</li>
        <li>1:1 맞춤 교육</li>
      </ul>
    `,
    contact: '032-012-3456',
    hours: '평일 10:00 - 22:00, 토요일 10:00 - 18:00 (일요일 휴무)',
    image: '/images/stores/6F/est/est1.jpeg'
  },
  {
    id: 'prs-academy',
    name: 'PRS창의독서논술학원',
    floor: '6f',
    category: '교육',
    shortDescription: '창의력과 사고력을 키우는 독서논술 전문 학원',
    description: `
      <p>PRS창의독서논술학원은 아이들의 창의력, 사고력, 표현력을 키우는 독서논술 전문 교육기관입니다.</p>
      <p>체계적인 독서 지도와 연령별 맞춤 논술 교육으로 학생들의 종합적인 국어 능력 향상을 돕습니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>연령별 독서 지도</li>
        <li>창의 논술</li>
        <li>독후감 작성</li>
        <li>NIE(신문 활용 교육)</li>
      </ul>
    `,
    contact: '032-123-4567',
    hours: '평일 13:00 - 20:00, 토요일 10:00 - 18:00 (일요일 휴무)',
    image: '/images/stores/6F/prs/prs1.jpeg'
  },
  
  // 7층 매장
  {
    id: 'jedaero-academy',
    name: '제대로 학원',
    floor: '7f',
    category: '종합',
    shortDescription: '초중고 전 과목 종합 교육',
    description: `
      <p>제대로 학원은 초등학교, 중학교, 고등학교 학생들을 위한 종합 교육 학원입니다.</p>
      <p>국어, 영어, 수학, 과학, 사회 등 전 과목에 대한 체계적인 교육과 개인별 맞춤 학습 관리를 제공합니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>교과목별 정규 수업</li>
        <li>내신 대비 집중 과정</li>
        <li>수능 대비 과정</li>
        <li>1:1 맞춤 과외</li>
      </ul>
    `,
    contact: '032-234-5678',
    hours: '평일 15:00 - 22:00, 토요일 10:00 - 18:00 (일요일 휴무)',
    image: '/images/stores/academy.jpg'
  },
  {
    id: 'grace-mental',
    name: '은혜정신과',
    floor: '7f',
    category: '의료',
    shortDescription: '정신건강 관리와 상담 서비스',
    description: `
      <p>은혜정신과는 정신건강 관리와 전문적인 상담 서비스를 제공하는 의원입니다.</p>
      <p>우울증, 불안장애, 스트레스 관리 등 다양한 정신건강 문제에 대한 진단과 치료를 수행하며, 환자의 프라이버시를 최우선으로 보호합니다.</p>
      <h3>주요 진료 분야</h3>
      <ul>
        <li>우울증/불안장애</li>
        <li>스트레스 관리</li>
        <li>수면장애</li>
        <li>아동청소년 정신건강</li>
        <li>노인 정신건강</li>
      </ul>
    `,
    contact: '032-345-6789',
    hours: '평일 09:00 - 18:00, 토요일 09:00 - 13:00 (일요일 휴무)',
    image: '/images/stores/mental.jpg'
  },
  {
    id: 'rebloom-beauty',
    name: '리블룸뷰티',
    floor: '7f',
    category: '미용',
    shortDescription: '토탈 뷰티 케어 서비스',
    description: `
      <p>리블룸뷰티는 헤어, 메이크업, 네일, 피부 관리 등 토탈 뷰티 케어 서비스를 제공하는 프리미엄 살롱입니다.</p>
      <p>최신 트렌드와 개인의 스타일을 고려한 맞춤형 뷰티 서비스로 고객의 아름다움을 한층 더 빛나게 합니다.</p>
      <h3>주요 서비스</h3>
      <ul>
        <li>헤어 스타일링 (커트, 염색, 펌)</li>
        <li>메이크업 (일상, 웨딩, 특수)</li>
        <li>네일 아트</li>
        <li>피부 관리</li>
      </ul>
    `,
    contact: '032-456-7890',
    hours: '매일 10:00 - 20:00',
    image: '/images/stores/7F/rebloom/rebloom1.jpeg'
  },
  {
    id: 'kids-speech',
    name: '키즈스피치마루지',
    floor: '7f',
    category: '교육',
    shortDescription: '아이들의 자신감과 표현력을 키우는 스피치 교육',
    description: `
      <p>키즈스피치마루지는 아이들의 자신감과 표현력을 키우는 전문 스피치 교육기관입니다.</p>
      <p>발표력, 말하기 능력, 인성 교육을 통해 미래 사회에 필요한 소통 능력을 갖춘 인재로 성장할 수 있도록 돕습니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>기초 스피치 훈련</li>
        <li>발표력 향상 과정</li>
        <li>토론 교실</li>
        <li>NIE 스피치</li>
      </ul>
    `,
    contact: '032-567-8901',
    hours: '평일 15:00 - 20:00, 토요일 10:00 - 15:00 (일요일 휴무)',
    image: '/images/stores/speech.jpg'
  },
  
  // 8층 매장
  {
    id: 'nice-screen-golf',
    name: '나이스스크린골프',
    floor: '8f',
    category: '스포츠',
    shortDescription: '실내에서 즐기는 고품질 스크린 골프',
    description: `
      <p>나이스스크린골프는 최신 시뮬레이션 기술로 실내에서도 현실감 넘치는 골프를 즐길 수 있는 공간입니다.</p>
      <p>국내외 유명 골프 코스를 구현한 스크린과 정밀한 센서, 고품질 타석으로 진짜 필드에서 플레이하는 듯한 경험을 제공합니다.</p>
      <h3>주요 서비스</h3>
      <ul>
        <li>스크린 골프 (국내외 100여개 코스)</li>
        <li>스윙 분석</li>
        <li>레슨 프로그램</li>
        <li>음료 및 간식 서비스</li>
      </ul>
    `,
    contact: '032-678-9012',
    hours: '매일 06:00 - 익일 02:00',
    image: '/images/stores/8F/golf/golf1.jpeg'
  },
  
  // 9층 매장
  {
    id: 'jedaero-academy-9f',
    name: '제대로 학원',
    floor: '9f',
    category: '교육',
    shortDescription: '체계적인 교육 시스템의 종합 학원',
    description: `
      <p>9층에 위치한 제대로 학원은 초등학교부터 고등학교 학생들을 위한 체계적인 교육 시스템을 갖춘 종합 학원입니다.</p>
      <p>7층의 제대로 학원과 연계하여 더 넓은 공간과 다양한 프로그램으로 학생들의 학습을 지원합니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>고등부 특화 과정</li>
        <li>수능 집중 대비반</li>
        <li>심화 학습 프로그램</li>
        <li>진학 상담</li>
      </ul>
    `,
    contact: '032-789-0123',
    hours: '평일 15:00 - 22:00, 토요일 10:00 - 18:00 (일요일 휴무)',
    image: '/images/stores/academy2.jpg'
  },
  {
    id: 'yoga-ashram',
    name: '요가 아쉬람',
    floor: '9f',
    category: '요가',
    shortDescription: '전통 요가와 명상을 통한 심신의 건강',
    description: `
      <p>요가 아쉬람은 전통적인 요가와 명상을 통해 심신의 건강을 추구하는 요가 전문 스튜디오입니다.</p>
      <p>경험 풍부한 요가 강사들이 하타 요가, 빈야사 요가, 아쉬탕가 요가 등 다양한 요가 수업을 진행하며, 마음의 안정을 위한 명상 수업도 제공합니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>하타 요가</li>
        <li>빈야사 요가</li>
        <li>아쉬탕가 요가</li>
        <li>명상 클래스</li>
      </ul>
    `,
    contact: '032-890-1234',
    hours: '평일 06:00 - 22:00, 주말 09:00 - 18:00',
    image: '/images/stores/9F/yoga/yoga1.jpeg'
  },
  {
    id: 'brown-crystal-pt',
    name: '브라운크리스탈PT',
    floor: '9f',
    category: '피트니스',
    shortDescription: '전문 트레이너의 1:1 맞춤 PT',
    description: `
      <p>브라운크리스탈PT는 전문 트레이너의 1:1 맞춤형 퍼스널 트레이닝을 제공하는 프리미엄 피트니스 센터입니다.</p>
      <p>체계적인 분석과 개인별 목표에 맞는 운동 프로그램으로 효과적인 신체 변화와 건강한 라이프스타일을 지원합니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>1:1 퍼스널 트레이닝</li>
        <li>체형 교정</li>
        <li>다이어트 프로그램</li>
        <li>근력 강화 트레이닝</li>
      </ul>
    `,
    contact: '032-901-2345',
    hours: '평일 06:00 - 23:00, 주말 09:00 - 18:00',
    image: '/images/stores/9F/pt/pt1.jpeg'
  },
  {
    id: 'lkd-baekjin',
    name: '(주)LKD / (주)백진',
    floor: '9f',
    category: '사무실',
    shortDescription: '기업 사무실',
    description: `
      <p>(주)LKD와 (주)백진은 다인타운 9층에 위치한 기업 사무실입니다.</p>
      <p>각 기업의 고유 사업 영역에서 혁신적인 서비스와 제품을 개발하며, 지역 경제 발전에 기여하고 있습니다.</p>
      <h3>회사 정보</h3>
      <ul>
        <li>사업 영역: 각 회사별 세부 정보</li>
        <li>상담 및 방문은 사전 예약 필요</li>
      </ul>
    `,
    contact: '032-012-3456',
    hours: '평일 09:00 - 18:00 (주말 휴무)',
    image: '/images/stores/office.jpg'
  },
  {
    id: 'seoksoon-music',
    name: '석순음악교실',
    floor: '9f',
    category: '음악',
    shortDescription: '전문적인 음악 교육과 다양한 악기 레슨',
    description: `
      <p>석순음악교실은 다양한 악기 레슨과 음악 이론을 가르치는 전문 음악 교육 기관입니다.</p>
      <p>피아노, 바이올린, 첼로, 플루트, 기타 등 다양한 악기 레슨을 제공하며, 개인별 수준과 목표에 맞는 맞춤형 교육을 진행합니다.</p>
      <h3>주요 프로그램</h3>
      <ul>
        <li>악기별 개인 레슨</li>
        <li>음악 이론 수업</li>
        <li>앙상블 수업</li>
        <li>정기 연주회</li>
      </ul>
    `,
    contact: '032-123-4567',
    hours: '평일 13:00 - 21:00, 토요일 10:00 - 18:00 (일요일 휴무)',
    image: '/images/stores/music.jpg'
  },
  {
    id: 'nail-shop',
    name: '네일샵',
    floor: '9f',
    category: '미용',
    shortDescription: '트렌디한 네일 디자인과 케어 서비스',
    description: `
      <p>네일샵은 최신 트렌드를 반영한 네일 디자인과 전문적인 네일 케어 서비스를 제공합니다.</p>
      <p>젤 네일, 아크릴 네일, 네일 아트, 손톱 및 발톱 케어 등 다양한 서비스로 고객의 개성과 스타일을 표현합니다.</p>
      <h3>주요 서비스</h3>
      <ul>
        <li>젤 네일</li>
        <li>네일 아트</li>
        <li>케어 프로그램</li>
        <li>속눈썹 연장</li>
      </ul>
    `,
    contact: '032-234-5678',
    hours: '매일 10:00 - 20:00',
    image: '/images/stores/9F/9fnail/9fnail1.jpeg'
  }
];

// 특정 층의 매장 목록 가져오기
export function getStoresByFloor(floor: string): Store[] {
  // 경비실은 제외
  return stores.filter(store => 
    store.floor === floor && store.name !== '경비실'
  );
}

// 특정 ID의 매장 정보 가져오기
export function getStoreById(floor: string, id: string): Store | null {
  return stores.find(store => store.floor === floor && store.id === id) || null;
}