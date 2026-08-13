# FlagForge — Feature Flag Platform

## Local Development

FlagForge uses a pnpm workspace with two applications:

```text
frontend/
backend/
```

Required local tools:

```text
Node.js 26.7.0
pnpm 11.21.0
Docker
```

Quick start:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
pnpm install
docker compose up -d postgres
pnpm seed
pnpm dev
```

Local URLs:

```text
Frontend: http://localhost:5174
Backend:  http://localhost:3001/api/v1
Health:   http://localhost:3001/api/v1/health
```

Local demo credentials after running `pnpm seed`:

```text
Email:    user@example.com
Password: password123
```

Current management API endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET   /api/v1/organizations/current
PATCH /api/v1/organizations/current

GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:projectId
PATCH  /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId

GET   /api/v1/projects/:projectId/environments
PATCH /api/v1/projects/:projectId/environments/:environmentId
```

Authentication uses a short-lived access token returned in JSON and a rotating refresh token stored as an httpOnly cookie. The refresh token is stored only as a hash in PostgreSQL and is not exposed to frontend JavaScript.

The demo seed creates the `Demo Labs` organization, `Checkout Platform` project, and Development, Staging, and Production environments for local dashboard testing.

## Project Progress

FlagForge is managed through OpenSpec changes. The high-level roadmap is tracked in [docs/ROADMAP.md](docs/ROADMAP.md).

Current workflow:

```text
plan change -> implement tasks -> verify -> archive -> start next change
```

## 1. Project Overview

**FlagForge** is a self-hosted feature flag management platform inspired by tools such as LaunchDarkly, Unleash, and Flagsmith.

The platform allows engineering teams to safely enable, disable, and gradually roll out application functionality without deploying new code.

Developers can create feature flags from a React administration dashboard and evaluate those flags from applications using a lightweight SDK or REST API.

Example:

```javascript
const enabled = await flagForge.isEnabled(
  "new-checkout",
  {
    userId: "123",
    country: "IT",
    plan: "premium"
  }
);

if (enabled) {
  showNewCheckout();
} else {
  showOldCheckout();
}
```

Administrators should be able to configure the same flag from the dashboard:

```text
new-checkout

Development     ON
Staging         ON
Production      20%
```

The project should demonstrate:

* React
* NestJS
* PostgreSQL
* Redis
* REST APIs
* authentication
* authorization
* caching
* WebSockets
* feature flag evaluation
* percentage rollouts
* user targeting
* API/SDK design
* audit logging
* Docker
* automated testing
* CI/CD
* production-oriented architecture

---

# 2. Main Objectives

The platform should allow teams to:

1. Create projects.
2. Create multiple environments.
3. Create feature flags.
4. Enable or disable flags independently per environment.
5. Gradually roll out functionality.
6. Target specific users.
7. Target users by attributes.
8. Manage reusable user segments.
9. Evaluate flags through an API.
10. Evaluate flags through a JavaScript SDK.
11. Push flag changes to connected applications.
12. maintain an audit history.
13. Protect management APIs using authentication and RBAC.
14. provide separate SDK keys for applications.
15. cache flag configuration using Redis.
16. provide usage statistics.

---

# 3. Example Use Case

A company wants to introduce a redesigned checkout page.

Instead of immediately enabling it for everyone, they create:

```text
Flag Key:
new-checkout

Development:
100%

Staging:
100%

Production:
5%
```

After monitoring production:

```text
5%
 ↓
10%
 ↓
25%
 ↓
50%
 ↓
100%
```

If an issue appears, the administrator changes:

```text
Production

ON → OFF
```

All applications using FlagForge immediately stop displaying the new checkout functionality.

No deployment is required.

---

# 4. Technology Stack

## Frontend

```text
React
Vite
React Router
TanStack Query
Axios
Tailwind CSS
Recharts
Socket.IO Client
```

Optional:

```text
React Hook Form
Zod
```

---

## Backend

```text
NestJS
TypeScript
REST API
Socket.IO / WebSockets
Swagger / OpenAPI
```

Database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

or:

```text
TypeORM
```

Prisma would be my preferred choice for this project because the schema will contain many relationships and migrations.

---

## Infrastructure

```text
PostgreSQL
Redis
Docker
Docker Compose
GitHub Actions
```

Optional production deployment:

```text
AWS
Kubernetes
Helm
```

---

# 5. High-Level Architecture

```text
                          ┌────────────────────┐
                          │   React Dashboard  │
                          └─────────┬──────────┘
                                    │
                                    │ HTTPS
                                    ▼
                          ┌────────────────────┐
                          │      NestJS API    │
                          │                    │
                          │ Auth               │
                          │ Projects           │
                          │ Environments       │
                          │ Feature Flags      │
                          │ Segments           │
                          │ Evaluation         │
                          │ Audit Logs         │
                          └───────┬─────┬──────┘
                                  │     │
                           ┌──────┘     └───────┐
                           ▼                    ▼
                  ┌────────────────┐    ┌───────────────┐
                  │   PostgreSQL   │    │     Redis     │
                  │                │    │               │
                  │ Persistent     │    │ Flag Cache    │
                  │ Configuration  │    │ Pub/Sub       │
                  └────────────────┘    └───────┬───────┘
                                               │
                                               ▼
                                      ┌────────────────┐
                                      │ WebSocket      │
                                      │ Notifications  │
                                      └───────┬────────┘
                                              │
                  ┌───────────────────────────┼─────────────────────────┐
                  ▼                           ▼                         ▼
           ┌────────────┐              ┌────────────┐           ┌────────────┐
           │ Application│              │ Application│           │ Application│
           │     A      │              │     B      │           │     C      │
           └────────────┘              └────────────┘           └────────────┘
```

