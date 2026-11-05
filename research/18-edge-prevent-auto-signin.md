# Preventing Microsoft Edge from Auto-Signing In with the Windows Account

Research date: 2026. Target: Microsoft Edge Stable 155 on Windows, launching with a fresh `--user-data-dir` profile. Windows account in scope: `<Lars's work account>` (MSA/Azure AD).

## TL;DR

- `--disable-sync` and `--disable-features=msBrowserSignin` do **not** fully prevent auto-sign-in. `msBrowserSignin` is **not** a real Chromium/Edge feature flag — the real policy is `BrowserSignin` and the real feature flags are `msImplicitSignin`, `msProfileSignIn`, `msEdgeOSAccountInfoSubstrate`, etc.
- ~~The authoritative, fully-effective mechanism is a set of **Edge policies** applied via the Windows Registry (HKCU or HKLM) under `SOFTWARE\Policies\Microsoft\Edge`. These take effect on the next browser start.~~ **Superseded in this program (measured 2026-10-19):** HKCU Edge policies are deliberately _not_ used — the `control-ai-browsers` skill relies on the `ms*` switches alone (`.commandcode/skills/control-ai-browsers/SKILL.md:311-312`). The registry route documented below is what Microsoft documents, not what this repository's instances apply.
- For a single ad-hoc launch with no persistence/account, use **`--guest`** or **`--bwsi`** (browse-without-sign-in) mode — these never touch the OS account.
- For a fresh `--user-data-dir` profile that must still be a normal profile, combine the registry policies with the `ms*` feature flags below.

## 1. The correct feature flags (not `msBrowserSignin`)

