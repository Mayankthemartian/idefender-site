iDefender + Decap integration

1. Upload this folder to a GitHub repo.
2. Open admin/config.yml and replace:
   REPLACE_WITH_YOUR_GITHUB_USERNAME/REPLACE_WITH_YOUR_REPO_NAME
   with your actual GitHub repo, for example:
   yourname/idefender-site
3. Host the repo on Netlify or Cloudflare Pages.
4. Open /admin on your live site.
5. Edit content there.

Important:
- This integration keeps the original HTML as the fallback.
- js/cms-bind.js overrides text/images/links after page load.
- If the CMS content is missing, the original HTML still shows.