---

# 6. Domain Structure

The hierarchy should be:

```text
Organization
    │
    └── Project
          │
          ├── Development
          ├── Staging
          └── Production
                │
                └── Feature Flags
```

Example:

```text
Organization
Argos

Project
Basket

Environments
development
staging
production

Feature Flags
new-basket-ui
enable-recommendations
new-checkout
```

---

# 7. Organizations

An organization represents a company or team using FlagForge.

Example:

```text
Organization:
Acme Corporation
```

An organization can contain:

```text
users
projects
API keys
audit logs
```

---

# 8. Users

User fields:

```text
id
email
passwordHash
firstName
lastName
organizationId
role
createdAt
updatedAt
```

Example roles:

```text
OWNER
ADMIN
DEVELOPER
VIEWER
```

---

# 9. Role-Based Access Control

## OWNER

Can:

```text
manage organization
manage users
manage projects
create/delete flags
change flags
manage API keys
view audit logs
```

---

## ADMIN

Can:

```text
manage projects
manage environments
create flags
modify flags
manage segments
view audit logs
```

---

## DEVELOPER

Can:

```text
view projects
create flags
modify flags
view environments
```

Optional restriction:

```text
DEVELOPER cannot modify production flags
```

---

## VIEWER

Can only:

```text
view configuration
view flags
view audit logs
```

---

# 10. Projects

A project represents an application or business domain.

Example:

```text
Basket Service
Wishlist
Checkout
Customer Portal
```

Project fields:

```text
id
organizationId
name
key
description
createdAt
updatedAt
```

Example:

```json
{
  "name": "Basket",
  "key": "basket"
}
```

---

# 11. Environments

Each project contains environments.

Default environments:

```text
development
staging
production
```

Environment fields:

```text
id
projectId
name
key
color
createdAt
updatedAt
```

Example:

```json
{
  "name": "Production",
  "key": "production"
}
```

Users should also be able to create custom environments:

```text
qa
integration
uat
demo
```

---

# 12. Feature Flags

The primary domain object.

A feature flag contains:

```text
id
projectId
name
key
description
type
createdBy
createdAt
updatedAt
archivedAt
```

Example:

```json
{
  "name": "New Checkout",
  "key": "new-checkout",
  "description": "Controls rollout of redesigned checkout",
  "type": "BOOLEAN"
}
```

Flag keys must be unique within a project.

Allowed example keys:

```text
new-checkout
recommendations-v2
enable-dark-mode
payment-service-v2
```

---

# 13. Flag Types

## MVP

Support:

```text
BOOLEAN
```

Example:

```text
true
false
```

---

## Future Version

Add multivariate flags:

```text
STRING
NUMBER
JSON
```

Example:

```text
checkout-layout

control
variant-a
variant-b
```

Could be returned as:

```json
{
  "value": "variant-a"
}
```

---

# 14. Environment Flag Configuration

A feature flag has separate configuration for every environment.

Example:

```text
new-checkout

Development
ON

Staging
ON

Production
OFF
```

Database entity:

```text
FeatureFlagEnvironment
```

Fields:

```text
id
featureFlagId
environmentId
enabled
defaultValue
rolloutPercentage
version
updatedAt
```

Example:

```json
{
  "enabled": true,
  "rolloutPercentage": 25
}
```

---

# 15. Kill Switch

Every environment configuration has a master:

```text
ON / OFF
```

If disabled:

```text
enabled = false
```

evaluation should immediately return:

```json
{
  "value": false,
  "reason": "FLAG_DISABLED"
}
```

This rule must override all targeting rules and rollouts.

---

# 16. Percentage Rollout

Users should be able to expose functionality to a percentage of users.

Example:

```text
New Checkout

Production rollout:

25%
```

Expected behavior:

```text
approximately 25% users → true
approximately 75% users → false
```

However, rollout selection must be **deterministic**.

The same user must always receive the same result.

Bad implementation:

```javascript
Math.random() < 0.25
```

That would make the feature randomly turn on and off between requests.

Instead use:

```text
flagKey + userId
      ↓
hash
      ↓
bucket 0-99
```

For example:

```javascript
const value = hash(`${flagKey}:${userId}`);

const bucket = value % 100;

return bucket < rolloutPercentage;
```

If:

```text
bucket = 17
rollout = 25
```

Result:

```text
true
```

If:

```text
bucket = 74
rollout = 25
```

Result:

```text
false
```

---

# 17. Targeting Rules

Administrators should be able to target users based on attributes.

Example:

```text
IF
country equals IT

THEN
true
```

Another:

```text
IF
plan equals PREMIUM

THEN
true
```

Another:

```text
IF
email endsWith "@company.com"

THEN
true
```

---

# 18. Supported Rule Operators

MVP operators:

```text
EQUALS
NOT_EQUALS
CONTAINS
NOT_CONTAINS
STARTS_WITH
ENDS_WITH
IN
NOT_IN
GREATER_THAN
GREATER_THAN_OR_EQUAL
LESS_THAN
LESS_THAN_OR_EQUAL
```