Edge/Chromium feature flags that actually gate OS-account / implicit sign-in (source: WebView2 issue #5722, which enumerated and tested them):

```
msImplicitSignin
msImplicitSignInNetworkRetry
msProfileSignIn
msOneAuthWAM
msLoadOneAuthInBackground
msSeamlessWebToBrowserSignIn
msShowSignInIndicator
msWAMSovereigntySignIn
msWAMAdminModeSignIn
msAllowMSAPrtSSOForNonMSAProfile
msAutoToggleMSAPrtSSOForNonMSAProfile
msAutoToggleAADPrtSSOForNonAADProfile
msShowUXForAADPrtSSOForNonAADProfile
msEdgeOSAccountInfoSubstrate
msPrimaryOSAccountInfoCache
msEdgeOSAccountInfoManagerCache
msEdgeReauthAutoRefreshToken
msEdgePasskeysServiceReauth
msQuickAuthToBrowserSignIn
msForceBrowserSignIn
msEnableWebToBrowserSignIn
msEnableAADWebToBrowserSignIn
msEnableProfileAADAccountSSO
msMSNSignInLink
msSendSSODiagnostics
msEdgeSignInAccountPicker
AADSSO
AADWebSSOAllowed
```

Also relevant for the Edge-153+ blank-password `LogonUser` 4625 regression: `AutofillAiWalletPrivatePasses` (workaround reported in the same issue).

Caveat: the WebView2 reporter found that disabling **all** of the above still did not stop the startup `LogonUser` attempt in WebView2. For the **browser** (msedge.exe) profile-creation path, the subset `msImplicitSignin,msProfileSignIn,msEdgeOSAccountInfoSubstrate,msPrimaryOSAccountInfoCache,msEdgeOSAccountInfoManagerCache` is what gates implicit profile sign-in; pair it with the registry policies for full effect.

## 2. Edge policies (authoritative)

Set these under `HKCU\Software\Policies\Microsoft\Edge` (current user, no admin) or `HKLM\Software\Policies\Microsoft\Edge` (machine-wide):

| Value name                          | Type      | Value | Effect                                                                                                              |
| ----------------------------------- | --------- | ----- | ------------------------------------------------------------------------------------------------------------------- |
| `BrowserSignin`                     | REG_DWORD | `0`   | Disable browser sign-in entirely                                                                                    |
| `ImplicitSignInEnabled`             | REG_DWORD | `0`   | Disable implicit (OS-account) sign-in                                                                               |
| `WebToBrowserSignInEnabled`         | REG_DWORD | `0`   | Disable web-to-browser sign-in CTA/seamless sign-in                                                                 |
| `SeamlessWebToBrowserSignInEnabled` | REG_DWORD | `0`   | Disable seamless web-to-browser sign-in                                                                             |
| `NonRemovableProfileEnabled`        | REG_DWORD | `0`   | Prevent non-removable (auto-created OS) profiles                                                                    |
| `SyncDisabled`                      | REG_DWORD | `1`   | Disable sync                                                                                                        |
| `HideFirstRunExperience`            | REG_DWORD | `1`   | Skip first-run experience (note: by design Edge still auto-signs in on first run unless the policies above are set) |

Source: Microsoft Learn policy docs (`BrowserSignin`, `ImplicitSignInEnabled`, `NonRemovableProfileEnabled`, `WebToBrowserSignInEnabled`, `SeamlessWebToBrowserSignInEnabled`) + the widely-used `Disable-EdgeAnnoyances.reg` gist by asheroto.

Policy docs also note: `NonRemovableProfileEnabled` only takes effect when `ImplicitSignInEnabled` is enabled; setting `ImplicitSignInEnabled=0` already disables the non-removable auto-profile. `BrowserSignin=0` makes `ConfigureOnPremisesAccountAutoSignIn` a no-op.

## 3. Registry application (PowerShell, current user, no elevation)

```powershell
$edgePolicy = "HKCU:\Software\Policies\Microsoft\Edge"
if (-not (Test-Path $edgePolicy)) { New-Item -Path $edgePolicy -Force | Out-Null }
$vals = @{
  "BrowserSignin" = 0
  "ImplicitSignInEnabled" = 0
  "WebToBrowserSignInEnabled" = 0
  "SeamlessWebToBrowserSignInEnabled" = 0
  "NonRemovableProfileEnabled" = 0
  "SyncDisabled" = 1
  "HideFirstRunExperience" = 1
}
foreach ($k in $vals.Keys) {
  New-ItemProperty -Path $edgePolicy -Name $k -Value $vals[$k] -PropertyType DWord -Force | Out-Null
}
```

Machine-wide (elevated) variant: replace `HKCU:` with `HKLM:` and run as Administrator.

## 4. Exact command-line invocation (fresh profile, no account)

```cmd
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --user-data-dir="C:\Temp\edge-fresh-profile" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-sync ^
  --disable-features=msImplicitSignin,msProfileSignIn,msEdgeOSAccountInfoSubstrate,msPrimaryOSAccountInfoCache,msEdgeOSAccountInfoManagerCache,msOneAuthWAM,msLoadOneAuthInBackground,msSeamlessWebToBrowserSignIn,msShowSignInIndicator,msForceBrowserSignIn,msEnableWebToBrowserSignIn,msEnableAADWebToBrowserSignIn,msEnableProfileAADAccountSSO,msEdgeSignInAccountPicker,msQuickAuthToBrowserSignIn,AutofillAiWalletPrivatePasses
```

Notes:

- `--disable-sync` is redundant with `SyncDisabled=1` policy but harmless.
- `--no-first-run` + `--no-default-browser-check` suppress first-run UI; they do NOT by themselves stop auto-sign-in (per Microsoft docs, auto-sign-in still happens on first run for MSA/AAD Windows accounts).
- The `ms*` flags are best-effort; the registry policies in section 3 are what actually prevent the profile from being created signed-in. Apply both.

## 5. True no-account modes (no profile / no OS account at all)

- **Guest mode** (ephemeral, no account, no extensions by default):
  ```cmd
  msedge.exe --guest --user-data-dir="C:\Temp\edge-guest"
  ```
- **Browse-without-sign-in (bwsi)** guest session (Chromium switch; disables extensions, sync, bookmarks):
  ```cmd
  msedge.exe --bwsi --user-data-dir="C:\Temp\edge-bwsi"
  ```
  Also commonly combined: `msedge.exe --inprivate --bwsi`.

These are the only options that guarantee zero interaction with the Windows account, because no real profile is ever created. Trade-off: no persistent profile, no extensions (bwsi), limited automation hooks.

## 6. What does NOT work (verified)

- `--disable-features=msBrowserSignin` — `msBrowserSignin` is not a real feature flag; the policy is `BrowserSignin` (registry), not a `--disable-features` name.
- `--disable-sync` alone — only disables sync, not implicit profile creation.
- Setting `HideFirstRunExperience=1` alone — Microsoft docs explicitly state the user is still automatically signed in if the Windows account is MSA/AAD.
- Disabling `msOneAuthWAM` (`--disable-features=msOneAuthWAM`) — this forces the legacy direct-WAM path, which _also_ auto-signs in; deprecated/removed in Edge 157. Do not use as a workaround.
- Edge policies set only under `Software\Policies\Microsoft\Edge\WebView2` — these apply to WebView2 hosts, not to `msedge.exe`.

## 7. Edge 155 specifics

- Edge 155 (Stable) introduced `--enable-features=msForceOneAuthWAM` for piloting OneAuth. This is for _testing_ the new auth library, not for disabling sign-in.
- Edge 157 retires the legacy direct-WAM path (MC1490911); organizations that relied on `--disable-features=msOneAuthWAM` must migrate. No new sign-in policies ship in 157.
- Check the effective auth library per profile at `edge://signin-internals` → "Edge Auth Library Information" → "Library" (`OneAuth` vs `WAM`).

## 8. Evidence / sources

- Microsoft Learn — `BrowserSignin` policy: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/browsersignin
- Microsoft Learn — `ImplicitSignInEnabled`: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/implicitsigninenabled
- Microsoft Learn — `NonRemovableProfileEnabled`: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/nonremovableprofileenabled
- Microsoft Learn — `WebToBrowserSignInEnabled`: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/webtobrowsersigninenabled
- Microsoft Learn Q&A — "How to disable Microsoft Edge automatic sign-in on first run?" (confirms auto-sign-in is by design for MSA/AAD accounts): https://learn.microsoft.com/en-us/answers/questions/381215/how-to-disable-microsoft-edge-automatic-sign-in-on
- asheroto gist "Disable-EdgeAnnoyances.reg" (registry key set): https://gist.github.com/asheroto/e18500e7d206f3ae99f9bd0da0cf6bc6
- MicrosoftEdge/WebView2Feedback #5722 — comprehensive feature-flag enumeration + policy test results: https://github.com/MicrosoftEdge/WebView2Feedback/issues/5722
- windowsforum.com — Edge 157 retires legacy WAM sign-in (MC1490911): https://windowsforum.com/news/edge-157-retires-direct-wam-sign-in-how-to-test-oneauth-before-the-november-rollout.447616/
- Chromium command-line switch `--bwsi` ("browse without sign-in" / Guest session mode): https://peter.sh/experiments/chromium-command-line-switches/
- NinjaOne — Enable/Disable Automatic Sign-in on Microsoft Edge: https://www.ninjaone.com/blog/enable-or-disable-microsoft-edge-auto-sign-in/
- admx.newyard.nl — `ConfigureOnPremisesAccountAutoSignIn` policy details: https://admx.newyard.nl/gpo/configure-automatic-sign-in-with-an-active-directory-domain-account-when-there-is-no-azure-ad-domain-account/
- TheHalfMoon/Orcel PR #325 — confinement argv with `msImplicitSignin,msEdgeOSAccountInfoSubstrate,msEdgeOnlineAccounts,msOneAuthWAM,msLoadOneAuthInBackground,msIdentityCore`: https://github.com/TheHalfMoon/Orcel/pull/325

## 9. Recommended minimal recipe for the devtools/automation use case

1. Run the PowerShell in section 3 once (sets HKCU policies).
2. Launch with section 4 command line.
3. Verify at `edge://policy` that `BrowserSignin`, `ImplicitSignInEnabled`, `SyncDisabled` show as applied.
4. Verify at `edge://signin-internals` that no profile is signed into `<Lars's work account>`.
5. If any residual account appears, fall back to `--guest` (section 5) for that run.
