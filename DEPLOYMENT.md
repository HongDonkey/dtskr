# DTSKR deployment outline

This repository includes templates for a single-server Linux deployment:

- `deploy/nginx/dtskr.conf.example`
- `deploy/systemd/dtskr-backend.service.example`

Replace `example.com`, certificate paths, artifact paths, and service-account names before use.

## Layout

```text
https://example.com/       -> Vite production files in /var/www/dtskr
https://example.com/api/   -> Spring Boot on 127.0.0.1:8080
```

The production backend defaults to loopback-only binding. Do not expose port 8080 through the
host firewall. Nginx is the only public entry point and overwrites the forwarded client-IP headers
used by the request-board audit and rate limiter.

## Build artifacts

Frontend:

```powershell
npm ci
npm run build
```

Deploy the contents of `dist/` to `/var/www/dtskr`.

Backend:

```powershell
.\gradlew clean bootJar
```

Deploy the generated JAR from `build/libs/` to `/opt/dtskr/backend/dtskrB.jar`.

## Required runtime configuration

Store secrets in `/etc/dtskr/dtskr.env` with permissions limited to root and the backend service
account. Required or strongly recommended values are documented in the backend `.env.example`,
`ADMIN_BOOTSTRAP.md`, `DATABASE_ROLES.md`, and `REQUEST_STORAGE.md`.

At minimum configure:

```text
SPRING_PROFILES_ACTIVE=prod
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8080
DB_HOST=127.0.0.1
DB_NAME=digimon_time_stranger
DB_USERNAME=<runtime-user>
DB_PASSWORD=<runtime-secret>
FLYWAY_DB_USERNAME=<migration-user>
FLYWAY_DB_PASSWORD=<migration-secret>
REQUEST_UPLOAD_DIR=/var/lib/dtskr/uploads/requests
SESSION_COOKIE_SECURE=true
```

Use the administrator bootstrap values only when no active administrator exists, then remove the
bootstrap password and restart after the first password change.

## Release verification

1. Validate Nginx with `nginx -t` before reload.
2. Start the backend and confirm Flyway V14 and V15 complete.
3. Verify `/api/health` through HTTPS, not directly through port 8080.
4. Confirm administrator bootstrap, forced password change, re-login, and logout.
5. Submit a request and verify the client IP, attachment, and rate-limit response in the admin UI.
6. Refresh `/requests` and `/digimons/{id}` directly to verify SPA fallback.
7. Confirm SQL values and exception stack traces do not appear in production logs or HTTP errors.