Future:

```text
REGEX
SEMVER_EQUALS
SEMVER_GREATER_THAN
```

---

# 19. Rule Structure

Example:

```json
{
  "attribute": "country",
  "operator": "EQUALS",
  "value": "IT"
}
```

Complex example:

```text
IF

country = IT

AND

plan = premium

THEN

true
```

---

# 20. Multiple Rules

Flags may have ordered targeting rules.

Example:

```text
Rule 1

IF email = test@example.com
THEN true


Rule 2

IF country = IT
THEN true


Rule 3

25% rollout


Default

false
```

Rules must be evaluated from top to bottom.

The first matching rule wins.

---

# 21. Evaluation Algorithm

Recommended evaluation sequence:

```text
Request
   ↓
Validate SDK Key
   ↓
Load Flag
   ↓
Is Flag Enabled?
   │
   ├─ NO → false
   │
   └─ YES
        ↓
Evaluate Explicit User Targeting
        ↓
Evaluate Segment Rules
        ↓
Evaluate Attribute Rules
        ↓
Evaluate Percentage Rollout
        ↓
Return Default Value
```

Example result:

```json
{
  "key": "new-checkout",
  "value": true,
  "reason": "PERCENTAGE_ROLLOUT",
  "variant": null
}
```

---

# 22. Evaluation Context

Applications provide information about the current user.

Example:

```json
{
  "userId": "user-92831",
  "email": "john@example.com",
  "country": "IT",
  "plan": "premium",
  "appVersion": "3.2.1"
}
```

Only:

```text
userId
```

should be predefined.

All other attributes may be dynamic.

For example:

```json
{
  "userId": "123",
  "company": "OpenAI",
  "city": "Rome",
  "subscription": "PRO",
  "age": 29
}
```

The rule engine must be able to evaluate arbitrary attributes.

---

# 23. User Targeting

Allow explicit inclusion/exclusion.

Example:

```text
Include users

user-123
user-456
user-789
```

This allows developers to enable a feature only for:

```text
developers
QA testers
specific customers
beta testers
```

---

# 24. Segments

Segments are reusable groups.

Example:

```text
Segment:
Italian Premium Customers
```

Rules:

```text
country = IT

AND

plan = premium
```

Then feature flags can use:

```text
IF user belongs to
Italian Premium Customers

THEN true
```

Examples:

```text
Internal Employees
Beta Testers
Premium Customers
Italian Users
Mobile Users
```

---

# 25. Segment Model

Fields:

```text
id
projectId
name
key
description
createdAt
updatedAt
```

Segment rules:

```text
segmentId
attribute
operator
value
order
```

---

# 26. SDK Keys

Applications should not authenticate using user JWTs.

Each environment receives an SDK key.

Example:

```text
Development

ff_dev_sk_f83hfs8hf8s


Production

ff_prod_sk_93hfks832k
```

SDK keys identify:

```text
organization
project
environment
```

---

# 27. SDK Key Security

Never store SDK keys directly in plaintext.

Store:

```text
SHA-256(key)
```

Database:

```text
id
environmentId
name
keyHash
keyPrefix
createdAt
lastUsedAt
revokedAt
```

Display:

```text
ff_prod_sk_8f29...
```

After creation the full key should only be shown once.

---

# 28. Management API Authentication

The dashboard uses JWT authentication.

Authentication flow:

```text
POST /auth/login

email
password
```

Returns:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Prefer:

```text
short-lived access token
refresh token rotation
```

---

# 29. REST API

Base URL:

```text
/api/v1
```

---

# 30. Authentication APIs

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

---

# 31. Organization APIs

```text
GET    /organizations/current
PATCH  /organizations/current
```

User management:

```text
GET    /organizations/current/users
POST   /organizations/current/users
PATCH  /organizations/current/users/:id
DELETE /organizations/current/users/:id
```

---

# 32. Project APIs

```text
GET    /projects
POST   /projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId
```

---

# 33. Environment APIs

```text
GET    /projects/:projectId/environments
POST   /projects/:projectId/environments
PATCH  /environments/:environmentId
DELETE /environments/:environmentId
```

---

# 34. Feature Flag APIs

```text
GET    /projects/:projectId/flags
POST   /projects/:projectId/flags

GET    /flags/:flagId
PATCH  /flags/:flagId
DELETE /flags/:flagId
```

Configuration:

```text
GET   /flags/:flagId/environments/:environmentId

PATCH /flags/:flagId/environments/:environmentId
```

Toggle:

```text
POST /flags/:flagId/environments/:environmentId/toggle
```

---

# 35. Rule APIs

```text
GET    /flags/:flagId/rules
POST   /flags/:flagId/rules
PATCH  /rules/:ruleId
DELETE /rules/:ruleId
```

Reorder:

```text
POST /flags/:flagId/rules/reorder
```

Example:

```json
{
  "ruleIds": [
    "rule3",
    "rule1",
    "rule2"
  ]
}
```

---

# 36. Segment APIs

```text
GET    /projects/:projectId/segments
POST   /projects/:projectId/segments
GET    /segments/:segmentId
PATCH  /segments/:segmentId
DELETE /segments/:segmentId
```

---

# 37. SDK Key APIs

