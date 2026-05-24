# Zafirus RH — API Contract

## Base URL

```
http://localhost:3000/api
```

## Cases

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/cases`                          | List all onboarding cases            |
| POST   | `/cases`                          | Create a new onboarding case         |
| GET    | `/cases/:id`                      | Get case by ID                       |
| POST   | `/cases/:id/send-form`            | Send candidate form (draft → invited)|
| POST   | `/cases/:id/submit-candidate`     | Submit candidate data                |
| POST   | `/cases/:id/start-review`         | Start HR review                      |
| POST   | `/cases/:id/consolidate`          | Consolidate candidate data           |
| POST   | `/cases/:id/approve`              | Approve case                         |
| POST   | `/cases/:id/activate`             | Activate onboarding (create tasks)   |
| POST   | `/cases/:id/block`                | Block case with reason               |
| POST   | `/cases/:id/unblock`              | Unblock case                         |
| POST   | `/cases/:id/cancel`               | Cancel case                          |

### Create Case — `POST /cases`

```json
{
  "firstName": "María",
  "lastName": "Pérez",
  "personalEmail": "maria@email.com",
  "documentId": "30123456",
  "role": "Product Manager",
  "area": "product",
  "location": "CABA, Argentina",
  "startDate": "2026-06-15",
  "managerName": "Carlos Ruiz"
}
```

### Block Case — `POST /cases/:id/block`

```json
{
  "reason": "Documentación ilegible"
}
```

### Cancel Case — `POST /cases/:id/cancel`

```json
{
  "reason": "Candidato desistió"
}
```

### Submit Candidate — `POST /cases/:id/submit-candidate`

```json
{
  "taxIdType": "CUIT",
  "taxIdValue": "20-34567890-1",
  "paymentMethod": "CBU",
  "bankAccount": "0070234565000000123456",
  "references": [
    {
      "fullName": "Carlos Mendoza",
      "relationship": "Jefe directo",
      "company": "TechCorp",
      "email": "carlos@techcorp.com",
      "phone": "+54 341 555-0101"
    }
  ]
}
```

## Email Templates

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| GET    | `/cases/:id/email-template`               | Get email template for case    |
| PATCH  | `/cases/:id/email-template`               | Update email template          |
| POST   | `/cases/:id/email-template/approve`       | Approve email template         |

### Update Email Template — `PATCH /cases/:id/email-template`

```json
{
  "subject": "¡Bienvenida/o a Zafirus!",
  "bodyHtml": "<h1>Welcome</h1>...",
  "variables": { "firstName": "María" },
  "signature": { "type": "rrhh", "name": "Recursos Humanos" }
}
```

## Candidate Submissions

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| GET    | `/cases/:id/candidate-submission`         | Get latest submission          |
| POST   | `/cases/:id/candidate-submission`         | Create submission (direct)     |

## Tasks

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| GET    | `/cases/:id/tasks`                        | List tasks for case            |

## Audit

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| GET    | `/cases/:id/audit`                        | List audit events for case     |

## Employees

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| GET    | `/employees`                              | List all employees             |
| GET    | `/employees/:id`                          | Get employee by ID             |

## Dev / Seed

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| POST   | `/dev/seed`                               | Seed demo data (dev only)      |

## State Machine

```
draft
  → candidate_invited     (send-form)
  → cancelled             (cancel)

candidate_invited
  → candidate_submitted   (submit-candidate)
  → cancelled             (cancel)

candidate_submitted
  → hr_review             (start-review)

hr_review
  → ready_to_activate     (approve)
  → blocked               (block)
  → cancelled             (cancel)

ready_to_activate
  → activating            (activate)

activating
  → operative             (all tasks complete)

blocked
  → hr_review             (unblock)
  → cancelled             (cancel)

operative
  (terminal state)

cancelled
  (terminal state)
```

## Validation

All endpoints use `class-validator` with:
- `whitelist: true` — strips unknown properties
- `transform: true` — auto-transforms payloads
- `forbidNonWhitelisted: true` — rejects unknown properties

## Notes

- No authentication in this phase
- No real Google API calls
- Activation creates mock task rows only
- Sensitive values are redacted in audit logs
- `synchronize` is `false` by default — use migrations for production
