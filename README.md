# Hustle Hub

Hustle Hub is a secure freelance marketplace platform. The purpose of this platform is to allow freelancers to advertise services and clients to browse and book those services.

Part 1 focused on developing a secure backend API for registration and authentication. Part 2 expanded the system into a fully functional marketplace using React, Node.js, Express and MongoDB. Part 3 focuses on tax calculations, additional security features, Docker, CI/CD, logging and monitoring.




**Final Part 3 demonstration:**

## Group Members

- **Zachary Handley** - ST10435382
- **Braedy Dillon** - ST10439231
- **Joel Napier** - ST10457625

## Intended Users

The system supports three different user roles:

- **Clients:** Browse gigs, book services, view transactions and manage their accounts.
- **Freelancers:** Create gigs, manage bookings, track income and view estimated tax.
- **Admins:** Manage platform information through authorised administrative functionality.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **Security:** Helmet, express-rate-limit and sanitize-html
- **TLS/SSL:** node-forge
- **Frontend:** React and Vite
- **Testing:** Postman, Newman, Vitest and React Testing Library
- **Static Analysis:** ESLint
- **Containerisation:** Docker and Docker Compose
- **Logging:** Pino and pino-http
- **Version Control and CI/CD:** GitHub and GitHub Actions

## System Architecture

HustleHub+ follows the MERN architecture. React handles the user interface, while Node.js and Express process API requests and enforce security requirements.

MongoDB stores user information, gigs, bookings and transactions.

The API handles authentication, authorisation, validation, booking management, income calculations and tax estimation.

Protected endpoints use JWT authentication and role-based access control to prevent unauthorised operations.

## Frontend

The frontend provides separate functionality for clients, freelancers and administrators. React and Vite are used to create a responsive application that communicates with the backend through REST API requests.

### Authentication

Users can register and log in using their email address and password. Successful authentication provides a JWT that is used when accessing protected resources.

### Client Features

- Browse available services.
- View gig descriptions and pricing packages.
- Book services offered by freelancers.
- View booking history and transactions.
- Manage profile information.

### Freelancer Features

- Create and manage service listings.
- Update or remove existing gigs.
- View and manage bookings.
- Accept, decline and complete bookings.
- View income and projected earnings.
- View estimated tax calculations.
- Manage profile information.

### Administration Features

The application includes an administration dashboard for viewing and managing platform information. Administrative functionality is protected through role-based authorisation.

## Marketplace Features

### Gigs and Pricing Tiers

Freelancers can advertise their services by creating gigs. Each gig includes a title, category, description and between one and three pricing tiers.

Each pricing tier contains its own title, description and price.

Prices are stored as whole numbers of cents in South African Rand to reduce rounding errors.

Users can browse active gigs, search by title and filter by category.

Deleting a gig uses a soft-delete approach. Removed gigs are hidden from browsing while existing booking references remain valid.

### Booking Lifecycle

Clients can book a pricing tier from an available gig. The booking stores the selected tier and agreed price so that later changes to the gig do not affect existing bookings.

Payments are simulated rather than processed through an actual payment gateway.

| Action | User | Result |
|---|---|---|
| Create booking | Client | Pending |
| Accept booking | Freelancer | Confirmed |
| Complete booking | Freelancer | Completed |
| Decline booking | Freelancer | Declined and refunded |
| Cancel booking | Client | Cancelled and refunded |

Invalid status changes are rejected by the backend.

### Transactions and Refunds

Every booking creates a transaction record.

Transactions are append-only, meaning previous transactions are not overwritten. Refunds create separate negative transactions linked to the original booking.

This provides a record of financial activity while preventing duplicate refunds.

### Income

Freelancers can view their income and projected income.

**Income:** Total value of completed bookings.

**Projected income:** Total value of pending and confirmed bookings.

Cancelled and declined bookings are excluded from income calculations.

## Part 3 — Tax Calculation and Income Dashboard

A tax estimation feature was added to provide freelancers with an overview of their estimated tax obligations based on earnings generated through HustleHub+.

The backend calculates income using completed bookings and applies progressive South African individual income-tax brackets.

The calculation is performed by the backend rather than the frontend to maintain consistency.

### Tax Calculation

The system calculates estimated tax using the following approach:

1. Retrieve the freelancer's completed bookings.
2. Calculate total income for the selected tax year.
3. Apply the configured progressive tax brackets.
4. Calculate the estimated tax payable.
5. Apply the configured primary rebate.
6. Display the result in the frontend dashboard.