```text
GET    /environments/:environmentId/sdk-keys
POST   /environments/:environmentId/sdk-keys
DELETE /sdk-keys/:sdkKeyId
```

---

# 38. Flag Evaluation API

Single flag:

```text
POST /sdk/v1/evaluate/:flagKey
```

Header:

```text
X-API-Key: ff_prod_sk_xxxxx
```

Body:

```json
{
  "userId": "user-123",
  "country": "IT",
  "plan": "premium"
}
```

Response:

```json
{
  "key": "new-checkout",
  "value": true,
  "reason": "RULE_MATCH",
  "version": 17
}
```

---

# 39. Evaluate All Flags

Endpoint:

```text
POST /sdk/v1/evaluate
```

Body:

```json
{
  "userId": "user-123",
  "country": "IT",
  "plan": "premium"
}
```

Response:

```json
{
  "flags": {
    "new-checkout": true,
    "recommendations-v2": false,
    "dark-mode": true
  }
}
```

This is useful when an application loads.

---

# 40. JavaScript SDK

Create a second package:

```text
@flagforge/js-sdk
```

Installation:

```bash
npm install @flagforge/js-sdk
```

Usage:

```javascript
import { FlagForge } from "@flagforge/js-sdk";

const client = new FlagForge({
  apiKey: process.env.FLAGFORGE_API_KEY,
  baseUrl: "http://localhost:3000"
});

const enabled = await client.isEnabled(
  "new-checkout",
  {
    userId: "123",
    country: "IT"
  }
);
```

---

# 41. SDK API

Support:

```javascript
client.isEnabled(flagKey, context)
```

Example:

```javascript
await client.isEnabled("new-checkout", {
  userId: "123"
});
```

Also:

```javascript
client.evaluate(flagKey, context)
```

Returns:

```javascript
{
  value: true,
  reason: "SEGMENT_MATCH"
}
```

---

# 42. Local SDK Cache

The SDK should optionally cache flag definitions locally.

Instead of:

```text
application
    ↓
FlagForge API

for every request
```

use:

```text
application
    ↓
local flag cache
```

FlagForge sends configuration updates when something changes.

This dramatically reduces latency.

---

# 43. Redis Cache

Redis should cache frequently used configurations.

Example key:

```text
flag-config:{environmentId}
```

Value:

```json
{
  "version": 32,
  "flags": [...]
}
```

Evaluation flow:

```text
SDK Request
   ↓
Redis
   │
   ├── HIT → evaluate
   │
   └── MISS
        ↓
    PostgreSQL
        ↓
    Redis
        ↓
    evaluate
```

---

# 44. Cache Invalidation

Whenever a flag changes:

```text
PATCH flag
    ↓
PostgreSQL
    ↓
invalidate Redis
    ↓
rebuild configuration
    ↓
publish update
```

Redis Pub/Sub channel:

```text
flagforge:config-updates
```

Example event:

```json
{
  "projectId": "basket",
  "environmentId": "production",
  "flagKey": "new-checkout",
  "version": 18
}
```

---

# 45. Real-Time Updates

Use WebSockets.

Flow:

```text
Admin enables flag

        ↓

NestJS

        ↓

PostgreSQL

        ↓

Redis Pub/Sub

        ↓

WebSocket Gateway

        ↓

Connected clients
```

Event:

```text
flag.updated
```

Payload:

```json
{
  "flag": "new-checkout",
  "environment": "production",
  "version": 18
}
```

---

# 46. Configuration Versioning

Every environment configuration should contain a version.

Example:

```text
version 51
```

Every modification increments it.

Example:

```text
50

Admin toggles flag

51
```

SDKs can determine whether their configuration is outdated.

---

# 47. Audit Logs

Every important operation should create an audit event.

Examples:

```text
FLAG_CREATED
FLAG_UPDATED
FLAG_ENABLED
FLAG_DISABLED
FLAG_DELETED

SEGMENT_CREATED
SEGMENT_UPDATED

SDK_KEY_CREATED
SDK_KEY_REVOKED

PROJECT_CREATED

USER_ROLE_CHANGED
```

Audit record:

```text
id
organizationId
userId
action
resourceType
resourceId
oldValue
newValue
ipAddress
createdAt
```

---

# 48. Audit Example

Dashboard:

```text
Today

22:43
Abdullah enabled "new-checkout"
Production

21:14
John changed rollout
10% → 25%

Yesterday

18:51
Sarah created "recommendations-v2"
```

---

# 49. Dashboard Pages

Main navigation:

```text
Dashboard
Projects
Segments
Audit Logs
Team
Settings
```

Inside project:

```text
Overview
Feature Flags
Environments
Segments
SDK Keys
Settings
```

---

# 50. Main Dashboard

Display:

```text
Projects                4
Feature Flags          37
Active Flags           22
Production Flags       18
```

Recent activity:

```text
new-checkout enabled
payment-v2 rollout changed
recommendations-v2 created
```

---

# 51. Feature Flags Page

Example:

```text
Feature Flags

Search: ___________________

┌──────────────────────────────┐
│ New Checkout                 │
│ new-checkout                 │
│                              │
│ DEV      STAGING     PROD    │
│ ON       ON          25%     │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Recommendations V2           │
│ recommendations-v2           │
│                              │
│ DEV      STAGING     PROD    │
│ ON       ON          OFF     │
└──────────────────────────────┘
```

