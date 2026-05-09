# StudyBase Asset Layout

Static assets are grouped by what they are, not by the page that first used them.

- `css/main/`: the active shared stylesheet used by public pages.
- `css/features/`: CSS for standalone feature pages that still keep their public HTML route.
- `css/legacy/`: older CSS kept for reference after being folded into the main stylesheet.
- `data/`: JSON catalogs and content data used by pages and scripts.
- `images/`: site icons, page imagery, app/resource icons, tutorial images, and alert artwork.
- `js/`: shared and feature browser scripts, grouped by responsibility.

Keep public HTML pages in their existing route folders. Move reusable assets here, then update every reference in HTML, JS, CSS, JSON, and docs.
