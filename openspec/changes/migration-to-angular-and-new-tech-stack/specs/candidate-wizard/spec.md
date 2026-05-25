# Candidate Wizard Specification

## Purpose

Define Angular parity for the candidate onboarding wizard.

## Requirements

### Requirement: Four-Step Candidate Flow

Angular MUST match the React 4-step candidate wizard, submission behavior, token context, DataTab feedback, and validation outcomes inside `/demo`. Real file upload and API submission remain deferred.

#### Scenario: Step-by-step visual parity

- GIVEN a candidate opens the wizard through `/demo`
- WHEN each step is displayed
- THEN Angular MUST match React layout, required fields, progress cues, and navigation affordances

#### Scenario: Validation and navigation parity

- GIVEN required candidate data is missing or invalid
- WHEN the user attempts to continue or submit
- THEN Angular MUST block or allow progression exactly as React does
- AND preserve entered values across steps as React does

#### Scenario: Submission and DataTab feedback

- GIVEN the candidate completes all required steps
- WHEN the wizard is submitted
- THEN Angular MUST update candidate/case feedback visible in DataTab with React-equivalent logic

#### Scenario: Deferred live integration boundary

- GIVEN uploads, real email, or API submission would be needed
- WHEN the wizard reaches those boundaries
- THEN Angular MUST use explicit mock/placeheld behavior
- AND MUST NOT perform live workspace/API integration
