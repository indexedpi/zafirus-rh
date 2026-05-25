# Case Lifecycle Specification

## Purpose

Define Angular mock parity for onboarding case lifecycle behavior.

## Requirements

### Requirement: React-Equivalent Case Lifecycle

Angular MUST match React case creation, edits, status transitions, contextual actions, auto-run banner behavior, and persistence semantics inside `/demo`. Live NestJS/API storage remains deferred.

#### Scenario: Visual and usage parity

- GIVEN `/demo` displays the RRHH case workspace
- WHEN the user views, creates, edits, or selects a case
- THEN Angular MUST present the same fields, labels, actions, and state feedback as React

#### Scenario: Status transition parity

- GIVEN a case is in any React-supported status
- WHEN a contextual action advances, pauses, retries, or completes the case
- THEN Angular MUST produce the same next status and visible affordances
- AND invalid transitions MUST be blocked or hidden as in React

#### Scenario: Auto-run banner parity

- GIVEN React would show or hide the auto-run banner
- WHEN Angular evaluates the same case state
- THEN the banner visibility, copy intent, and available actions MUST match React behavior

#### Scenario: Deferred persistence boundary

- GIVEN case data changes in `/demo`
- WHEN persistence is required
- THEN Angular MAY use mock/session/demo persistence only
- AND MUST NOT depend on live API/workspace writes