Filters:

```text
enabled
disabled
archived
environment
created by
```

---

# 52. Flag Detail Page

Header:

```text
New Checkout

new-checkout

Controls redesigned checkout experience.
```

Environment tabs:

```text
Development | Staging | Production
```

Settings:

```text
Status

[ ON ]


Default

false


Rollout

25%

────────────●────────────


Targeting Rules

1.

IF country equals "IT"

THEN true


2.

IF plan equals "premium"

THEN true


Default

false
```

---

# 53. Flag Creation

Form:

```text
Name *

Flag key *

Description

Flag Type
Boolean
```

Example:

```text
Name:
New Checkout

Key:
new-checkout

Description:
Controls the redesigned checkout experience.
```

Flag key should automatically be generated from the name but remain editable.

---

# 54. Segment UI

Example:

```text
Premium Italian Users

Match ALL conditions

country
equals
IT

AND

subscription
equals
premium
```

Allow:

```text
Match ALL

or

Match ANY
```

---

# 55. Environment Comparison

Nice portfolio feature:

```text
             DEV      STAGING      PROD

new-checkout  ON         ON         25%

payment-v2    ON         OFF        OFF

dark-mode     ON         ON         ON
```

This gives engineers an immediate overview of configuration differences.

---

# 56. Confirmation for Production Changes

Production changes should require confirmation.

Example:

```text
You are modifying:

new-checkout

Environment:

PRODUCTION

Current rollout:
10%

New rollout:
50%

Confirm Change
```

Optional advanced functionality:

Require entering:

```text
new-checkout
```

before disabling a critical production flag.

---

# 57. Protected Production Environment

Allow administrators to configure:

```text
Production Protection

☑ Require confirmation
☑ Restrict changes to Admin/Owner
☐ Require approval
```

Approval workflows can be a later feature.

---

# 58. Database Schema

Core tables:

```text
users

organizations

organization_users

projects

environments

feature_flags

feature_flag_environments

targeting_rules

segments

segment_rules

sdk_keys

audit_logs

evaluation_events
```

---

# 59. Simplified Database Relationships

```text
Organization
      │
      ├──── Users
      │
      └──── Projects
              │
              ├──── Environments
              │
              ├──── FeatureFlags
              │        │
              │        └──── FlagEnvironmentConfig
              │                   │
              │                   └──── Rules
              │
              └──── Segments
                       │
                       └──── SegmentRules
```

---

# 60. Feature Flag Table

```text
feature_flags

id UUID PK
project_id UUID FK
name VARCHAR
key VARCHAR
description TEXT
type VARCHAR
created_by UUID
created_at TIMESTAMP
updated_at TIMESTAMP
archived_at TIMESTAMP
```

Unique:

```text
(project_id, key)
```

---

# 61. Environment Configuration

```text
feature_flag_environments

id UUID
feature_flag_id UUID
environment_id UUID

enabled BOOLEAN

default_value JSONB

rollout_percentage INTEGER

version INTEGER

updated_at TIMESTAMP
```

Unique:

```text
(feature_flag_id, environment_id)
```

---

# 62. Rules

```text
targeting_rules

id UUID

feature_flag_environment_id UUID

priority INTEGER

attribute VARCHAR

operator VARCHAR

value JSONB

result JSONB

created_at TIMESTAMP
```

---

# 63. Evaluation Events

For analytics:

```text
evaluation_events

id
projectId
environmentId
flagId
result
reason
timestamp
```

Do not store personally identifiable user context unless specifically required.

For high-volume production usage, this would eventually move away from PostgreSQL to an event/analytics system.

For this portfolio project PostgreSQL is acceptable.

---

# 64. Analytics

Show basic metrics:

```text
Evaluations Today
145,218

Unique Flags Evaluated
24

True
61%

False
39%
```

Individual flag:

```text
new-checkout

Last 24 hours

Evaluations:
24,921

TRUE:
24.8%

FALSE:
75.2%
```

---

# 65. Analytics Architecture

Do not synchronously insert analytics during flag evaluation if possible.

Use:

```text
Evaluation
    ↓
Queue
    ↓
Background Worker
    ↓
Database
```

Recommended:

```text
BullMQ
Redis
```

This demonstrates asynchronous processing.

---

# 66. NestJS Modules

Recommended backend structure:

```text
src/
│
├── auth/
├── users/
├── organizations/
├── projects/
├── environments/
├── feature-flags/
├── targeting/
├── segments/
├── evaluations/
├── sdk-keys/
├── audit/
├── analytics/
├── cache/
├── events/
├── websocket/
└── common/
```

---

# 67. Feature Flag Module

Example:

```text
feature-flags/

feature-flags.controller.ts
feature-flags.service.ts
feature-flags.repository.ts

dto/
entities/
```

Responsibilities:

```text
create flags
update flags
archive flags
environment configuration
flag validation
cache invalidation
audit logging
```

---

# 68. Evaluation Module

This should contain the most interesting code in the project.

Example:

```text
evaluations/

evaluation.controller.ts

evaluation.service.ts

evaluation-engine.service.ts

rule-evaluator.service.ts

percentage-rollout.service.ts

segment-evaluator.service.ts
```

Keep the evaluation algorithm isolated and unit-testable.

---

# 69. Evaluation Engine Interface

Example:

