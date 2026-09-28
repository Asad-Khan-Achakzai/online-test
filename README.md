# One-time examination

A browser examination for a single sitting. Candidates scan one venue QR code, enter their name and roll number, and complete a multiple-choice paper on their own phone.

An attempt has two endings:

- **Completed** — the candidate submits the last answer, or the clock reaches zero.
- **Terminated** — the browser reports that the candidate left the examination.

There is no “continue test” step after a violation, and a finished attempt cannot be started again in that browser.

This is not an operating-system kiosk. A phone browser cannot disable the Home button, the app switcher, or the lock screen. The application uses every relevant browser signal, and it ends the attempt when one of those signals fires.

## Install

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Check | Command |
| --- | --- |
| Unit tests | `npm test` |
| Lint | `npm run lint` |
| Types | `npm run typecheck` |
| Production files | `npm run build` |

Fullscreen is only available in a secure context (`https://` or `localhost`). Vercel provides HTTPS.

## Questions

Edit `src/data/questions.ts`. Each item has an `id`, the question text, options, and `correctAnswer`. `correctAnswer` is an option id, not a letter. Replacing the file is the whole question workflow. There is no question editor.

The landing page reads the question count from that file. After a question change, rebuild and redeploy before the sitting. Do not change the bank while phones already hold an in-progress attempt: a record that no longer matches the bank is rejected and that phone cannot start again.

## Duration and rules

Edit `src/config/examConfig.ts`.

- `durationMinutes` — countdown length. The clock is `start time + duration`, not a resettable counter.
- `allowQuestionRandomization` and `allowOptionRandomization` — each attempt gets a stable shuffled order from its attempt id. Shuffling options does not change which option id is correct.
- `terminateOnVisibilityChange` — hidden page (tab, Home, another app, screen lock, when the browser reports it).
- `terminateOnFullscreenExit` — fullscreen was entered, then left.
- `terminateOnWindowBlur` — the window lost focus and did not regain it.
- `terminateOnNavigation` — browser Back / `popstate`.
- `terminateOnReload` — a new page load finds an in-progress attempt whose JavaScript context is gone. That attempt is marked terminated. This is deliberate: a reload drops fullscreen and leaves a gap where the page was not being watched. Set it to `false` only while debugging.
- `showScoreToCandidate` — numeric score on the completion screen. Correct answers are never shown.
- `adminAccessCode` — convenience gate for `/admin`. It is inside the JavaScript bundle. It is not an account system.
- `googleSheetsEndpoint` — optional. Leave it empty until you have an endpoint.

The candidate URL is `/test/medical-entry-2026` unless you change `testId`. The venue QR page is `/display/medical-entry-2026`.

## QR code

1. Deploy the site over HTTPS.
2. On the hall display, open `/display/medical-entry-2026` **on that deployed site**.
3. The page builds the QR from the address in the browser. A code made on `localhost` only opens localhost.
4. Download or print the code. Every candidate scans the same image. The code does not contain a name or roll number.

## Deploy

Deploy the repository on Vercel. The site must be served with HTTPS so Android Chrome can enter fullscreen.

