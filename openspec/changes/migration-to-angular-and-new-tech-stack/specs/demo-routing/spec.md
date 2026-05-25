# Demo Routing Specification

## Purpose

Define Angular `/demo` routing parity with the React prototype shell.

## Requirements

### Requirement: Routed Demo Shell

Angular MUST expose `/demo` as the canonical demo entry and SHALL preserve React hash-mode shell behavior, split-screen layout, token gating, and demo persistence boundaries. Live workspace, auth, and API-backed routing MUST remain placeholders in this slice.

#### Scenario: `/demo` loads React-equivalent shell

- GIVEN the user opens `/demo`
- WHEN Angular renders the route
- THEN the visible shell matches the React demo reference visually and structurally
- AND no root-only onboarding shell bypasses routing

#### Scenario: Hash state parity

- GIVEN a React-supported demo hash is present
- WHEN Angular initializes `/demo`
- THEN Angular MUST select the same split-screen, candidate, or demo mode view
- AND unsupported hashes fall back safely to the default demo view

#### Scenario: Token gating parity

- GIVEN a candidate token is present or absent
- WHEN the demo shell evaluates access
- THEN Angular MUST match React gating, persistence, and recovery behavior

#### Scenario: Deferred integration boundary

- GIVEN workspace, auth, or live API data is requested
- WHEN `/demo` needs those capabilities
- THEN the system MUST show isolated placeholder behavior
- AND MUST NOT perform live workspace/API integration
