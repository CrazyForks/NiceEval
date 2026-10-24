---
format: concord.document/v1
id: query-request-json-and-member-shape
title: Query lacks argv requests and a shared planned member result
createdAt: 2026-10-24
kind: memory
memoryKind: problem
state: open
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history: []
---
## Problem

Issues #289 and #290: callers without stdin cannot send a full Query request in argv. Run and Experiment members expose the same Attempt metrics at different paths, and Run duplicates the Attempt locator.

## Contract

Follow [Inspection CLI](../docs/feature/inspection/cli.md): exactly one of `--request` and `--request-json`, strict `niceeval.query/v3`, and shared PlannedAttemptMember result fields beside a binding-only publication.

## Cause

Query only reads a request file/stdin. Overview embeds metrics inside publication while run.get builds a separate member result.

## Implementation and verification

The CLI shares JSON decoding and the request-size limit across both transports. Run and Overview now use one metric projection and the same member schema; show and View read the sibling metrics and the publication locator. The shared verdict projection preserves the existing fallback for failed Assertions reads.

The installed pre-change candidate reproduced both missing argv support and the inconsistent metric path. Targeted installed-candidate checks cover Query, show, the public package entry and downstream member consumers. Formal case evidence and complete takeover remain the integrating parent agent's responsibility; this Problem stays open until those receipts are bound and validated.
