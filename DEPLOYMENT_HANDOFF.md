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
1. 일본어 구현
2. 모바일 최적화
3. 개발자도구 단축키/우클릭 방지
4. 운영 보안 최종 점검
5. 관리자 bootstrap secret 제거
