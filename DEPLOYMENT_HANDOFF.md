# Digivolution Lab 배포 현황

## Production
- Domain: digivolutionlab.com
- AWS EC2: Ubuntu 24.04
- Instance: t3.micro
- Java: 21
- Node: 22
- Nginx: 1.24
- MySQL: EC2 내부 설치
- Swap: 2GB

## Architecture
Internet
→ Nginx 80/443
  → React static files
  → /api/* → Spring Boot 127.0.0.1:8080
→ MySQL localhost:3306

## Backend
Repository: dtskrB
Branch: main

Spring Boot:
- prod profile
- systemd service: dtskr.service
- -Xms128m
- -Xmx384m

Restart helper:
- Backend repository: `bash scripts/restart-backend.sh`
- It restarts `dtskr.service`, waits for `/api/health`, verifies both API and DB are `UP`, and prints recent journal logs on failure.
- Overrides: `DTSKR_SERVICE_NAME`, `DTSKR_HEALTH_URL`, `DTSKR_HEALTH_MAX_ATTEMPTS`, `DTSKR_HEALTH_RETRY_SECONDS`.

Environment:
- /etc/dtskr/dtskr.env
- credentials are NOT stored in Git

Uploads:
- /var/lib/dtskr/uploads/requests

DB:
- digimon_time_stranger
- runtime user: digimon_admin
- flyway user: dtskr_flyway

## Frontend
Repository: dtskr
Branch: main

Build:
npm ci
npm run build

Deployment:
/var/www/digivolutionlab

Deploy helper:
- Frontend repository: `bash deploy/deploy-frontend.sh`
- It runs `npm ci`, lint, production build, synchronizes `dist/` to `/var/www/digivolutionlab`, and checks the public URL.
- Nginx restart is unnecessary for static-file changes.
- `/var/www/digivolutionlab` must be writable by the deployment account; the script does not use `sudo`.
- Overrides: `DTSKR_FRONTEND_DEPLOY_DIR`, `DTSKR_FRONTEND_URL`.

API:
relative /api/* paths

Git LFS:
Required.
After clone:
git lfs install
git lfs pull

## Nginx
Frontend:
/var/www/digivolutionlab

API proxy:
127.0.0.1:8080

SEO endpoints:
- `/sitemap.xml` -> `http://127.0.0.1:8080/sitemap.xml`
- `/robots.txt` is included in the frontend build; it points to the root sitemap.
- Set `SITE_BASE_URL=https://digivolutionlab.com` in `/etc/dtskr/dtskr.env`.
- Keep the exact-match `/sitemap.xml` proxy above the SPA `try_files` location.

Domain:
digivolutionlab.com
www.digivolutionlab.com

HTTPS:
Let's Encrypt / Certbot
auto-renew tested successfully

## TODO

- Set a long random `VISITOR_HASH_SECRET` in the backend production environment before deploying V21.
- Verify that `/api/admin/statistics/today` shows the daily unique visitor count after deployment.
1. 모바일 최적화
2. 개발자도구 단축키/우클릭 방지

## Completed
- 일본어 구현 및 운영 배포
- 운영 보안 최종 점검
- 관리자 bootstrap secret 제거

## Operator preference

- 운영환경 터미널에서 파일을 편집하는 절차는 항상 `vim` 기준으로 안내한다.
- `nano`, `sudoedit` 등 다른 편집기 명령은 사용자가 별도로 요청하지 않는 한 안내하지 않는다.

## 2026-08-23 작업 기록

### 완료 및 운영 반영 확인

- 프론트엔드와 백엔드 저장소의 현재 브랜치는 모두 `main`이며 작업 트리는 깨끗한 상태다.
- 반응형 화면의 헤더, 메뉴, 성장 단계 버튼, 내비게이션 바, 진화 연결선 및 관리자 화면 레이아웃을 정리했다.
- 오늘 방문자와 전체 방문자 통계를 관리자 화면에 표시하고 운영 데이터 조회를 확인했다.
- 요청 게시판 상태 변경과 관리자 답변 기능을 확인했다.
- 한국어, 영어, 일본어 화면 및 일본어 운영 배포를 확인했다.
- 백엔드와 프론트엔드 배포 스크립트 및 `deployBack`, `deployFront` 운영 절차를 정리했다.
- Google Search Console 도메인 소유권 확인용 DNS TXT 레코드를 등록했다.
- 운영 Nginx에서 `/sitemap.xml`을 백엔드로 전달하도록 설정하고 XML 응답을 확인했다.
- Search Console에 `https://digivolutionlab.com/sitemap.xml` 제출을 완료했다.

### SEO 작업

- 페이지별 title, description, canonical, robots, Open Graph, Twitter Card, `hreflang`, JSON-LD 메타데이터를 구성했다.
- 언어별 URL을 `?lang=ko|en|ja` 형식으로 제공하도록 정리했다.
- 백엔드에서 동적 `/sitemap.xml`과 `/robots.txt`를 제공하고 디지몬 상세 URL을 사이트맵에 포함했다.
- 검색 키워드에 `디지몬 스토리 타임 스트레인저`, `디지몬 타임스트레인저`, `진화 트리`, `진화 조건`을 반영했다.
- 관리자, 요청 게시판 및 개인정보 처리방침 등 검색 노출이 불필요한 화면은 `noindex` 대상으로 처리했다.

### AdSense 준비

- AdSense 사이트 확인 스크립트를 `<head>`에 한 번만 로드하도록 적용했다.
- 게시자 ID `pub-7914694136025419`가 포함된 `public/ads.txt`를 추가했고 빌드 산출물 복사를 확인했다.
- 초대형 데스크톱 화면의 좌우 여백에만 표시되는 300x600 수동 광고 영역을 구현했다.
- 좌우 광고 슬롯은 `VITE_ADSENSE_LEFT_SLOT`, `VITE_ADSENSE_RIGHT_SLOT` 환경변수로 주입하도록 구성했다.
- Google CMP는 동의, 거부, 옵션 관리가 가능한 방식으로 선택했다.
- AdSense 사이트 상태는 현재 `준비 중`이며 승인 심사를 기다리는 단계다.

### 다음 작업

1. 운영 프론트에서 최신 SEO 제목, AdSense 확인 코드 및 `/ads.txt`의 실제 응답을 재확인한다.
2. Search Console URL 검사에서 한국어 메인과 대표 디지몬 상세 페이지의 색인을 요청하고 색인 현황을 관찰한다.
3. AdSense 승인 후 좌우 수동 디스플레이 광고 단위를 생성하고 두 슬롯 환경변수를 설정한 뒤 프론트를 재배포한다.
4. 개인정보 처리방침에 AdSense, 쿠키, 맞춤형/비맞춤형 광고, Google 광고 파트너 및 동의 철회 방법을 추가한다.
5. 광고가 실제 노출되기 전에 이미지 제공자에게 수익화된 사이트에서의 이용 범위도 최종 확인한다.
