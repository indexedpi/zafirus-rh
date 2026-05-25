# Audit Log Specification

## Purpose

Define Angular parity for audit timeline and global audit drawer behavior.

## Requirements

### Requirement: Demo Audit Timeline

Angular MUST match React audit log behavior: timeline entries, filters, redaction, global drawer access, and case/task event recording inside `/demo`. Live audit storage remains deferred.

#### Scenario: Timeline visual parity

- GIVEN audit events exist in demo state
- WHEN the audit timeline or drawer opens
- THEN Angular MUST match React ordering, grouping, labels, and empty-state behavior

#### Scenario: Filter parity

- GIVEN the user applies audit filters
- WHEN matching and non-matching events exist
- THEN Angular MUST display the same filtered results and reset behavior as React

#### Scenario: Redaction and event logic parity

- GIVEN audit entries contain sensitive or candidate-specific values
- WHEN Angular renders the log
- THEN redaction and event details MUST match React visibility rules
- AND case/task actions MUST create equivalent mock audit events

#### Scenario: Deferred audit backend boundary

- GIVEN durable audit storage would be required
- WHEN audit events are created in `/demo`
- THEN Angular MUST keep events in mock/session/demo persistence only
- AND MUST NOT call live audit APIs
