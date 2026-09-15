# Free hourly job collection — ImpactJobs

This collector uses **GitHub Actions + Google Sheets**. It uses no ChatGPT, Codex, AI API, paid scraper, or computer left running. The existing website continues reading its existing Apps Script public feed.

The repository is https://github.com/Newtonghdk/job-website (public, default branch `main`, checked 15 September 2026).

## What is ready, and what you must activate

The code can collect jobs immediately in preview mode. Automated Sheet writes start only after you upload the files and add the Google credential below. Uploading website HTML alone does not install this automation.

Upload these files to the same paths in your GitHub repository:

| File | Purpose |
| --- | --- |
| `.github/workflows/collect-jobs.yml` | Hourly schedule and manual Run workflow button |
| `.gitignore` | Keeps credentials, installed libraries and collected output out of Git |
| `collector/package.json` | Free dependencies and commands |
| `collector/package-lock.json` | Exact dependency versions |
| `collector/config.json` | Sheet IDs, location filters, limits and default sources |
| `collector/core.mjs` | Normalization, dates, quality checks, duplicate detection |
| `collector/http.mjs` | Public HTTP access, robots rules and timeouts |
| `collector/adapters.mjs` | API/feed/job-page parsers |
| `collector/sheets.mjs` | Google authentication and safe Sheet writes |
| `collector/run.mjs` | Collection process and reporting |
| `collector/test/collector.test.mjs` | Offline tests |
| `collector/probe.mjs` | Optional read-only source troubleshooting |
| `COLLECTOR_SETUP.md` | This guide |
| `README.md` | Link to this guide |

No changes are required to `index.html`, `script.js`, `config.js`, or `apps-script.gs`. Do not upload `collector/node_modules`, `collector/output`, or any credential JSON. The existing Apps Script already reads only `Published` rows. New columns are internal review metadata; the existing public feed does not expose them.

## One-time Google setup