The backend uses integer cents for monetary calculations to reduce floating-point rounding errors.

### Freelancer Dashboard

The income dashboard displays:

- Total income earned.
- Projected income.
- Estimated income tax.
- Effective tax rate.
- Monthly income information.
- Tax bracket breakdown.

Charts and financial summaries make the information easier for freelancers to understand.

The tax values are estimates for educational purposes and do not replace official SARS calculations or professional tax advice.

**Evidence:** [ADD SCREENSHOT OF INCOME DASHBOARD AND TAX CALCULATION]

## Security Decisions

### Password Hashing

Passwords are hashed using bcrypt before being stored in MongoDB.

During login, the entered password is compared against the stored hash using bcrypt.

This prevents the application from storing plaintext passwords.

### Token-Based Authentication

JWT authentication is used to identify users when accessing protected endpoints.

Tokens are signed using a secret stored in environment variables and expire after a configured period.

The backend validates tokens before granting access to protected resources.

### Input Validation

User input is validated using express-validator before being processed by the application.

Validation and sanitisation reduce the risk of invalid data, injection attacks and malicious input.

### HTTPS

HTTPS is configured using locally generated SSL certificates.

This provides encrypted communication between the frontend and backend during local HTTPS development.

Production deployments should use trusted certificates.

### Role-Based Access Control

Role-based access control restricts operations according to the user's role.

Freelancers can only update and manage their own gigs. Clients can only access their own bookings and transactions.

Protected operations verify ownership using authenticated user information.

### Controlled Error Handling

The application uses centralised error handling to return controlled API responses.

Unexpected errors are logged internally without exposing sensitive server details or stack traces to the user.

## Part 3 — Additional Security Feature 1: Password Reset

A password-reset feature was developed to allow users to recover access to their accounts when they forget their passwords.

The backend generates secure random reset tokens and stores their hashes instead of the original tokens.

Reset tokens expire after 15 minutes.

The password-reset process is designed to verify the token before allowing a new password to be securely hashed and saved.

### Security Benefits

- Reset tokens are cryptographically generated.
- Only token hashes are stored.
- Reset tokens expire after 15 minutes.
- Users do not need to reveal their previous passwords.

**Testing:** Four automated tests passed, covering token generation, uniqueness, hashing and expiration.

**Verification:** [CONFIRM FRONTEND PASSWORD RESET, EMAIL DELIVERY AND SINGLE-USE TOKEN BEHAVIOUR]

## Part 3 — Additional Security Feature 2: Account Lockout

An account lockout system was implemented to reduce brute-force login attacks.

After five incorrect password attempts within 15 minutes, a user's account is temporarily locked for 15 minutes.

The system stores failed login attempts in MongoDB and automatically allows login attempts again after the lockout expires.

Successful login resets the failed-attempt counter.

Users are shown a message indicating how long their account remains locked.

### Security Logging

The following events are recorded:

- `auth.login.failed`
- `auth.account.locked`
- `auth.login.blocked`

### Testing

Four automated unit tests were created, covering the lockout threshold, expiration, successful-login reset and isolation between accounts.

**All four tests passed.**

Manual testing also confirmed that an account becomes locked after five failed login attempts and that subsequent attempts are blocked.

This feature works alongside IP-based rate limiting to provide an additional level of authentication security.

## Part 3 — Docker Containerisation

Docker was implemented to containerise HustleHub+'s frontend and backend.

The project includes:

- `api/Dockerfile` — Backend application.
- `client/Dockerfile` — React frontend.
- `compose.yaml` — Docker Compose configuration.

Docker Compose manages the API, frontend and MongoDB services in a single environment.

### Running the Application Using Docker

From the `hustlehub-plus` directory:

```bash
docker compose up --build -d
```

To check the running containers:

```bash
docker compose ps
```

To view API logs:

```bash
docker compose logs -f api
```

To stop the application:

```bash
docker compose down
```

The containerised frontend is available locally at:

`http://localhost:8081`

Docker provides a consistent environment for running the application and reduces differences between development machines.

The Docker Compose environment is intended for local demonstration and requires additional HTTPS configuration before public production deployment.

**Evidence:** [ADD DOCKER CONTAINERS AND RUNNING APPLICATION SCREENSHOTS]

## Part 3 — CI/CD Pipeline

GitHub Actions was configured to automate testing and build verification.

The workflow is located in:

