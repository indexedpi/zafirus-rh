# Task Management Specification

## Purpose

Define Angular parity for tasks, progress ring, retry, and skip behavior.

## Requirements

### Requirement: React-Equivalent Task Controls

Angular MUST match React task state, task ring visualization, retry/skip actions, status effects, and audit/case interactions inside `/demo`. Live automation/workspace execution remains deferred.

#### Scenario: Task ring visual parity

- GIVEN a case has tasks in mixed states
- WHEN Angular renders the tasks ring and list
- THEN progress, counts, colors, labels, and empty states MUST match React reference behavior

#### Scenario: Retry and skip parity

- GIVEN a task is retryable, skippable, completed, or blocked
- WHEN the user triggers task actions
- THEN Angular MUST allow, block, or update the task exactly as React does
- AND update related case/audit state consistently

#### Scenario: Logic parity across `/demo`

- GIVEN task state changes from case lifecycle or candidate/email flows
- WHEN the user navigates within `/demo`
- THEN Angular MUST preserve and display React-equivalent task state

#### Scenario: Deferred automation boundary

- GIVEN a task would trigger real automation, workspace work, or API calls
- WHEN retry or skip reaches that boundary
- THEN Angular MUST use explicit mock behavior
- AND MUST NOT execute live automation or API integration