1. Open [Google Cloud Console](https://console.cloud.google.com/). Create a project such as `impactjobs-collector`. You do not need a paid AI service, Cloud Scheduler, Cloud Run or a billing account for the Sheets API.
2. Under **APIs & Services → Library**, enable **Google Sheets API** in that project.
3. Under **IAM & Admin → Service Accounts**, create `impactjobs-collector`. Leave project-wide roles blank; this service needs access only to your two spreadsheets.
4. Open that service account → **Keys → Add key → Create new key → JSON**. Download the key. Never commit it to GitHub or paste it into a public file.
5. Copy the service account email (ending in `iam.gserviceaccount.com`). Share your [Jobs spreadsheet](https://docs.google.com/spreadsheets/d/1SxlxuNUPxVC40lTI3Z7VpJKjFeExBqvVO0dNd0Na3Rc/edit) with that email as **Editor**. Share your [Sources spreadsheet](https://docs.google.com/spreadsheets/d/1FlZRZt8tPXIPgOxT05uYcGDcGz2BlHh9d7EfnPFc3Nc/edit) as **Viewer**. Do not make either sheet publicly editable.
6. In the repository, open **Settings → Secrets and variables → Actions → New repository secret**. Name it exactly `GOOGLE_SERVICE_ACCOUNT_JSON`. Paste the complete contents of the downloaded JSON key into the secret value. Save it.

If a Workspace administrator prohibits service-account keys or external sharing, they must allow this setup, or use a different credential mechanism. Do not put a secret into `config.js`; that file is public website code.

## Run now, then every hour

1. Upload the files to `main` and enable GitHub Actions if asked.
2. Open **Actions → Collect jobs → Run workflow**.
3. Leave **Preview only** unchecked to update the spreadsheet, then click **Run workflow**.
4. A successful run appends new Draft rows and a **Collector Log** entry. Open a new row and check the description, deadline, application instructions and Review Notes.
5. Change `Status` to `Published` only after review. The site refreshes its feed automatically.

The included cron is `30 * * * *` in UTC: **00:00, 01:00, 02:00 … 23:00 in India**. This includes both AM and PM. It is the scheduled start; GitHub can delay or drop scheduled runs. No free shared runner can promise an exact second or completed Sheet update at :00. Collection itself also takes time.

GitHub disables scheduled workflows in public repositories after **60 days without repository activity**. Re-enable the workflow when GitHub notifies you; keep an occasional real maintenance update. Review the timestamp in Collector Log rather than assuming every hour succeeded. Do not create a second concurrent writer against the same Jobs sheet.

The workflow has read-only repository permissions, a 10-minute cap, and one concurrent Sheet writer. It stores no job artifacts or caches in GitHub. Standard hosted runners in public repositories are free; private repositories have a monthly allowance and may incur charges. Keep this repository public for the intended free setup. Google Sheets API usage has no additional charge within its quotas.

## Sources: adding websites without changing code

Your Sources sheet is a directory. `Active = Yes` alone cannot turn a homepage into a working job API.

Keep existing columns A:E. Add these headers to F:K if they are not already present:

`Collector Adapter | Collector URL | Collector Enabled | Company | Category | Options JSON`

For a configured source, set both `Active` and `Collector Enabled` to `Yes`. `No` disables it. Existing CSRBOX settings fall back to the tested repository configuration when the new columns are blank. Ashoka is a repository default; add its row to the sheet to control it there.

| Adapter | Expected source | Details |
| --- | --- | --- |
| `lever` | `https://api.lever.co/v0/postings/EMPLOYER?mode=json` | Official public job API; full job sections. Set Company. |
| `greenhouse` | `https://boards-api.greenhouse.io/v1/boards/BOARD/jobs?content=true` | Official public board API; board name must exist. Set Company. |
| `json` | An authorised JSON endpoint | Array of job objects, or `{ "jobs": [...] }`; configurable field mapping. |
| `rss` | Actual RSS or Atom feed | Feed descriptions; set Company and location if the feed does not supply them. Short/incomplete entries are rejected. |
| `jsonld` | Job page, or configured listing page | Reads embedded schema.org JobPosting data. Set linkSelector for listings. |
| `html` | Permitted public job page/list | JobPosting data or explicit CSS selectors; site-specific setup required. |
| `csrbox` | Official CSRBOX careers page | Dedicated adapter for the current employer layout. |

JSON source fields: `sourceId`, `title`, `company`, `description`, `location`, `postedDate`, `expiryDate`, `applyUrl`, `sourceUrl`, `skills`, `qualifications`, `responsibilities`, `benefits`, `jobType`, `salary`, `experience`, `workMode`, `howToApply`, `about`, `companyWebsite`, `email`.

For a JSON response shaped differently, Options JSON can be:

```json
{"itemsPath":"results","fieldMap":{"sourceId":"id","title":"name","company":"employer.name","description":"body","location":"city","applyUrl":"url"}}
```

For a public HTML listing with no structured job data, an example configuration is:

```json
{"linkSelector":"a.job-link","selectors":{"title":"h1","description":".job-description","location":".job-location","applyUrl":"a.apply","expiryDate":".closing-date"}}
```

These example selectors are not universal. Inspect the real website and test that source before enabling it. Listing links are limited to the same website. JavaScript-only listings, PDF notices and login-protected pages need a separate adapter or manual entry. No browser impersonation or CAPTCHA bypass is included.

Optional source filters: `locationPattern` and `keywordPattern` (JavaScript regular expressions), `maxDetails`, and `location` for an employer feed. Global location filtering targets India and explicitly worldwide-remote jobs. Unknown-location jobs are skipped, not assumed to be in India. Category defaults are editorial grouping, not employer claims. Posting dates are never fabricated from collection time.

## Coverage of your existing source list

- CSRBOX and Ashoka have dedicated/default configurations.
- Other employers can often use their actual Greenhouse/Lever API or an HTML/JSON-LD adapter. The collector supports many configured sources, but it does not pretend every URL has the same format.
- NGOBOX, DevNetJobsIndia, IDR, Ground Zero, India Water Portal, Tata Trusts, Teach For India, CARE, Oxfam, ActionAid and similar sites need their specific feed, API or permitted job-detail configuration. Existing directory entries are logged as **Needs setup** until configured. Paywalled or member-only details are not collected.
- NCS, UPSC, SSC, railways, IBPS and Employment News often publish examination notices, PDFs or general listings. Those need dedicated parsers and relevance checks; they are not silently treated as social-impact jobs.
- LinkedIn, Naukri, Indeed, Glassdoor, Foundit, Shine and similar services may restrict automation. Use an officially supported feed/API or manual import; a public URL or `Active = Yes` is not permission to bypass restrictions.
- NGO Darpan is a directory, not a vacancy feed.
- ReliefWeb now requires a pre-approved API appname. It is not enabled with a fabricated key. Its API shape needs a dedicated mapping/adapter after approval.
- Generic RSS feeds often lack employer/location/deadline details. They are discovery feeds unless their data passes the same quality requirements as every other source.

The HTML collector honours robots.txt and stops on access errors. A missing robots.txt is not a reuse licence: periodically review each source's terms, and obtain permission where required. Source content is stored as Draft for review; full descriptions should only be republished when the employer or source permits it.

## Duplicate and review behaviour

New records are matched against all existing rows, including Draft, Published, Hidden and Expired records, and against other jobs in the same run.

1. Same source and source job ID: retain the existing main entry.
2. Same cleaned detail/application URL **and** employer/title: retain the main entry. Tracking parameters and URL fragments do not create new jobs.
3. Same normalized employer/title/location across sources: retain the main entry. Senior/Sr., New Delhi/Delhi, Bangalore/Bengaluru and Gurgaon/Gurugram variants are normalized.
4. Distinct requisition IDs on the same source remain separate even when they share a title or application form. A new dated vacancy after an old deadline can remain separate.

The first existing match is the main entry. Duplicate source keys are remembered in `Collector Keys`; `Last Seen` is updated. Existing descriptions and review decisions are preserved, and duplicates are counted in Collector Log. A rejected job should be set to Hidden rather than deleted, so it is not imported again.

This is conservative matching, not an AI identity system: materially different titles, employer aliases, missing locations and repostings without dates can require manual review. Do not merge two genuine requisitions merely because their descriptions sound similar. Existing duplicate rows are not deleted automatically. Existing demo listings are also left unchanged; review their Published status separately.

Full source descriptions retain headings and bullets. Additional columns store qualifications, responsibilities, application instructions, work mode, source URL and review notes where available. Unsupported/missing fields remain blank. Deadlines that are already past, future posting dates, non-matching locations and descriptions shorter than 100 characters are filtered. Some employers give no closing date; those rows are Drafts with a review note. Job source availability is not a guarantee that applications are still accepted.

## Limits and troubleshooting

Defaults: 100 new jobs per run, 15 sources per run, 15 detail pages per HTML source, 20-second requests and a 6-minute collection budget. Large lists rotate across hours; APIs return their available list on each run. Increasing limits may exceed the workflow cap. Check deferred counts and errors instead of assuming an entire website was scanned.

- **Missing secret:** repeat Google setup; do not paste the key into the repository.
- **Google 403:** confirm Sheets API enabled and both sheets shared with the service-account email.
- **No job links / selector error:** website layout changed; update adapter/configuration and preview it.
- **robots disallow / 403 / 429:** stop or reduce collection; use an approved endpoint. Do not bypass restrictions.
- **Partial/Error:** successful sources can still add Drafts; the workflow fails visibly so you can investigate. Collector Log records each source outcome.
- **No jobs added:** check duplicates, expired deadlines, location filters and sources without adapter settings.
- **25,000-row limit:** archive older data with care; preserve IDs/keys for entries you do not want imported again. Collector Log also grows over time and can be archived separately.
- **Formula-looking text:** new source values are written as strings, never evaluated as spreadsheet formulas.

Developer check from the `collector` directory:

```sh
npm ci --ignore-scripts
npm test
npm run preview
# Preview one source:
node run.mjs --dry-run --source=Ashoka
```

A preview without credentials uses repository source defaults and does not read live duplicates. Its private local `output/latest.json` contains candidate jobs and decisions. Authenticated previews also read the current Sources and Jobs sheets. The production workflow always requires the credential, reads the latest sheet before committing, then verifies its new rows.

## Official references

- [GitHub schedule timing and inactivity limits](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [GitHub Actions free public runners and private quotas](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [Google Sheets API quotas and pricing](https://developers.google.com/workspace/sheets/api/limits)
- [Google service-account credentials](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)
- [Greenhouse Job Board API](https://docs.greenhouse.io/job-board.html)
- [Lever public postings API](https://github.com/lever/postings-api)
- [ReliefWeb API approval requirement](https://apidoc.reliefweb.int/)

## Verified initial run and upload package

On 15 September 2026, the collector read 20 vacancies from the two tested sources. Three were outside the location filter; one duplicate was retained under its existing main entry. Sixteen new Drafts were saved to Jobs rows 57-72. The duplicate's conflicting deadline was recorded for review. This initial import used the connected Sheet tools and does not activate the GitHub schedule.

All 23 offline collector tests and the existing website tests passed. Service-account authentication and the GitHub-hosted run still need verification after the credential setup above. Sheet values were verified through the API; browser visual verification was unavailable because Google was signed out. Long descriptions remain available in the cell editor and on the site after review and publication.

Extract impactjobs-collector-update.zip, then upload its contents to the repository root while preserving folder paths, including .github/workflows/. Uploading the ZIP itself does not activate the workflow. The archive excludes credentials, installed libraries and collected output.
