# Google Workspace Integration Plan

## 1. Scope
- Create corporate users in Google Workspace automatically.
- Assign users to specific Google Groups based on their team/role.
- Configure Gmail signatures centrally.
- Dispatch the official Zafirus welcome email.
- Record comprehensive audit logs for all external mutations.
- Support a Dry-Run mode for testing configurations.

## 2. Proposed Backend Boundary
- **Security:** The frontend React application must never hold Google Service Account credentials, tokens, or private keys.
- **Orchestrator:** The React frontend triggers a state machine hook on the NestJS backend via authenticated API calls.
- **Implementation:** The backend utilizes the `@googleapis/admin` (Admin SDK) and Gmail APIs under a Service Account with Domain-Wide Delegation.
- **Traceability:** Every call to Google APIs is wrapped in an audit interceptor to capture success, failure, and payload summaries.

## 3. Required Future API Operations
- **Create User:** `admin.directory.users.insert`
- **Add to Groups:** `admin.directory.members.insert`
- **Configure Signature:** Backend-to-backend Gmail adapter or delegation.
- **Send Welcome Email:** `gmail.users.messages.send` or an external SMTP service authenticated internally.
- **Notify Administration:** Webhook / Slack integration / Ticketing integration.

## 4. Safety & Idempotency
- **Dry-Run First:** Operators can test payload generation before committing mutations.
- **Confirmation Guards:** Destructive or highly visible external actions (like dispatching emails) require an explicit user confirmation step.
- **Retries:** The backend worker queue (e.g., BullMQ) must support idempotent retries for network instability.
- **Secret Redaction:** Passwords and sensitive PII are stripped from output logs and audit traces.

## 5. Testing
- **Unit Tests:** Isolate the Google API adapter logic using mocked SDK responses.
- **Integration Tests:** Execute staging routines against a dedicated Sandbox/Test Google Workspace domain.
- **Failure Modes:** Explicitly test the queue behavior under rate-limiting (429s) and invalid inputs.
- **Audit Assertions:** Verify that failure contexts log appropriately without leaking secrets.

## 6. Non-goals for the Frontend Phase
- No real Google API requests from the browser.
- No frontend authentication workflows (OAuth/OIDC) implemented.
- No direct exposure of Service Account configuration strings.
- No actual email dispatching via SMTP or Gmail API directly.
