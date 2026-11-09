# Hustle Hub

Hustle Hub is a secure freelance marketplace platform that allows freelancers to advertise services and clients to browse and book those services.

Part 1 focused on developing a secure backend API for registration and authentication. Part 2 expanded the system into a full-stack marketplace. Part 3 introduces financial insights, additional security features, Docker containerisation, CI/CD, static code analysis, and logging.

## YouTube Video Link

https://youtu.be/LPHy-0MfQyg

## Group Members

- **Zachary Handley** - ST10435382
- **Braedy Dillon** - ST10439231
- **Joel Napier** - ST10457625

## Intended Users

The system supports:

- Clients
- Freelancers
- Admins

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **Security Middleware:** Helmet, express-rate-limit, sanitize-html
- **TLS/SSL:** node-forge
- **Frontend:** React and Vite
- **Testing:** Postman, Newman, Vitest and React Testing Library
- **Static Code Analysis:** ESLint
- **Containerisation:** Docker and Docker Compose
- **Logging:** Pino and pino-http
- **CI/CD:** GitHub Actions

## Frontend

The frontend provides interfaces for clients, freelancers and administrators. React and Vite were used to develop the frontend, which communicates with the Node.js and Express backend through REST API requests.

### Frontend Features

#### Authentication

The frontend allows users to register and log in using their email address and password. JWT authentication is used to access protected endpoints.

#### Client Features

- Browse available services.
- View gig descriptions and pricing packages.
- Book services offered by freelancers.
- View bookings and transactions.
- Manage profile information.

#### Freelancer Features

- Create and manage service listings.
- Update gig information.
- View and manage bookings.
- Accept, decline and complete bookings.
- View income and projected earnings.
- View estimated tax calculations.
- Manage profile information.

#### Administration Features

The frontend includes an administration dashboard intended for managing platform information. Administrative functionality depends on the corresponding protected backend endpoints.

## Marketplace Features

### Gigs and Pricing Tiers

Freelancers list their services as gigs. Each gig includes a title, category, description and between one and three pricing tiers.

Each tier includes its own title, description and price.

- Prices are stored as whole numbers of cents in ZAR to reduce rounding errors.
- A tier can cost between R30 and R50,000.
- Categories include music, coding, writing, marketing, tutoring, photography, art, design, videography and other.
- Visitors can browse active gigs and search by title or category.
- Deleting a gig performs a soft delete, allowing existing bookings to retain their references.

### Booking Lifecycle

Clients can book a pricing tier from a freelancer's gig. The selected tier and price are copied onto the booking, preventing future pricing changes from affecting existing bookings.

Payments are simulated rather than processed through a real payment gateway.

| Event | User | Status | Transaction |
|---|---|---|---|
| Create booking | Client | Pending | Payment |
| Accept booking | Freelancer | Confirmed | None |
| Complete booking | Freelancer | Completed | None |
| Decline booking | Freelancer | Declined | Refund |
| Cancel booking | Client | Cancelled | Refund |

Invalid status changes are rejected by the backend.

### Transactions and Refunds

Transactions are append-only. Refunds create separate negative transactions instead of modifying the original payment record.

A booking can have one payment and one refund, enforced through database restrictions.

### Income

Freelancers can view:

- **Income:** Total value of completed bookings.
- **Projected income:** Total value of pending and confirmed bookings.

Declined and cancelled bookings are excluded because they are refunded.

Income is calculated from booking records to maintain consistency with the database.

## Tax Calculation and Financial Dashboard

A tax estimation feature was implemented to provide freelancers with an overview of their earnings and estimated tax obligations.

The backend calculates estimated tax using progressive South African income-tax brackets. Different portions of taxable income are calculated according to the applicable tax bands.

The system calculates tax using the freelancer's completed bookings and applies the configured tax rules.

The frontend provides a financial dashboard displaying income, projected income, tax estimates and financial summaries.

Charts and breakdowns allow freelancers to understand their earnings and estimated tax liability more easily.

The calculation is performed on the backend to maintain consistency and prevent users from manipulating the calculation through frontend requests.

Tax estimates are provided for informational purposes and are not a substitute for official SARS calculations.

### Tax Testing

Automated unit tests verify:

- Zero income produces no tax.
- Negative income is handled as zero.
- Income below the first taxable band is untaxed.
- Tax is calculated correctly across different brackets.
- Unknown tax years are rejected.

Seven automated tax calculation tests passed successfully.

## Security Decisions

### Password Hashing

Passwords are hashed using bcrypt before being stored in MongoDB.

During login, submitted passwords are compared against stored hashes using `bcrypt.compare`.

This ensures plaintext passwords are not stored in the database.

### Token-Based Authentication

JWT authentication is used to identify users when accessing protected API endpoints.

