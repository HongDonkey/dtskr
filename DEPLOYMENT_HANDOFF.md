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
