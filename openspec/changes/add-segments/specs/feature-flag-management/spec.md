## MODIFIED Requirements

### Requirement: Demo seed includes feature flags
The system SHALL seed local demo feature flags, rollout configuration, targeting rules, segments, and segment references for the demo project.

#### Scenario: Seed creates demo feature flags
- **WHEN** a developer runs `pnpm seed`
- **THEN** the demo project contains repeatable boolean feature flags with per-environment configurations

#### Scenario: Seed creates demo rollout configuration
- **WHEN** a developer runs `pnpm seed`
- **THEN** at least one demo feature flag environment configuration has a representative rollout percentage for local dashboard and SDK testing

#### Scenario: Seed creates demo targeting rules
- **WHEN** a developer runs `pnpm seed`
- **THEN** at least one demo feature flag environment configuration has representative ordered targeting rules for local dashboard and SDK testing

#### Scenario: Seed creates demo segments
- **WHEN** a developer runs `pnpm seed`
- **THEN** the demo project contains representative reusable segments and at least one flag environment configuration references a segment

#### Scenario: Seed is idempotent for feature flags
- **WHEN** a developer reruns `pnpm seed`
- **THEN** the seed updates or preserves the demo feature flags, rollout percentages, targeting rules, segments, and segment references without creating duplicates
