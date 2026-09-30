# 📄 GTA (거제 납세자 대책위원회) 리뉴얼 프로젝트 통합 명세서 및 계정 정보

> **안내**: 본 문서는 GTA 홈페이지 리뉴얼 프로젝트의 모든 서버, DB, 깃허브, 호스팅, 도메인 계정 정보 및 유지보수 이력을 정리한 문서입니다.

---

## 1. 📌 프로젝트 기본 정보
* **프로젝트명**: GTA 홈페이지 리뉴얼 및 데이터 이관 구축
* **사업 기간**: 2026.09.18 ~ 2026.10.16 (4주 / 20영업일)
* **정식 도메인 전환 일시**: 2026년 10월 15일 ~ 16일 예정
* **프로젝트 담당자**: 최주호 (`010-2579-4682` / `kyungdea1@gmail.com`)

---

## 2. 🔐 신규 웹사이트 관리자 (Admin) 로그인 정보
* **관리자 페이지 URL**: `https://gta-taxpayers-association.vercel.app/admin`
* **관리자 ID**: **`deokang7`** (또는 `admin`)
* **관리자 비밀번호**: **`gta7273`** *(기존 카페24 계정과 동일하게 통합 설정)*

---

## 3. 🗄️ 신규 클라우드 데이터베이스 (Supabase PostgreSQL)
* **DB 플랫폼**: Supabase Cloud PostgreSQL (서울 리전 `ap-northeast-2` 고성능 DB)
* **로그인 계정**: [https://supabase.com](https://supabase.com) (`ChoiJuHo80` 깃허브 소셜 연동)
* **조직명 (Organization)**: `gta-database`
* **프로젝트명 (Project Name)**: `ChoiJuHo80's Project`
* **DB 계정 (User)**: `postgres`
* **DB 비밀번호**: **`gta7273korea*`**
* **마이그레이션 현황**: 기존 카페24 DB 4,934건 회원/세무 신청 데이터 100% 이관 완료

---

## 4. 🐙 깃허브 (GitHub) 소스코드 저장소
* **저장소 URL**: [https://github.com/ChoiJuHo80/gta-taxpayers-association](https://github.com/ChoiJuHo80/gta-taxpayers-association)
* **관리 계정**: `ChoiJuHo80`
* **메인 브랜치**: `main`
* **특징**: 코드 푸시(`git push`) 시 Vercel 클라우드 호스팅으로 30초 내 자동 빌드 및 실시간 배포

---

## 5. 🚀 Vercel 클라우드 호스팅 (신규 인프라)
* **호스팅 플랫폼**: Vercel (Next.js 전용 글로벌 엣지 CDN 네트워크)
* **관리자 로그인**: [https://vercel.com](https://vercel.com) (`ChoiJuHo80` 깃허브 소셜 로그인)
* **스테이징 배포 URL**: `https://gta-taxpayers-association.vercel.app`
* **제공 인프라**:
  * 월 100GB 트래픽 (4,000명 회원 접속 넉넉히 수용)
  * 전 세계 100개+ 엣지 CDN (국내외 고속 접속)
  * 무상 자동 TLS 1.3 SSL 보안 인증서
  * 1초 원클릭 이전 버전 복구(Rollback) 기능

---

## 6. 🗄️ 기존 카페24 (Cafe24) 호스팅 & DB 정보
* **카페24 서비스 관리**: [https://hosting.cafe24.com](https://hosting.cafe24.com)
  * **계정 ID**: `deokang7`
  * **계정 PW**: `gta7273`
  * **서비스 만료일**: `2027.07.29` (연장 완료 상태)
* **기존 Database (MySQL)**:
  * **DB Host**: `gtakorea.org` (`211.41.79.13`)
  * **DB Name / User**: `deokang7`
  * **DB Password**: `gta7273korea*` *(2026-09-30 변경 완료)*
  * **DB 백업 생성 파일**: `/home/hosting_users/deokang7/deokang7-20260930.dump` (62.7MB SFTP 백업 다운로드 완료)
* **기존 SFTP/SSH 접속 정보**:
  * **FTP/SSH Host**: `gtakorea.org` (`211.41.79.13`)
  * **SFTP/SSH Port**: **`3822`**
  * **ID**: `deokang7`
  * **Password**: `gta7273korea*`
* **기존 웹메일 (`@gtakorea.org`)**:
  * **웹메일 관리자 URL**: [http://webmail.gtakorea.org](http://webmail.gtakorea.org)
  * **관리자 ID**: `deokang7` (또는 `depkang7`)
  * **관리자 PW**: `dkagh1950`

---

## 7. 🌐 도메인 및 DNS 전환 계획 (10/15~16)
* **대표 도메인**: `gtakorea.org` / `www.gtakorea.org`
* **웹사이트 A 레코드 (A Record)**: `76.76.21.21` (10/15~16 전환 시 설정)
* **웹메일 MX 레코드 (MX Record)**: 기존 카페24 유지 (`@gtakorea.org` 메일함 100% 지속 사용)

---

## 8. 📝 변경 이력 (Change Log)
* **2026-09-18**: 프로젝트 착수 및 사업수행계획서/요구사항 명세서 수립
* **2026-09-30**: 깃허브 공개 저장소(`ChoiJuHo80/gta-taxpayers-association`) 생성 및 초기 커밋 완료
* **2026-09-30**: Vercel 글로벌 클라우드 호스팅 연동 및 1차 스테이징 배포 완료
* **2026-09-30**: 카페24 DB 비밀번호 `gta7273korea*`로 재설정 및 DB 백업 파일(`deokang7-20260930.dump`, 62.7MB) SFTP(포트 3822) 다운로드 완료
* **2026-09-30**: Supabase 신규 PostgreSQL DB 생성 (`ChoiJuHo80's Project`, 서울 리전) 및 4,934건 데이터 100% 마이그레이션 완료
* **2026-09-30**: 관리자(Admin) 로그인 아이디/비밀번호를 `deokang7 / gta7273`으로 최종 변경 적용 완료
