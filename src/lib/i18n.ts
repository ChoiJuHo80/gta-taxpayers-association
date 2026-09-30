export type Language = 'ko' | 'en';

export const translations = {
  ko: {
    brandName: 'GTA 거제 납세자 대책위원회',
    brandSub: 'Geoje Taxpayers Committee',
    publicTax: '공익 세무',

    // Main Navigation Top Categories
    catAbout: 'ABOUT US',
    catTaxLaw: 'Tax Law',
    catTaxGuide: 'Tax Guide',
    catTaxService: 'Tax Service',

    // Sub Navigation Items
    navIntroduction: 'Introduction',
    navBenefit: 'Benefit of GTA',
    navLocation: 'Location',
    navKoreanTaxLaw: 'Korean tax law',
    navTreaties: 'Treaties with foreign countries',
    navTaxFlow: 'Tax flow',
    navNecessaryDocs: 'Necessary document for joining',
    navIncomeTaxTable: 'Income tax table',
    navTaxDeduction: 'Tax deduction item',
    navContactUs: 'Contact us',

    // General Nav links
    navLookup: '상담 조회',
    navNotices: '알림/자료실',
    navFreeConsult: '온라인 무료 상담',
    navSignUp: '회원가입',
    navAdmin: '관리자',
    
    // Hero
    heroBadge: '2026 거제 납세자 대책위원회 공식 플랫폼',
    heroTitle1: '공정한 세무 행정,',
    heroTitle2: '거제 납세자 대책위원회',
    heroTitle3: '가 함께하겠습니다.',
    heroSub: '전문 세무사와 함께하는 무료 세무 상담 서비스 및 개정 세법 정보를 안전하고 신속하게 이용하세요.',
    heroBtnApply: '온라인 무료 세무 상담 신청',
    heroBtnShare: 'SNS 공유하기',
    heroShareCopied: '주소 복사 완료!',
    heroStatusTitle: '실시간 세무상담 현황',
    heroStatusSub: 'SSL 256bit 암호화 안전 접수 중',
    heroStatusAvailable: '상담 접수 가능',
    heroCountLabel: '누적 세무 상담 건수',
    heroSatLabel: '상담 만족도',
    heroSecNotice: '상담 시 제출하신 모든 개인정보 및 세무 증빙 서류는 암호화 처리되어 관리되며 외부에 절대 공개되지 않습니다.',

    // Services
    serviceTitle: '주요 맞춤형 서비스',
    serviceSub: '거제 납세자 대책위원회에서 제공하는 핵심 세무 복지 서비스입니다.',
    svc1Title: '1:1 온라인 세무 상담',
    svc1Desc: '양도소득세, 종합소득세, 상속/증여세 등 복잡한 세금 고민을 전문 세무사가 무료로 직접 검토해 드립니다.',
    svc1Btn: '상담 신청하기',

    svc2Title: '상담 처리 상태 실시간 조회',
    svc2Desc: '신청하신 세무 상담의 처리 상태(접수, 진행중, 완료)와 전문 세무사의 검토 의견을 비밀번호로 즉시 확인하세요.',
    svc2Btn: '내 상담 조회하기',

    svc3Title: '개정 세법 자료실 & FAQ',
    svc3Desc: '매년 변경되는 개정 세법 해설서와 납세자가 자주 묻는 질문(FAQ)을 통해 유용한 절세 혜택 정보를 받아보세요.',
    svc3Btn: '자료실 바로가기',

    // Location
    mapTag: '오시는 길 & 문의 안내',
    mapTitle: '거제 납세자 대책위원회 사무소 위치',
    mapDesc: '방문 상담이 필요하신 경우 사전 예약을 통해 사무실 방문 상담을 지원하고 있습니다.',
    mapAddrHeader: '주소',
    mapAddr: '경상남도 거제시 거제대로 3696 #107 (거제 납세자 대책위원회 전용 사무실)',
    mapPhoneHeader: '전화문의',
    mapPhone: '055-688-2141 (상담시간: 평일 09:00 ~ 18:00)',
    mapFaxHeader: '팩스',
    mapFax: '055-688-2142',
    mapEmailHeader: '이메일',
    mapEmail: 'gta@gtakorea.org',
    mapCert: 'Google Maps Global API v3 연동 인증',
    mapDirections: '구글 지도에서 길찾기 →',

    // Contact Form
    contactTitle: 'Contact Us',
    contactSub: 'Send us your inquiries and our expert tax advisors will respond via email to gta@gtakorea.org.',
    contactName: 'Full Name',
    contactEmail: 'Email Address',
    contactSubject: 'Subject',
    contactMessage: 'Message',
    contactBtnSend: 'Send Message to GTA',
    contactSuccessMsg: 'Your message has been successfully sent to GTA (gta@gtakorea.org).',

    // Member Registration
    signUpBadge: 'GTA 회원가입',
    signUpTitle: '거제 납세자 대책위원회 회원가입',
    signUpSub: '회원으로 가입하시면 1:1 전담 세무사 상담 및 주요 절세 자료 혜택을 받으실 수 있습니다.',
    memberTypeIndividual: '개인 납세자 회원',
    memberTypeCorporate: '기업/소상공인 회원',
    
    fieldFullName: '성명 (또는 대표자명)',
    fieldPhone: '휴대폰 번호',
    fieldEmail: '이메일 주소',
    fieldPassword: '비밀번호 (8자리 이상)',
    fieldPasswordConfirm: '비밀번호 확인',
    fieldBizNo: '사업자등록번호 (기업회원인 경우)',
    fieldAddress: '거제시 거주 주소 (또는 사업장 소재지)',
    fieldInterest: '주 관심 세무 분야',

    agreeTerms: '이용약관 및 개인정보 수집·이용에 동의합니다 (필수)',
    btnRegister: '회원가입 완료하기',
    registerSuccess: '회원가입이 완료되었습니다! 1:1 무료 세무 상담 서비스를 이용해보세요.',

    // Footer
    footerBrand: 'GTA 거제 납세자 대책위원회',
    footerDesc: '거제 납세자의 권익 보호와 공정한 세무 행정을 위해 함께합니다. 전문 세무사 그룹의 상담 지원 및 최신 세무 자료를 제공합니다.',
    footerQuickLinks: '주요 바로가기',
    footerAbout: '협회 소개 및 연혁',
    footerConsult: '온라인 세무 상담 신청',
    footerLookup: '상담 접수 내역 조회',
    footerNotices: '세무 자료실 & FAQ',
    footerContactTitle: '고객 지원 & 오시는 길',
    footerPhone: '055-688-2141 (대표전화)',
    footerAddress: '경상남도 거제시 거제대로 3696 #107',

    // Admin Page
    adminSplashTitle: 'GTA 거제 납세자 대책위원회',
    adminSplashSub: '통합 세무 관리 시스템 (Integrated EMR/LMS)',
    adminBadge: '통합 정보 시스템 전용 포털',
    adminHeroTitle1: '신뢰받는 공익 세무,',
    adminHeroTitle2: '안전한 관리자 포털',
    adminHeroDesc: '거제 납세자의 1:1 온라인 세무 상담 접수 내역, 서류 암호화 관리 및 실시간 처리 현황을 일괄적으로 통합 관리하는 전용 모듈입니다.',
    adminCard1Title: '2FA 2단계 보안 인증',
    adminCard1Desc: '인가된 세무사 전용 접속',
    adminCard2Title: 'AES-256 데이터 암호화',
    adminCard2Desc: '상담 서류 100% 암호화 보관',
    
    adminLoginTitle: '관리자 로그인',
    adminLoginSub: '등록된 관리자 계정 아이디와 암호를 입력하십시오.',
    adminLabelId: '관리자 계정 ID / 사번',
    adminPlaceholderId: 'admin 또는 관리자 사번',
    adminLabelPw: '비밀번호 (PASSWORD)',
    adminPlaceholderPw: '비밀번호 입력 (기본: gta7273)',
    adminRemember: '아이디 저장',
    adminForgot: '암호 재설정 문의',
    adminBtnSignIn: '시스템 로그인 →',
    adminSecFooter: 'SSL 256bit Secure Encrypted Portal',
  },
  en: {
    brandName: 'Geoje Taxpayers Committee (GTA)',
    brandSub: 'Geoje Taxpayers Committee',
    publicTax: 'Public Tax',

    // Main Navigation Top Categories
    catAbout: 'ABOUT US',
    catTaxLaw: 'Tax Law',
    catTaxGuide: 'Tax Guide',
    catTaxService: 'Tax Service',

    // Sub Navigation Items
    navIntroduction: 'Introduction',
    navBenefit: 'Benefit of GTA',
    navLocation: 'Location',
    navKoreanTaxLaw: 'Korean tax law',
    navTreaties: 'Treaties with foreign countries',
    navTaxFlow: 'Tax flow',
    navNecessaryDocs: 'Necessary document for joining',
    navIncomeTaxTable: 'Income tax table',
    navTaxDeduction: 'Tax deduction item',
    navContactUs: 'Contact us',

    // General Nav links
    navLookup: 'Status Lookup',
    navNotices: 'Notices & Resources',
    navFreeConsult: 'Free Tax Counsel',
    navSignUp: 'Member Sign-Up',
    navAdmin: 'Admin Portal',

    // Hero
    heroBadge: '2026 Official Geoje Taxpayer Rights Protection Platform',
    heroTitle1: 'Fair Tax Administration,',
    heroTitle2: 'Geoje Taxpayers Committee',
    heroTitle3: 'is with you.',
    heroSub: 'Access free tax consultation and updated tax law information safely and quickly with certified tax accountants.',
    heroBtnApply: 'Apply for Free Tax Counseling',
    heroBtnShare: 'Share on SNS',
    heroShareCopied: 'URL Copied!',
    heroStatusTitle: 'Real-time Tax Counseling Status',
    heroStatusSub: 'SSL 256bit Encrypted Secure Receiving',
    heroStatusAvailable: 'Counseling Available',
    heroCountLabel: 'Total Consultations',
    heroSatLabel: 'Satisfaction Rate',
    heroSecNotice: 'All personal information and tax documents submitted are strictly encrypted and never disclosed externally.',

    // Services
    serviceTitle: 'Core Customized Services',
    serviceSub: 'Essential tax welfare services provided by the Geoje Taxpayers Committee.',
    svc1Title: '1:1 Online Tax Counseling',
    svc1Desc: 'Professional tax accountants directly review complex tax issues such as Capital Gains Tax, Income Tax, and Inheritance/Gift Tax for free.',
    svc1Btn: 'Apply for Counseling',

    svc2Title: 'Real-time Status Tracking',
    svc2Desc: 'Check the processing status (Received, In Progress, Completed) and accountant notes using your password.',
    svc2Btn: 'Lookup My Counseling',

    svc3Title: 'Tax Law Library & FAQ',
    svc3Desc: 'Receive useful tax-saving information through annual tax law guides and Frequently Asked Questions (FAQ).',
    svc3Btn: 'Go to Tax Library',

    // Location
    mapTag: 'Location & Contact Info',
    mapTitle: 'Geoje Taxpayers Committee Office Location',
    mapDesc: 'If in-person consultation is required, we support office visits via advance appointment.',
    mapAddrHeader: 'Address',
    mapAddr: '#107, 3696 Geoje-daero, Geoje-city, Gyeongsangnam-do, Korea',
    mapPhoneHeader: 'Phone Inquiries',
    mapPhone: '+82(0)55-688-2141 (Hours: Weekdays 09:00 ~ 18:00)',
    mapFaxHeader: 'Fax',
    mapFax: '+82(0)55-688-2142',
    mapEmailHeader: 'E-mail',
    mapEmail: 'gta@gtakorea.org',
    mapCert: 'Google Maps Global API v3 Certified',
    mapDirections: 'Open in Google Maps Directions →',

    // Contact Form
    contactTitle: 'Contact Us',
    contactSub: 'Send us your inquiries and our expert tax advisors will respond via email to gta@gtakorea.org.',
    contactName: 'Full Name',
    contactEmail: 'Email Address',
    contactSubject: 'Subject',
    contactMessage: 'Message',
    contactBtnSend: 'Send Message to GTA',
    contactSuccessMsg: 'Your message has been successfully sent to GTA (gta@gtakorea.org).',

    // Member Registration (Sign-Up)
    signUpBadge: 'GTA Member Sign-Up',
    signUpTitle: 'Geoje Taxpayers Committee Registration',
    signUpSub: 'Register as a member to receive 1:1 dedicated tax consultation and tax-saving resources.',
    memberTypeIndividual: 'Individual Taxpayer Member',
    memberTypeCorporate: 'Business / Corporate Member',

    fieldFullName: 'Full Name (or Representative Name)',
    fieldPhone: 'Mobile Phone Number',
    fieldEmail: 'Email Address',
    fieldPassword: 'Password (8+ characters)',
    fieldPasswordConfirm: 'Confirm Password',
    fieldBizNo: 'Business Registration Number (For Corporate)',
    fieldAddress: 'Geoje Residential Address (or Business Location)',
    fieldInterest: 'Primary Tax Field of Interest',

    agreeTerms: 'I agree to the Terms of Service & Privacy Policy (Required)',
    btnRegister: 'Complete Registration',
    registerSuccess: 'Registration completed successfully! Enjoy 1:1 free tax counseling services.',

    // Footer
    footerBrand: 'Geoje Taxpayers Committee (GTA)',
    footerDesc: 'We work together to protect taxpayer rights and ensure fair tax administration in Geoje. Providing expert tax counseling and updated tax resources.',
    footerQuickLinks: 'QUICK LINKS',
    footerAbout: 'About GTA & History',
    footerConsult: 'Apply for Tax Counseling',
    footerLookup: 'Status Lookup',
    footerNotices: 'Tax Resources & FAQ',
    footerContactTitle: 'SUPPORT & LOCATION',
    footerPhone: '+82(0)55-688-2141 (Main Phone)',
    footerAddress: '#107, 3696 Geoje-daero, Geoje-city, Gyeongsangnam-do, Korea',

    // Admin Page
    adminSplashTitle: 'GTA Geoje Taxpayers Committee',
    adminSplashSub: 'Integrated Tax Management Portal (EMR/LMS)',
    adminBadge: 'Dedicated Enterprise Information Portal',
    adminHeroTitle1: 'Trusted Public Tax Services,',
    adminHeroTitle2: 'Secure Admin Portal',
    adminHeroDesc: 'An integrated portal to manage 1:1 online tax consultation records, encrypted file archives, and real-time processing status for Geoje taxpayers.',
    adminCard1Title: '2FA Two-Factor Authentication',
    adminCard1Desc: 'Authorized Tax Accountant Access Only',
    adminCard2Title: 'AES-256 Data Encryption',
    adminCard2Desc: '100% Encrypted Tax Document Storage',

    adminLoginTitle: 'Administrator Sign-In',
    adminLoginSub: 'Please enter your authorized admin account ID and password.',
    adminLabelId: 'ADMIN ACCOUNT ID / EMPLOYEE ID',
    adminPlaceholderId: 'Enter admin ID or employee ID',
    adminLabelPw: 'PASSWORD',
    adminPlaceholderPw: 'Enter password (Default: gta7273)',
    adminRemember: 'Remember Me',
    adminForgot: 'Password Reset Inquiry',
    adminBtnSignIn: 'Sign In to Portal →',
    adminSecFooter: 'SSL 256bit Secure Encrypted Portal',
  }
};
