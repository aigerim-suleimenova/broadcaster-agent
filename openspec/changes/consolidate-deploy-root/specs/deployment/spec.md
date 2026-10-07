## Purpose

Defines where production is built from and how the deployed backend handles cross-origin requests. The goal is that the code developed and tested in this repository is the code users run.

## ADDED Requirements

### Requirement: Production builds from a single source tree
Both production services (frontend and backend) SHALL be built from the repository root. The repository SHALL NOT contain a second copy of the application source used for deployment.

#### Scenario: Deploy configuration points at the repository root
- **WHEN** the deploy configuration is read
- **THEN** both the frontend and backend services use the repository root as their root directory

#### Scenario: No duplicate deploy tree remains
- **WHEN** the repository is searched for references to `research-canvas-standalone`
- **THEN** no tracked file outside archived OpenSpec changes references it, and the directory does not exist

#### Scenario: Frontend builds and starts from the root
- **WHEN** the frontend build command runs from the repository root and the production start command runs
- **THEN** the server starts, `GET /` returns HTTP 200, and the page's static CSS and JavaScript assets return HTTP 200

#### Scenario: Backend installs and starts from the root
- **WHEN** backend dependencies are installed from the root's backend requirements file and the backend start command runs
- **THEN** `GET /health` returns HTTP 200 with status `healthy`

### Requirement: Backend accepts cross-origin requests from the configured frontend
The backend SHALL allow cross-origin requests from local development origins (`http://localhost:3000`, `http://127.0.0.1:3000`) and from the origin set in the `FRONTEND_URL` environment variable when it is set. It SHALL NOT allow any other origin.

#### Scenario: Configured frontend origin is allowed
- **WHEN** `FRONTEND_URL` is set to `https://broadcaster-agent-frontend.onrender.com` and a CORS preflight request arrives from that origin
- **THEN** the response includes `Access-Control-Allow-Origin: https://broadcaster-agent-frontend.onrender.com`

#### Scenario: Local development origin is allowed
- **WHEN** a CORS preflight request arrives from `http://localhost:3000`
- **THEN** the response allows that origin

#### Scenario: Unknown origin is rejected
- **WHEN** a CORS preflight request arrives from `https://evil.example.com`
- **THEN** the response does not include an `Access-Control-Allow-Origin` header for that origin

#### Scenario: FRONTEND_URL unset
- **WHEN** `FRONTEND_URL` is not set
- **THEN** only the local development origins are allowed