Results, roll-number checks, and retakes are stored in Redis so they survive across serverless invocations. Connect an Upstash Redis database in the Vercel project. The integration provides `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which `Redis.fromEnv()` reads. Do not add separate Upstash URL or token variables.

Redeploy after the database is connected. Without those two variables, a candidate cannot start an attempt.

On a local machine, with those variables unset, results are written to `data/received-results.json` instead.

Generate the hall QR only after the public address is final. Open `/display/medical-entry-2026` on the deployed site, not on localhost.

## How leaving the test is detected

Monitoring starts when the candidate presses **Start test**, in the same tap that requests fullscreen.

| Signal | Typical cause | Result |
| --- | --- | --- |
| `visibilitychange` → hidden | Another tab, Home, another app, screen lock, or the browser backgrounding the page | Terminated, reason `PAGE_HIDDEN` |
| `blur` that remains after a short confirmation | Another window took focus. Ignored during the brief fullscreen transition at the start | Terminated, reason `WINDOW_BLUR` |
| `fullscreenchange` after fullscreen was entered | Candidate left fullscreen | Terminated, reason `FULLSCREEN_EXIT` |
| `popstate` | Back button, including many Android browser Back actions | Terminated, reason `NAVIGATION_ATTEMPT` |
| `pagehide` / `beforeunload` | Refresh, close, or navigation away | Terminated, reason `BROWSER_EXIT` |
| Page load finds `IN_PROGRESS` | Refresh, reopening the QR, or a new tab of the same URL | Terminated, reason `BROWSER_EXIT` |
| `BroadcastChannel` or a storage lock | A second examination tab | Terminated, reason `MULTI_TAB` |
| Clock reaches zero | Time expired | **Completed**, reason `TIME_EXPIRED` |
| Last answer submitted | Candidate finished | **Completed**, reason `MANUAL_SUBMISSION` |

`terminateAttempt` writes `TERMINATED` immediately, stores the reason and time, stops the paper, and will not start it again. `completeAttempt` is the only path to `COMPLETED`. Neither function changes a finished attempt back to `IN_PROGRESS`.

The timer stores `startedAt` and subtracts that from the current time. Refreshing cannot add time: with `terminateOnReload` enabled, a refresh ends the attempt; with it disabled, the original start time is still used.

Answers are written to `localStorage` as they are selected. A network drop after the page has loaded does not erase them. The questions are part of the downloaded site, so the paper itself does not need the network once it has opened.

## Browser limits

Be explicit with candidates and invigilators:

- The app cannot block the Home button, the iOS app switcher, Android Recents, or the lock button.
- It cannot tell an incoming call apart from the candidate opening WhatsApp. If the browser hides the page, the attempt ends.
- iPhone Safari often refuses `requestFullscreen` for a normal page. On those phones, leaving fullscreen is not a signal, because fullscreen never started. Visibility and focus still apply. Test the exact iPhones you will use.
- `beforeunload` cannot stop a mobile browser from leaving. It is only used to record the departure.
- A technically able candidate can clear site data, use a second phone, or read the downloaded JavaScript. The correct answers are in that JavaScript because scoring happens on the phone. They are not rendered in the page, and the screen never marks an answer right or wrong.
- Records live in the browser that took the test. Clearing storage, or using a private window that discards storage when it closes, bypasses the one-attempt rule. Collecting phones or posting results to a server is required if that matters.
- Two candidates must not share one browser profile. One profile holds one attempt for this test.

A managed device or a native kiosk app is required if the phone itself must be locked.

## Test on the phones you will use

Run this on the Android Chrome and iPhone Safari models candidates will bring, using the deployed HTTPS site. Desktop checks do not replace that.

For each violation, confirm the screen says the attempt was terminated and that reopening the QR code does not show **Start test**.

- Complete the paper normally, including the final **Submit test**.
- Let the clock reach zero on a short `durationMinutes` in a throwaway config, then set the real duration again.
- Switch tabs.
- Press Home, open another app, and return.
- Lock the screen and unlock it.
- Leave fullscreen after it has started (Android Chrome).
- Use the browser Back button.
- Refresh, close the tab, and scan the QR again.
- Open the examination URL in a second tab while a paper is in progress.
- Turn on airplane mode after the paper has started, answer a question, and confirm the answer is still selected.
- After completion, and again after termination, try to start over.

While debugging on your own computer, `/admin` can delete **this browser’s** record so you can run the paper again. The default access code is `exam-admin`. Change it in `examConfig.ts`. Do not treat that page as secure, and do not put it on the hall screen.

## Results

`saveResult` in `src/lib/exam/examResults.ts` writes the score to `localStorage` first. The examination screens call that function only. To send a copy elsewhere, set `googleSheetsEndpoint` or replace the body of `saveResult`.

A Google Apps Script web app can read a plain-text POST:

```javascript
function doPost(e) {
  const result = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.appendRow([
    result.candidateId,
    result.candidateName,
    result.score,
    result.totalQuestions,
    result.percentage,
    result.status,
    result.startedAt,
    result.endedAt,
    result.terminationReason || "",
    result.completionReason || "",
  ]);
  return ContentService.createTextOutput("ok");
}
```

Deploy it as a web app that anyone may invoke, paste the URL into `googleSheetsEndpoint`, and rebuild. The browser sends `text/plain` with `no-cors`, so a failure is silent. The phone still keeps the local copy. If the phone is offline at the moment of submission, the remote copy is not retried later.

`/admin` exports CSV and JSON for results stored in **the browser you are using**. It does not show other candidates’ phones. The candidate screen has no link to that page.

## What this architecture cannot guarantee

- One person, one attempt, across every phone they can borrow.
- That site data will survive if the candidate deletes it.
- That the answer key stays secret from someone reading the app’s files.
- That every operating-system event is labelled correctly.
- That a result reached a spreadsheet if the network failed at submit time.

Use it as a strict browser session for a supervised hall, not as a remotely proctored high-stakes exam.
