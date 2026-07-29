# SignLearn API Versioning Strategy

## Versioning Policy
- All public REST endpoints live under the `/api/v1` namespace.
- Future breaking API iterations will be introduced under `/api/v2` without modifying existing v1 route contracts.

## Standard JSON Response Payload
Every SignLearn API endpoint returns a standardized JSON structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-07-29T18:00:00Z"
}
```

## Standard Error Response Payload
```json
{
  "success": false,
  "statusCode": 404,
  "errorType": "NOT_FOUND",
  "message": "User with identifier '123' was not found.",
  "path": "/api/v1/users/123",
  "timestamp": "2026-07-29T18:00:00Z"
}
```
