# Phase 17 - macOS Waiver Proposal

## Status

Waiver status: proposed, not approved.

The release remains blocked unless this waiver is formally approved by the product owner or macOS Safari and macOS Chrome evidence is supplied.

## Proposed Waived Rows

| QA ID | Platform | Browser | Proposed Status | Approval Status | Notes |
| --- | --- | --- | --- | --- | --- |
| QA-MAC-SAFARI | macOS | Safari | Waiver Proposed | Not Approved | Do not mark `Pass`. Do not mark `Waived` without product-owner approval. |
| QA-MAC-CHROME | macOS | Chrome | Waiver Proposed | Not Approved | Do not mark `Pass`. Do not mark `Waived` without product-owner approval. |

## Waiver Details

Reason:

- Device unavailable for pre-release validation.

Risk:

- Unverified macOS install/offline/storage behavior.

Mitigation:

- Windows Chrome/Edge, iPadOS Safari, iOS Safari, and Android Chrome are planned for coverage.
- macOS smoke test is required after access is available.

Release impact:

- Acceptable only if product owner approves.

## Approval Requirements

Before these rows can be marked `Waived`, record:

- Product-owner approver name.
- Approval date.
- Explicit acceptance of unverified macOS install/offline/storage behavior.
- Post-access macOS smoke-test owner and target date.
- Release notes entry or known-risk note if release proceeds before macOS validation.

## Current Decision

Current decision: release blocked.

The macOS waiver is a proposal only. It is not an approved waiver and does not unblock `v1.0.0`.