```typescript
interface FlagEvaluationContext {
  userId?: string;
  [key: string]: unknown;
}

interface FlagEvaluationResult {
  value: boolean;
  reason:
    | "FLAG_DISABLED"
    | "USER_TARGET"
    | "SEGMENT_MATCH"
    | "RULE_MATCH"
    | "PERCENTAGE_ROLLOUT"
    | "DEFAULT";
}
```

---

# 70. Frontend Structure

```text
src/
│
├── api/
├── components/
├── layouts/
├── pages/
├── hooks/
├── features/
│   ├── auth/
│   ├── projects/
│   ├── flags/
│   ├── segments/
│   ├── environments/
│   ├── audit/
│   └── analytics/
│
├── router/
├── utils/
└── App.jsx
```

---

# 71. TanStack Query

Use TanStack Query for server state.

Example:

```javascript
useQuery({
  queryKey: ["flags", projectId],
  queryFn: () => fetchFlags(projectId)
});
```

Mutations:

```javascript
useMutation({
  mutationFn: updateFlag
});
```

After update:

```javascript
queryClient.invalidateQueries({
  queryKey: ["flags"]
});
```

---

# 72. Error Handling

Backend should return standardized errors.

Example:

```json
{
  "statusCode": 404,
  "code": "FLAG_NOT_FOUND",
  "message": "Feature flag was not found",
  "timestamp": "2026-08-12T20:30:00Z"
}
```

Create a global NestJS exception filter.

---

# 73. Validation

Use:

```text
class-validator
class-transformer
```

Example:

```typescript
export class CreateFeatureFlagDto {
  @IsString()
  @MinLength(2)
  name: string;

  @Matches(/^[a-z0-9-]+$/)
  key: string;
}
```

---

# 74. Rate Limiting

SDK endpoints should be rate limited.

For example:

```text
1000 requests / minute / SDK key
```

Management endpoints:

```text
100 requests / minute / user
```

Use NestJS throttling support.

---

# 75. Security

Implement:

```text
password hashing
JWT
refresh tokens
RBAC
SDK key hashing
rate limiting
input validation
CORS
Helmet
secure headers
SQL injection prevention through ORM
audit logging
```

Never return:

```text
password hashes
SDK hashes
refresh token hashes
```

---

# 76. Password Storage

Use:

```text
argon2
```

or:

```text
bcrypt
```

Prefer Argon2.

---

# 77. Refresh Tokens

Store hashed refresh tokens.

Support:

```text
refresh token rotation
logout
revoke all sessions
```

---

# 78. Health Checks

Endpoints:

```text
GET /health
GET /health/live
GET /health/ready
```

Readiness checks:

```text
PostgreSQL
Redis
```

---

# 79. Logging

Use structured JSON logging.

Example:

```json
{
  "level": "info",
  "message": "Feature flag updated",
  "flag": "new-checkout",
  "environment": "production",
  "userId": "123",
  "requestId": "abc"
}
```

Use correlation IDs.

---

# 80. OpenAPI Documentation

Swagger:

```text
/api/docs
```

Document:

```text
authentication
projects
flags
segments
SDK evaluation
```

GitHub screenshots should include this page.

---

# 81. Testing Strategy

The project should have strong tests because this dramatically improves its GitHub value.

Use:

```text
Jest
Supertest
Playwright
```

---

# 82. Unit Tests

Especially test:

```text
evaluation engine
percentage rollout
rule comparison
segment matching
permission guards
```

Example tests:

```text
disabled flag always returns false

matching explicit user returns true

country IT rule matches IT

country IT rule does not match PK

25% rollout returns deterministic result

same user always receives same rollout result
```

---

# 83. Integration Tests

Test:

```text
PostgreSQL repositories
Redis cache
authentication
flag creation
flag update
audit creation
```

Use a test database or Testcontainers.

---

# 84. End-to-End Tests

Playwright scenarios:

```text
login

create project

create flag

enable development flag

configure production rollout

create targeting rule

verify audit entry
```

---

# 85. Concurrency Tests

Important portfolio-level test:

Two administrators update the same flag simultaneously.

Use:

```text
version
```

for optimistic locking.

Example:

```text
Client A reads version 8
Client B reads version 8

Client A updates

version → 9

Client B tries update using 8
```

Response:

```text
409 Conflict
```

This prevents accidental overwrites.

---

# 86. Docker

Provide:

```text
docker-compose.yml
```

Containing:

```text
frontend
backend
postgres
redis
```

Developer should be able to run:

```bash
docker compose up
```

and access:

```text
Frontend
http://localhost:5173

Backend
http://localhost:3000

Swagger
http://localhost:3000/api/docs
```

---

# 87. Environment Variables

Example:

```text
DATABASE_URL=

REDIS_HOST=
REDIS_PORT=

JWT_SECRET=
JWT_EXPIRATION=

REFRESH_TOKEN_SECRET=

FRONTEND_URL=

PORT=3000
```

Commit:

```text
.env.example
```

Never commit actual secrets.

---

# 88. Monorepo Structure

I would recommend:

```text
flagforge/
│
├── apps/
│   ├── dashboard/
│   └── api/
│
├── packages/
│   ├── js-sdk/
│   ├── shared-types/
│   └── eslint-config/
│
├── docker/
│
├── docs/
│
├── docker-compose.yml
│
├── README.md
│
└── package.json
```

