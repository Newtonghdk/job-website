# ImpactJobs by NEIC

Suggested subdomain: **impactjobs.neic.in**. Alternatives: **socialcareers.neic.in**, **purpose.neic.in**, **csrjobs.neic.in**. No domain or DNS changes have been made.

## Current blocker
The supplied Apps Script endpoint returned Google's Page not found response during verification on 14 September 2026. The website uses that exact supplied deployment URL in config.js; it needs a valid public deployment before real jobs can load. The supplied sheet currently contains an example Python Developer listing with example.com application details. Replace that record with a real vacancy or set its Status to Draft before launch.

## Connect the data
1. Open the supplied Google Sheet, then Extensions > Apps Script.
2. Preserve a copy of the existing script. Add the code from apps-script.gs, replacing conflicting doGet functions.
3. Run setupImpactJobs once and grant the requested spreadsheet permissions. It adds Category and Experience columns and an empty Ads tab; it does not replace existing job rows.
4. Use Deploy > Manage deployments to update the web app to a new version, or create a web app deployment. Execute as your account and allow access to Anyone. Only intentionally public fields are returned by this script, and only Published rows are exposed. Workspace administrators may restrict public web apps.
5. Copy the resulting /exec URL into config.js if it differs. Check it in a signed-out browser: it must return a JSON object containing jobs and ads, without a sign-in page.
6. Load the site over HTTP(S). Test a published job, detail link, filters and application link.

## Jobs
Keep the existing headers. Each published job needs a unique stable ID, Title and Status = Published. Add Category and Experience to make those filters useful. Use an absolute https:// application URL. Plain text descriptions preserve line breaks. Use ISO YYYY-MM-DD dates (format date cells accordingly); DD-MM-YYYY is also accepted. Expired jobs disappear from searches and remain accessible by direct link with applications disabled while still published. Set Draft or remove the row to unpublish it. Duplicate IDs must be avoided.

## Ads
Use the Ads tab with headers in ads-template.csv. Required fields: Title, Target URL, Status = Published. Placement is top, bottom, or all (blank means bottom). Sponsor, Description, Image URL and CTA Text are optional. Start Date and End Date use YYYY-MM-DD; blank dates mean no date restriction. Images and destination URLs must be absolute HTTP(S) URLs. Use direct public image links. Empty, draft, expired or invalid ads produce no empty ad blocks. No ads are fabricated. Sponsored links are labelled and marked rel=sponsored.

Site data refreshes every 60 seconds while a page is visible and when returning to a tab. New page visits fetch fresh data. A failed refresh retains previous jobs with an explicit notice and hides ads. No fake fallback jobs or hidden persistent job cache are used.

## Publish
Upload only public files: index.html, job.html, organizations.html, saved.html, about.html, resources.html, employers.html, advertise.html, privacy.html, terms.html, 404.html, style.css, script.js, config.js. This is a static website; no build dependencies are needed. Do not upload the guide PDF, index.txt (old source), Apps Script source, test files or this README. The existing original index.txt and guide PDF are preserved.

On your hosting provider, add impactjobs.neic.in as a custom domain and point its DNS record to the exact target the provider supplies. Enable HTTPS. No particular DNS target can be specified until a hosting provider is chosen. Configure 404.html as the error page if supported. After the actual domain is connected, configure canonical URLs and a sitemap for that domain. Job data is rendered in the browser; search-engine job indexing is not guaranteed by this static implementation.

Employer and advertising pages link to NEIC for enquiries because no verified email address or submission form was supplied. Saved jobs use browser local storage and have no account/device sync.

## Local check
Run node --check script.js and node test.cjs. Serve with node server.cjs, then open http://127.0.0.1:4173. The local server serves only public website files.

## Cloudflare Pages (selected hosting)

The upload-ready archive is impactjobs-website.zip. It contains only the public site and Cloudflare _headers settings. The Cloudflare dashboard browser is currently signed out; no deployment or DNS change has been made.

1. Sign in at https://dash.cloudflare.com.
2. Open Workers & Pages, choose Create application, and choose Pages / drag-and-drop upload. Use a Pages Direct Upload project, not a Workers script upload.
3. Enter a project name such as neic-impactjobs (subject to availability), upload impactjobs-website.zip and deploy. No build command is needed.
4. Open the resulting project, choose Custom domains and set up impactjobs.neic.in.
5. Complete the DNS instructions shown by Cloudflare. If neic.in already uses Cloudflare DNS in the same account, it can create the required record. Otherwise create a CNAME for impactjobs pointing to the actual Pages hostname shown by your project. Associate the subdomain in Pages before manually adding a CNAME.
6. Wait for the custom domain and TLS certificate to become active. Check the HTTPS homepage, a job detail and saved jobs. Pages extensionless URLs are supported.
7. After fixing the Apps Script deployment, update config.js and upload a new deployment if the /exec URL changed. This repair is necessary for live content; deploying the archive alone cannot repair Google's deployment.

Official references:
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