Tokens contain user identification information and are signed using a secret stored in environment variables.

Tokens are validated before users can access protected resources.

### Input Validation

User inputs are validated using express-validator before being processed.

Invalid inputs are rejected, while sanitisation reduces the risk of malicious HTML and scripting content entering the system.

### HTTPS

The backend supports HTTPS using locally generated SSL certificates.

HTTPS encrypts communication between the client and API, protecting credentials and authentication tokens during transmission.

### Rate Limiting

Rate limiting is applied to sensitive endpoints, including login, registration and booking.

The system limits excessive requests within a configured time window to reduce brute-force attempts and API abuse.

### Role-Based Access Control

The backend enforces role-based restrictions for clients, freelancers and administrators.

Freelancers can only modify their own gigs, while clients can only manage bookings they own.

The backend verifies resource ownership using authenticated user information rather than trusting ownership information supplied by the frontend.

### Controlled Error Handling

The application uses controlled error responses to prevent sensitive internal information from being exposed.

Errors are logged for troubleshooting while users receive appropriate API responses.

### Additional Security Feature 1 — Password Reset

The password-reset feature allows users to recover access to their accounts when they forget their passwords.

The backend generates secure random reset tokens and stores their hashes instead of storing the original tokens.

Tokens expire after 15 minutes, reducing the time available for unauthorised use.

The reset token is validated before a new password can be securely hashed and saved.

Four automated unit tests verify token generation, uniqueness, hashing and expiration.

### Additional Security Feature 2 — Account Lockout

An account lockout system was implemented to prevent brute-force login attacks.

After five incorrect password attempts within 15 minutes, the user's account is temporarily locked for 15 minutes.

Failed login attempts are stored in MongoDB, and the account automatically becomes available again after the lockout expires.

Successful login resets the failed-attempt counter.

Users receive a message indicating how long their account remains locked.

Security events are recorded through the logging system.

**Testing:** Four automated unit tests were created, all passing successfully. Manual testing also confirmed that accounts are locked after five failed attempts and further login attempts are blocked.

### Ownership Checks

Freelancers can only update, remove and reactivate their own gigs.

Clients can only cancel their own bookings, while freelancers can only manage bookings associated with their gigs.

Ownership is verified using authenticated user information.

### Transaction Security

Booking prices are retrieved directly from MongoDB rather than accepted from the client's request.

This prevents users from changing the amount associated with a booking.

Atomic booking status updates also prevent duplicate operations, such as processing a refund twice.

## Docker Containerisation

Docker was used to package the frontend and backend into separate containers.

The project contains:

- `api/Dockerfile` for the backend.
- `client/Dockerfile` for the frontend.
- `compose.yaml` for managing the application services.

Docker Compose manages the frontend, backend and MongoDB services in a shared environment.

This allows developers to run the application with consistent dependencies and configurations.

### Running Docker

From the project directory:

```bash
docker compose up --build -d
```

View running containers:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs -f api
```

Stop the containers:

```bash
docker compose down
```

Docker improves portability by reducing configuration differences between development environments.

## CI/CD Pipeline

GitHub Actions was configured to automate code validation, testing and builds.

The workflow is stored in `.github/workflows/ci.yml`.

### Backend Workflow

The backend workflow is configured to:

- Install Node.js dependencies.
- Run ESLint checks.
- Execute backend unit tests.
- Validate backend JavaScript syntax.

### Frontend Workflow

The frontend workflow is configured to:

- Install frontend dependencies.
- Execute ESLint checks.
- Run automated React tests using Vitest.
- Build the production frontend.
- Upload the frontend build artefact.

The workflow is designed to fail when tests or configured validation checks do not pass.

### Pipeline Status

GitHub Actions execution is currently affected by a GitHub account billing restriction.

The workflow jobs have been prevented from starting, rather than failing because of application code.

Local testing has been performed while the restriction is being resolved. Automated Newman API tests, security scans and Docker build verification still need to be incorporated into the final CI/CD process.

## Static Code Analysis

Static code analysis was introduced using ESLint to identify coding issues and improve code quality.

ESLint is used for both the frontend and backend.

It helps identify potential programming mistakes, inconsistent code practices and maintainability issues before code is merged.

### Running Code Analysis

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

Code analysis forms part of the development workflow and supports identifying issues before deployment.

ESLint is used for code-quality analysis and does not replace dedicated security vulnerability scanning.

## Logging and Monitoring

Structured logging was implemented using Pino and pino-http.

The logging system records important application events to assist with troubleshooting, security monitoring and identifying unusual behaviour.

### Recorded Events

- Successful and failed login attempts.
- Account lockout events.
- Rate-limit violations.
- Booking activity.
- Transaction activity.
- Application errors.
- API request and response information.

Logs include event names, response statuses and request identifiers to make it easier to investigate system behaviour.

### Cloud Logging

The backend includes optional Axiom integration for cloud-based logging and monitoring.

When configured with valid credentials, logs can be forwarded to an external platform for monitoring and investigation.

Cloud logging allows important system events to be reviewed independently of the local development terminal.

## Final Security Review

HustleHub+ implements multiple security measures to protect user accounts, marketplace operations and financial records.

| Threat | Implemented Protection |
|---|---|
| Brute-force attacks | Account lockout and rate limiting |
| Password exposure | bcrypt password hashing |
| Unauthorised API access | JWT authentication |
| Privilege escalation | Role-based access control |
| Injection attacks | Input validation and sanitisation |
| Cross-site scripting | Sanitisation, React output escaping and Helmet CSP |
| Sensitive error exposure | Controlled error handling |
| Unauthorised data modification | Ownership validation |
| Transaction manipulation | Server-controlled prices and atomic updates |
| Suspicious activity | Structured security logging |

### Security Evaluation

The application follows a layered approach to security.

Authentication protects user accounts, while authorisation restricts access according to user roles.

Input validation and sanitisation reduce risks associated with malicious requests.

Additional authentication protections, including password reset and temporary account lockout, improve account security.

The logging system provides visibility into authentication failures, request errors and other important application events.

Further production security work includes verifying cloud monitoring, performing dedicated vulnerability scans, testing concurrent authentication requests and reviewing the deployment configuration.

## Setting Up

### Database

The API uses MongoDB to store application data.

1. Install MongoDB Community Server.
2. Configure `MONGODB_URI` in the `.env` file.
3. Start the MongoDB service.

The default local connection string is:

`mongodb://127.0.0.1:27017/hustlehub`