Use:

```text
pnpm workspaces
```

or:

```text
npm workspaces
```

---

# 89. Shared Types

Package:

```text
@flagforge/shared
```

Could contain:

```typescript
FlagEvaluationResult
Environment
FeatureFlag
TargetingOperator
AuditAction
```

This demonstrates clean monorepo architecture.

---

# 90. CI/CD

GitHub Actions workflow:

```text
Pull Request

      ↓

Install

      ↓

Lint

      ↓

Unit Tests

      ↓

Integration Tests

      ↓

Build Frontend

      ↓

Build Backend

      ↓

Docker Build
```

Main branch:

```text
Build
 ↓
Docker Images
 ↓
Publish
```

---

# 91. GitHub Actions

Suggested workflows:

```text
ci.yml
docker.yml
release.yml
dependency-review.yml
```

CI should execute:

```bash
npm run lint
npm test
npm run build
```

---

# 92. Database Migrations

All database changes must use migrations.

Example:

```bash
prisma migrate dev
```

Never rely on automatic schema synchronization in production.

---

# 93. Seed Data

Provide:

```bash
npm run seed
```

Seed:

```text
Demo Organization

Demo User

Project:
E-commerce

Environments:
Development
Staging
Production

Flags:
new-checkout
dark-mode
recommendations-v2
```

Demo credentials can be documented for local use.

---

# 94. Developer Experience

A developer cloning the repository should only need:

```bash
git clone ...

cp .env.example .env

docker compose up
```

This is extremely important for portfolio repositories.

Recruiters and developers usually will not spend thirty minutes configuring someone's project.

---

# 95. README

Your README should look professional.

Recommended structure:

```text
# FlagForge

Screenshot

What is FlagForge?

Features

Architecture

Demo

Tech Stack

Quick Start

Feature Flag Evaluation

Targeting Rules

Percentage Rollouts

JavaScript SDK

API Documentation

Security

Testing

Architecture Decisions

Roadmap

Contributing

License
```

---

# 96. Architecture Diagram

Put something like this directly in the README:

```text
                  React Dashboard
                         │
                         ▼
                    NestJS API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   PostgreSQL          Redis           BullMQ
        │                │                │
        │                │                ▼
        │                │          Analytics Worker
        │                │
        └────────────────┤
                         │
                         ▼
                 WebSocket Gateway
                         │
                         ▼
                    Client SDKs
```

---

# 97. Architecture Decision Records

Add:

```text
docs/adr/
```

Examples:

```text
001-use-postgresql.md

002-use-redis-for-cache.md

003-deterministic-rollouts.md

004-sdk-key-security.md

005-websocket-config-updates.md
```

This is a small addition that makes the repository look much more mature.

---

# 98. MVP Scope

Do **not** build everything at once.

Version `v0.1` should contain only:

### Authentication

```text
register
login
logout
JWT
```

### Projects

```text
create
update
delete
```

### Environments

```text
development
staging
production
```

### Flags

```text
create
edit
archive
enable
disable
```

### Evaluation

```text
boolean flags
REST SDK endpoint
SDK keys
```

### Dashboard

```text
projects
flags
environment switching
flag toggling
```

---

# 99. Version 0.2

Add:

```text
percentage rollouts
deterministic hashing
JavaScript SDK
Redis cache
audit logs
```

---

# 100. Version 0.3

Add:

```text
targeting rules
user attributes
segments
rule ordering
```

---

# 101. Version 0.4

Add:

```text
WebSocket updates
local SDK caching
configuration versioning
```

---

# 102. Version 0.5

Add:

```text
analytics
BullMQ
evaluation statistics
dashboard graphs
```

---

# 103. Version 1.0

Add:

```text
multivariate flags
team invitations
advanced RBAC
protected environments
Docker images
deployment documentation
full SDK documentation
production demo
```

---

# 104. Future Features

After `1.0`, possibilities include:

```text
scheduled flag changes

flag expiration dates

flag dependencies

approval workflow

Slack notifications

webhooks

React SDK

NestJS SDK

Python SDK

Java SDK

Terraform provider

CLI

OpenTelemetry

experiments / A-B testing

GitHub integration

flag cleanup detection
```

---

# 105. CLI

Potential future package:

```text
@flagforge/cli
```

Example:

```bash
flagforge login

flagforge flags list

flagforge flags create new-checkout

flagforge flags enable new-checkout --env staging

flagforge flags disable new-checkout --env production
```

This would be another excellent GitHub portfolio feature.

---

# 106. React SDK

Future package:

```text
@flagforge/react
```

Usage:

```jsx
const enabled = useFeatureFlag("new-checkout");

return enabled
  ? <NewCheckout />
  : <OldCheckout />;
```

Context:

```jsx
<FlagForgeProvider
  client={client}
  context={{
    userId: user.id,
    country: user.country
  }}
>
  <App />
</FlagForgeProvider>
```

---

# 107. Example Real-World Scenario

Feature:

```text
recommendations-v2
```

Requirements:

```text
internal employees → always enabled

premium customers in Italy → enabled

all other users → 10% rollout
```

Configuration:

```text
Rule 1

IF segment = employees

RETURN true


Rule 2

IF country = IT
AND plan = premium

RETURN true


Rule 3

10% rollout


Default

false
```

Evaluation:

```json
{
  "userId": "9321",
  "country": "IT",
  "plan": "premium"
}
```