`.github/workflows/ci.yml`

The pipeline is designed to run automatically when code changes are pushed or pull requests are created.

### Backend Pipeline

The backend workflow performs the following:

- Installs Node.js dependencies.
- Runs ESLint validation.
- Executes automated backend unit tests.
- Checks backend JavaScript syntax.

### Frontend Pipeline

The frontend workflow performs the following:

- Installs frontend dependencies.
- Runs ESLint.
- Executes frontend tests using Vitest.
- Builds the production React application.
- Uploads the frontend build artefact.

The pipeline is designed to fail when configured tests or checks fail.

### CI/CD Verification

The workflow has been configured, but GitHub Actions execution is currently blocked by an account billing restriction.

The jobs are prevented from starting, meaning the restriction is not evidence of a test failure.

Local tests have been executed successfully while the billing issue is being resolved.

**Outstanding:** Automated API testing, security scanning and complete Docker build verification should also be integrated into the CI/CD workflow to satisfy all final assessment requirements.

**Evidence:** [ADD SUCCESSFUL GITHUB ACTIONS SCREENSHOT]

## Part 3 — Static Code Analysis

Static code analysis is used to identify potential coding problems without executing the application.

ESLint was configured for the backend and frontend and included in the CI/CD workflow.

It assists with identifying code-quality problems, inconsistent practices and certain programming mistakes.

### Running Static Analysis

Backend:

```bash
cd api
npm run lint
```

Frontend:

```bash
cd client
npm run lint
```

The results help developers identify and fix issues before merging code into the main branch.

ESLint is not a complete vulnerability scanner, so additional dependency and security checks should also be included in the CI/CD pipeline.

**Evidence:** [ADD STATIC ANALYSIS RESULTS AND EXPLANATION OF FIXES]

## Part 3 — Logging and Monitoring

Logging was implemented using Pino and pino-http to record important system events.

The logging system assists developers with troubleshooting, monitoring and identifying suspicious activity.

### Events Recorded

| Event | Purpose |
|---|---|
| Successful login | Records successful authentication |
| Failed login | Identifies incorrect login attempts |
| Account locked | Records temporary account lockout |
| Rate limit exceeded | Identifies excessive API requests |
| Booking created | Tracks booking activity |
| Transaction recorded | Tracks simulated financial transactions |
| Application error | Assists with troubleshooting |

Logs include useful information such as event names, request identifiers and response statuses.

Sensitive information such as passwords and authentication tokens should be excluded or redacted from logs.

### Cloud Logging

The project includes optional integration with Axiom for cloud-based logging.

When configured, this allows logs to be collected and reviewed through an external monitoring platform.

Cloud-based logging can help administrators investigate errors and security events without relying exclusively on local terminal output.

**Evidence:** [VERIFY AXIOM RECEIVES LOGS AND ADD SCREENSHOT]

## Part 3 — Final Security Review

The final security review evaluates common threats and explains the protections implemented in HustleHub+.

| Security Threat | Protection |
|---|---|
| Brute-force attacks | Account lockout and rate limiting |
| Password exposure | bcrypt hashing |
| Unauthorised API access | JWT authentication |
| Incorrect user permissions | Role-based access control |
| Injection attacks | Input validation and sanitisation |
| Cross-site scripting (XSS) | Input sanitisation, React escaping and Helmet CSP |
| Sensitive information exposure | Controlled error handling and log redaction |
| Unauthorised gig modifications | Ownership checks |
| Transaction manipulation | Server-controlled prices and protected booking operations |
| Suspicious system activity | Security logging and monitoring |

### Security Evaluation

The application uses several security measures to protect authentication, user information and financial records.

Password hashing protects stored credentials, while JWT authentication and role-based access control restrict access to protected API operations.

Input validation and sanitisation help reduce the risk of malicious requests.

The additional account lockout and password-reset features strengthen the authentication system.

Structured logging provides evidence of important system events and assists with investigating security incidents.

### Remaining Security Considerations

Before public production deployment, the application should undergo additional vulnerability scanning, HTTPS verification, dependency checks and integration testing.

The account-lockout feature should also be tested under simultaneous login requests to verify that counters remain accurate.

## Setting Up

### Database

The application uses MongoDB.

1. Install MongoDB Community Server.
2. Configure the `MONGODB_URI` environment variable.
3. Start the MongoDB service.

The default local connection string is:

`mongodb://127.0.0.1:27017/hustlehub`

