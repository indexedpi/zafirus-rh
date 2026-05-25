# Email Editor Specification

## Purpose

Define Angular parity for editable email preparation and approval.

## Requirements

### Requirement: Editable Email Workflow

Angular MUST match React email editor behavior: editable body, variable pills, preview, approval workflow, and case-state effects inside `/demo`. Real email delivery remains deferred.

#### Scenario: Editor visual and usage parity

- GIVEN an RRHH user opens the email editor in `/demo`
- WHEN editable content, variables, and preview are shown
- THEN Angular MUST match React layout, controls, disabled states, and text substitution behavior

#### Scenario: Variable pill parity

- GIVEN a variable pill is selected or inserted
- WHEN the email body or preview updates
- THEN Angular MUST resolve and display variables with React-equivalent usage rules
- AND preserve unresolved or missing data behavior

#### Scenario: Approval workflow parity

- GIVEN an email is draft, previewed, approved, or rejected
- WHEN the user performs approval actions
- THEN Angular MUST update visible state and related case/task logic as React does

#### Scenario: Deferred delivery boundary

- GIVEN an approved email would be sent externally
- WHEN the action reaches delivery
- THEN Angular MUST represent mock completion only
- AND MUST NOT send live email or call live APIs