Result:

```json
{
  "key": "recommendations-v2",
  "value": true,
  "reason": "RULE_MATCH"
}
```

---

# 108. Performance Goals

Initial targets:

```text
cached flag evaluation API:

p95 < 50ms

management API:

p95 < 300ms
```

With local SDK evaluation:

```text
< 5ms
```

These don't need to be hard production guarantees but give you measurable engineering objectives.

---

# 109. Reliability Requirements

SDK evaluation should fail safely.

Example:

```javascript
await flags.isEnabled(
  "new-checkout",
  user,
  false
);
```

If FlagForge becomes unavailable:

```text
return supplied default value
```

The application must not crash because the feature flag service is unavailable.

---

# 110. Evaluation Failure Handling

Example reasons:

```text
FLAG_NOT_FOUND
INVALID_CONTEXT
SDK_KEY_INVALID
CONFIGURATION_UNAVAILABLE
```

SDK:

```javascript
try {
  return await evaluate();
} catch {
  return defaultValue;
}
```

---

# 111. Flag Lifecycle

Flags should support:

```text
ACTIVE
ARCHIVED
```

Do not immediately physically delete production flags.

Archiving preserves:

```text
history
audit information
analytics
```

Optional later state:

```text
STALE
```

A flag may become stale when it hasn't been evaluated for 30 days.

---

# 112. Flag Ownership

A useful later feature:

```text
Owner:
Checkout Team
```

Fields:

```text
ownerUserId
ownerTeamId
```

This helps identify who is responsible for removing old flags.

---

# 113. GitHub Portfolio Features

To make this project impressive rather than merely functional, the repository should visibly demonstrate:

```text
clean architecture

meaningful commits

issues

pull requests

releases

unit tests

integration tests

E2E tests

Docker

CI pipeline

Swagger

architecture diagrams

ADRs

database migrations

security decisions

performance testing

SDK package

screenshots

demo GIF
```

---

# 114. Suggested GitHub Issues

Instead of committing everything directly, create issues like:

```text
FF-001 Initialize NestJS API

FF-002 Initialize React dashboard

FF-003 Add PostgreSQL and Prisma

FF-004 Implement authentication

FF-005 Implement organization model

FF-006 Implement project management

FF-007 Implement environments

FF-008 Implement feature flag CRUD

FF-009 Implement environment flag configuration

FF-010 Implement SDK key authentication

FF-011 Implement evaluation endpoint

FF-012 Implement deterministic rollout algorithm

FF-013 Implement targeting rules

FF-014 Add Redis caching

FF-015 Add audit logging

FF-016 Create JavaScript SDK

FF-017 Implement WebSocket updates

FF-018 Implement segments

FF-019 Add analytics worker

FF-020 Add Playwright E2E tests
```

This makes the GitHub repository itself show how you work as an engineer.

---

# 115. Definition of Done for MVP

The MVP is complete when a user can:

1. Register.
2. Login.
3. Create a project.
4. View its default environments.
5. Create a feature flag.
6. Enable the flag in development.
7. Disable it in production.
8. Create an SDK key.
9. Call the evaluation API.
10. Receive the correct flag value.
11. Change the flag through the dashboard.
12. Immediately receive the new value through the API.
13. See who changed the flag in the audit log.

Example end-to-end flow:

```text
Dashboard

Create:
new-checkout

Production:
OFF

      ↓

Application

isEnabled("new-checkout")

      ↓

false


Dashboard

Production:
ON

      ↓

Application

isEnabled("new-checkout")

      ↓

true
```

---

# 116. Final Target Architecture

The finished portfolio version should roughly look like:

```text
                             ┌─────────────────┐
                             │ React Dashboard │
                             └────────┬────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │ NestJS API   │
                              │              │
                              │ Auth / RBAC  │
                              │ Management   │
                              │ Evaluation   │
                              └──────┬───────┘
                                     │
                 ┌───────────────────┼────────────────────┐
                 │                   │                    │
                 ▼                   ▼                    ▼
           PostgreSQL              Redis               BullMQ
                 │                   │                    │
                 │                   │                    ▼
                 │                   │              Analytics
                 │                   │               Worker
                 │                   │
                 │              Redis Pub/Sub
                 │                   │
                 │                   ▼
                 │           WebSocket Gateway
                 │                   │
                 └───────────────────┼───────────────────┐
                                     │                   │
                                     ▼                   ▼
                              JavaScript SDK       React SDK
                                     │
                                     ▼
                              Client Application
```

---

# 117. What This Project Demonstrates

When someone looks at FlagForge on your GitHub, they should immediately see that you understand more than React forms and NestJS controllers.

It demonstrates:

**Frontend**

```text
React
state management
API integration
real-time UI
complex forms
dashboards
```

**Backend**

```text
NestJS architecture
authentication
authorization
rule engines
API design
background processing
```

**Database**

```text
PostgreSQL
relationships
indexes
migrations
optimistic locking
```

**Distributed Systems**

```text
Redis caching
Pub/Sub
WebSockets
cache invalidation
deterministic rollouts
event processing
```

**Engineering**

```text
Docker
CI/CD
testing
API documentation
security
observability
architecture decisions
SDK development
```

That is exactly why FlagForge can become a much stronger portfolio project than a normal e-commerce, Todo, or social media clone.