MongoDB creates the relevant collections when data is stored.

### Backend Setup

From the project directory:

```bash
cd hustlehub-plus/api
npm install
```

Create a `.env` file using `.env.example`.

Generate development certificates:

```bash
npm run certs
```

Start the backend:

```bash
npm run dev
```

The backend runs at:

`https://localhost:5000`

### Frontend Setup

```bash
cd hustlehub-plus/client
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## API Endpoints

All marketplace endpoints use the `/api` prefix.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |

### Gigs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/gigs` | Browse gigs |
| GET | `/api/gigs/:id` | View gig |
| GET | `/api/gigs/mygigs` | View own gigs |
| POST | `/api/gigs` | Create gig |
| PUT | `/api/gigs/:id` | Update gig |
| DELETE | `/api/gigs/:id` | Remove gig |
| PATCH | `/api/gigs/:id/restore` | Restore gig |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/mybookings` | View bookings |
| GET | `/api/bookings/:id` | View booking details |
| PATCH | `/api/bookings/:id/accept` | Accept booking |
| PATCH | `/api/bookings/:id/complete` | Complete booking |
| PATCH | `/api/bookings/:id/decline` | Decline booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

### Finance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/finance/income` | View income |
| GET | `/api/finance/transactions` | View transactions |
| GET | `/api/finance/tax` | View tax estimation |

## Testing

### Backend Unit Testing

Backend testing uses Node.js's built-in test runner.

Run:

```bash
cd api
npm test
```

The latest local test execution produced:

| Test Category | Passed |
|---|---:|
| Account lockout | 4 |
| Password-reset token utilities | 4 |
| Tax calculations | 7 |
| **Total** | **15** |

**Result: 15 passed, 0 failed.**

### Frontend Testing

Frontend testing uses Vitest and React Testing Library.

Run:

```bash
cd client
npm test
```

The frontend tests check component rendering and user interactions.

**Evidence:** [ADD FINAL FRONTEND TEST RESULTS]

### API Security Testing — Postman and Newman

The backend includes automated API testing using Postman and Newman.

Testing covers:

- Registration and login.
- JWT authentication.
- Role-based access control.
- Gig creation and management.
- Booking creation and lifecycle operations.
- Ownership checks.
- Input validation and sanitisation.
- Unauthorised requests.
- Transaction and booking security.

### Running Newman

From the API directory:

```bash
npm run test:api -- --environment newman.local.json
```

This requires the backend and MongoDB to be running and the local test environment to be configured.

The earlier recorded API test results were:

| Metric | Result |
|---|---:|
| Requests | 38 |
| Test scripts | 38 |
| Assertions | 81 |
| Failed requests | 0 |
| Failed assertions | 0 |

**Overall result: PASS**

These API tests should be rerun against the final merged application.

## Part 3 — Final Demonstration

The final demonstration video must show the complete application flow.

The demonstration should include:

- Registration and login.
- Freelancer gig creation.
- Client browsing and booking.
- Booking status updates.
- Transaction creation.
- Income and tax dashboard.
- Password-reset functionality.
- Account lockout after failed logins.
- Docker environment.
- Logging and monitoring.
- CI/CD and automated testing evidence.

**Final video link:** [ADD FINAL YOUTUBE LINK]

## Final Submission Checklist

- [ ] Complete and verify all application features.
- [x] Implement tax and income calculations.
- [x] Configure Docker and Docker Compose.
- [x] Implement structured logging.
- [x] Implement account lockout security.
- [x] Pass backend unit tests (15/15).
- [ ] Verify password-reset frontend and complete reset flow.
- [ ] Verify cloud logging.
- [ ] Add final static analysis evidence.
- [ ] Obtain successful GitHub Actions results.
- [ ] Confirm automated API and security scans are included in CI/CD.
- [ ] Capture final Docker evidence.
- [ ] Run final frontend and Newman tests.
- [ ] Record the final demonstration video.
- [ ] Upload final code and documentation to GitHub.

## Conclusion

HustleHub+ was developed as a secure freelance marketplace that allows freelancers to advertise services and clients to book those services.

The application incorporates secure authentication, role-based access control, booking and transaction management, income tracking and tax estimation.

The final development phase introduced additional security features, Docker containerisation, automated testing, static code analysis and structured logging.

These improvements strengthen the reliability, maintainability and security of the application and support its readiness for deployment.

**Final verification of CI/CD execution, cloud logging and remaining evidence is required before submission.**
