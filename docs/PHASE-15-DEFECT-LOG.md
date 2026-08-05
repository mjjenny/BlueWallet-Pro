# Phase 15 - Defect Log

Use this log for every failure found during manual QA. Do not close a release-blocking defect without a retest note and evidence reference.

## Status Values

- `Open`
- `Fixed`
- `Retest Required`
- `Closed`
- `Waived`

## Severity Values

- `S1`: Data loss, security failure, unsafe restore, broken root launch, or unusable offline app.
- `S2`: Major feature failure with workaround, such as OCR unavailable with manual fallback working.
- `S3`: Minor usability, layout, wording, or device-specific issue that does not block core flows.

## Defects

| Defect ID | Date | Tester | Device / Browser | Related Gate | Severity | Status | Summary | Evidence Reference | Fix Commit / Waiver | Retest Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-15-001 |  |  |  |  |  | Open |  |  |  |  |

## Release Blocking Rules

- Any open `S1` defect blocks `v1.0.0`.
- Any open `S2` defect blocks `v1.0.0` unless product owner and engineering both approve a written waiver.
- `S3` defects may be deferred only when the release impact is recorded.
- A waived defect must include approver, date, reason, and release impact in the tracker or this log.

## Current Defect Status

No Phase 15 defects have been recorded yet because manual QA evidence has not been supplied.
