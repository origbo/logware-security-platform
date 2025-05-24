# SOAR Module API Documentation

## API Overview

The SOAR module interacts with a RESTful API that follows standard HTTP methods and status codes. All API endpoints are prefixed with `/api/soar/`.

## Authentication

All API requests require authentication. The API uses JSON Web Tokens (JWT) for authentication, which should be included in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Base URLs

The API base URL is determined by the environment:

| Environment | Base URL                         |
|-------------|----------------------------------|
| Development | `http://localhost:3001/api/soar` |
| Staging     | `https://staging-api.logware.com/api/soar`     |
| Production  | `https://api.logware.com/api/soar`             |

## Response Format

Successful responses follow this format:

```json
{
  "data": {
    // Response data here
  },
  "meta": {
    "totalCount": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

Error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  }
}
```

## API Endpoints

### Playbooks

#### List Playbooks

```
GET /playbooks
```

Query Parameters:
- `status` (optional): Filter by status (draft, active, inactive, archived)
- `triggerType` (optional): Filter by trigger type
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)

Response:
```json
{
  "data": [
    {
      "id": "playbook-123",
      "name": "Phishing Response",
      "description": "Handle phishing attempts",
      "status": "active",
      "triggerType": "alert",
      "createdAt": "2023-01-15T09:30:45Z",
      "updatedAt": "2023-02-10T14:22:33Z",
      "owner": "admin",
      "steps": [...],
      "successCount": 27,
      "failureCount": 3,
      "tags": ["phishing", "email", "response"],
      "category": "incident_response",
      "version": "1.2.0"
    },
    // More playbooks...
  ],
  "meta": {
    "totalCount": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

#### Get Playbook

```
GET /playbooks/:id
```

Response: Single playbook object

#### Create Playbook

```
POST /playbooks
```

Request Body: Playbook object (without id, createdAt, updatedAt fields)

Response: Created playbook object

#### Update Playbook

```
PUT /playbooks/:id
```

Request Body: Partial playbook object with fields to update

Response: Updated playbook object

#### Delete Playbook

```
DELETE /playbooks/:id
```

Response: 204 No Content

#### Execute Playbook

```
POST /playbooks/:id/execute
```

Request Body:
```json
{
  "params": {
    // Playbook execution parameters
  }
}
```

Response: Execution object

### Automation Rules

#### List Rules

```
GET /rules
```

Query Parameters:
- `isEnabled` (optional): Filter by enabled status
- `page` (optional): Page number
- `limit` (optional): Items per page

Response: Array of rule objects with pagination metadata

#### Get Rule

```
GET /rules/:id
```

Response: Single rule object

#### Create Rule

```
POST /rules
```

Request Body: Rule object

Response: Created rule object

#### Update Rule

```
PUT /rules/:id
```

Request Body: Partial rule object

Response: Updated rule object

#### Delete Rule

```
DELETE /rules/:id
```

Response: 204 No Content

#### Toggle Rule Status

```
PATCH /rules/:id/status
```

Request Body:
```json
{
  "isEnabled": true
}
```

Response: Updated rule object

#### Test Rule

```
POST /rules/:id/test
```

Request Body:
```json
{
  "testData": {
    // Test data for rule evaluation
  }
}
```

Response: Test execution result

### Executions

#### List Active Executions

```
GET /executions/active
```

Response: Array of active execution objects

#### Get Execution History

```
GET /executions/history
```

Query Parameters:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by type (playbook, rule)
- `status` (optional): Filter by status
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

Response: Array of execution objects with pagination metadata

#### Get Execution

```
GET /executions/:id
```

Response: Single execution object

#### Abort Execution

```
POST /executions/:id/abort
```

Response: Updated execution object

### Response Actions

#### List Actions

```
GET /actions
```

Query Parameters:
- `category` (optional): Filter by category
- `page` (optional): Page number
- `limit` (optional): Items per page

Response: Array of action objects with pagination metadata

#### Get Action

```
GET /actions/:id
```

Response: Single action object

#### Create Action

```
POST /actions
```

Request Body: Action object

Response: Created action object

#### Update Action

```
PUT /actions/:id
```

Request Body: Partial action object

Response: Updated action object

#### Delete Action

```
DELETE /actions/:id
```

Response: 204 No Content

#### Test Action

```
POST /actions/:id/test
```

Request Body:
```json
{
  "params": {
    // Action parameters for testing
  }
}
```

Response: Test result

### Anomaly Detection

#### List Anomalies

```
GET /anomaly
```

Query Parameters:
- Various filters for anomaly type, severity, etc.

Response: Array of anomaly objects

#### Get User Behavior Anomalies

```
GET /anomaly/user-behavior
```

Response: Array of user behavior anomaly objects

#### Get Network Anomalies

```
GET /anomaly/network
```

Response: Array of network anomaly objects

#### Get System Anomalies

```
GET /anomaly/system
```

Response: Array of system anomaly objects

#### Get Anomaly By ID

```
GET /anomaly/:id
```

Response: Single anomaly object

#### Update Anomaly Status

```
PATCH /anomaly/:id/status
```

Request Body:
```json
{
  "status": "investigating"
}
```

Response: Updated anomaly object

#### Mark as False Positive

```
POST /anomaly/:id/false-positive
```

Request Body:
```json
{
  "reason": "Known behavior pattern for this user"
}
```

Response: Updated anomaly object

#### Assign Anomaly

```
POST /anomaly/:id/assign
```

Request Body:
```json
{
  "userId": "user-456"
}
```

Response: Updated anomaly object

#### Explain Anomaly

```
GET /anomaly/:id/explain
```

Response:
```json
{
  "explanation": "This anomaly was detected due to unusual login patterns...",
  "factors": [
    {
      "factor": "login_time",
      "weight": 0.8,
      "description": "Login occurred outside normal hours"
    },
    // More factors...
  ],
  "similarIncidents": [
    {
      "id": "incident-789",
      "name": "After-hours login attempt",
      "similarity": 0.85
    },
    // More similar incidents...
  ],
  "visualData": {
    // Visualization data
  }
}
```

### Collaboration

#### List Sessions

```
GET /collaboration/sessions
```

Query Parameters:
- `status` (optional): Filter by status
- `type` (optional): Filter by type
- `incidentId` (optional): Filter by related incident

Response: Array of collaboration session objects

#### Get Session

```
GET /collaboration/sessions/:id
```

Response: Single collaboration session object

#### Create Session

```
POST /collaboration/sessions
```

Request Body: Session object

Response: Created session object

#### Update Session

```
PUT /collaboration/sessions/:id
```

Request Body: Partial session object

Response: Updated session object

#### Close Session

```
POST /collaboration/sessions/:id/close
```

Response: Updated session object

#### Join Session

```
POST /collaboration/sessions/:id/join
```

Response: Updated session object with the current user added

#### Leave Session

```
POST /collaboration/sessions/:id/leave
```

Response: Updated session object with the current user removed

## Error Codes

| Code               | HTTP Status | Description                                    |
|--------------------|-------------|------------------------------------------------|
| UNAUTHORIZED       | 401         | Authentication required or token invalid       |
| FORBIDDEN          | 403         | User lacks permission for the requested action |
| NOT_FOUND          | 404         | Resource not found                            |
| VALIDATION_ERROR   | 400         | Invalid request parameters                    |
| CONFLICT           | 409         | Resource conflict (e.g., duplicate name)      |
| INTERNAL_ERROR     | 500         | Server-side error                             |
| SERVICE_UNAVAILABLE| 503         | Service temporarily unavailable               |

## Rate Limiting

API requests are subject to rate limiting. The current limits are:

- 100 requests per minute per user
- 1000 requests per hour per user

When a rate limit is exceeded, the API will respond with a 429 Too Many Requests status code.

## Webhooks

The SOAR API supports webhooks for real-time notifications of events. Webhooks can be configured in the SOAR settings.

Available webhook events:
- `playbook.executed`
- `rule.triggered`
- `anomaly.detected`
- `incident.created`
- `incident.updated`
- `incident.closed`

Webhook payloads follow a consistent format:
```json
{
  "event": "playbook.executed",
  "timestamp": "2023-05-19T14:23:45Z",
  "data": {
    // Event-specific data
  }
}
```

## Pagination

Most list endpoints support pagination using the following query parameters:
- `page`: Page number (1-based)
- `limit`: Number of items per page (default: 20, max: 100)

Response metadata includes:
```json
"meta": {
  "totalCount": 157,
  "page": 2,
  "pageSize": 20,
  "totalPages": 8
}
```

## Filtering

Many endpoints support filtering through query parameters. Available filters are documented with each endpoint.