Collections are created automatically when data is stored.

### Backend Setup

Navigate to the API directory:

```bash
cd hustlehub-plus/api
npm install
```

Create a `.env` file based on `.env.example`.

Generate local SSL certificates:

```bash
npm run certs
```

Start the backend:

```bash
npm run dev
```

The API runs at:

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
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Gigs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/gigs` | Browse gigs |
| GET | `/api/gigs/:id` | View gig details |
| GET | `/api/gigs/mygigs` | View own gigs |
| POST | `/api/gigs` | Create gig |
| PUT | `/api/gigs/:id` | Update gig |
| DELETE | `/api/gigs/:id` | Remove gig |
| PATCH | `/api/gigs/:id/restore` | Restore gig |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/mybookings` | View own bookings |
| GET | `/api/bookings/:id` | View booking details |
| PATCH | `/api/bookings/:id/accept` | Accept booking |
| PATCH | `/api/bookings/:id/complete` | Complete booking |
| PATCH | `/api/bookings/:id/decline` | Decline booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

### Finance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/finance/income` | View freelancer income |
| GET | `/api/finance/transactions` | View transaction history |

## Automated Testing

### Backend Unit Tests

The backend uses Node.js's built-in testing framework.

Run:

```bash
cd api
npm test
```

The latest test execution produced the following results:

| Category | Tests Passed |
|---|---:|
| Account lockout | 4 |
| Password-reset tokens | 4 |
| Tax calculations | 7 |
| **Total** | **15** |

**Result: 15 passed, 0 failed.**

### Frontend Testing

The frontend uses Vitest and React Testing Library.

Run:

```bash
cd client
npm test
```

Automated frontend tests support verifying component rendering and application interactions.

### API Security Testing — Postman and Newman

Postman and Newman are used to test authentication, authorisation, role restrictions, validation and marketplace functionality.

The automated collection covers:

- Registration and login.
- JWT authentication.
- Gig creation and management.
- Role-based access control.
- Booking creation and status changes.
- Ownership restrictions.
- Invalid inputs and unauthorised requests.
- HTML sanitisation.
- Transaction-related operations.

### Configuring Newman

Create a local `newman.local.json` file in the API directory containing the admin credentials required by the tests.

Keep this file excluded from Git.

Run:

```bash
npm run test:api -- --environment newman.local.json
```

The local testing configuration supports the self-signed HTTPS development certificate.

### Recorded API Test Results

| Metric | Result |
|---|---:|
| Requests executed | 38 |
| Test scripts executed | 38 |
| Assertions executed | 81 |
| Failed requests | 0 |
| Failed assertions | 0 |

**Overall result: PASS**

These results were recorded during previous API testing. The collection should also be run against the final merged application.

## Conclusion

HustleHub+ was developed as a secure freelance marketplace supporting clients, freelancers and administrators.

The system includes authentication, gig management, booking management, transaction recording, income tracking and estimated tax calculations.

The final development phase added Docker containerisation, additional authentication security, structured logging, static code analysis and CI/CD configuration.

These improvements support the application's security, maintainability and deployment readiness.
