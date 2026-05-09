# StudyBase JavaScript Layout

Shared browser scripts are grouped by responsibility:

- `account/`: account pages, account sidebar, sign-in checks, settings warnings, and usage-time account helpers.
- `auth/`: login, iframe, logout, and resource-verification helpers.
- `config/`: site configuration, theme setup, and config-driven bootstrapping.
- `core/`: shared platform/session/service glue.
- `features/`: feature-specific scripts that do not belong to every page.
- `layout/`: navbar and footer rendering.
- `monitoring/`: endpoint, environment, time, analytics, and runtime notices.
- `privacy/`: cookie consent and sensitive-page safety helpers.
- `resources/`: resource database and protected-resource helpers.
- `safety/`: AutoSafe search and text-to-speech filtering scripts.
- `support/`: support article content and rendering.
- `ui/`: small visual/UI helper scripts.

Keep new shared scripts in the closest folder by responsibility, then update `site.config.json` or page-level `<script>` tags as needed.
