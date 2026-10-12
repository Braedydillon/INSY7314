# Hustle Hub

Hustle Hub is a secure freelance marketplace platform. The purpose of this platform is to allow freelancers to advertise services and clients to browse and book those services.

In this repository, Part 1 an API used to support user registration and login, built with security as the focus. Part 2 expands this into the full marketplace described below.

## Youtube Video Link

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
- **Authentication:** JSON Web Tokens
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **Security middleware:** Helmet, express-rate-limit, sanitize-html
- **TLS/SSL:** node-forge
- **Frontend:** React and Vite
- **Testing:** Postman and Newman (API), Vitest and React Testing Library (frontend)
- **Development tools:** nodemon

## Frontend

The frontend used in this application provides a view for the clients, freelancers and administrators.React and Vite have been used to develop the frontend which communicates with the Node.js and Express backend through REST API requests.

### Frontend Features

#### Authentication

The frontend allows users to register and log in using their email address and password. The frontend communicates with the backend authentication API and uses JWT authentication for protected requests.

#### Client Features

- Can browse the current services that are available.
- Can view descriptions of the gig and pricing packages.
- Can book services offered by freelancers once they log in.
- View their transactions.
- Manage their own profile information.

#### Freelancer Features

- Create and manage service listings.
- Change their gigs' information.
- See when clients request services and bookings.
- Manage the bookings.
- View income information.
- Manage profile information.

#### Administration Features

The frontend has an administration dashboard intended for viewing and managing platform information. Administration functionality depends on the corresponding protected backend endpoints.

## Marketplace Features

### Gigs and Pricing Tiers

Freelancers list their services as gigs. Each gig has a title, a category, a description, and between one and three pricing tiers. Each tier has its own title, short description and price, so a freelancer can charge more depending on the level of work the client wants.

- Prices are stored as whole numbers of cents (ZAR) to avoid rounding errors. A tier can cost between R30 and R50 000.
- Categories: music, coding, writing, marketing, tutoring, photography, art, design, videography and other.
- Anyone, including visitors who are not logged in, can browse active gigs and view a gig's details. Gigs can be searched by title and filtered by category.
- Deleting a gig is a soft delete, the gig is marked as removed and hidden from browsing, so existing bookings still point at a valid gig. The freelancer can reactivate a removed gig later.

### Booking Lifecycle

A client books one tier of a gig. When the booking is created, the tier's title and price are copied onto the booking, so later changes to the gig do not change what the client agreed to pay. Payment is simulated, and every booking creates a payment transaction.

| Event       | Who can do it        | From status              | To status   | Transaction written |
| ----------- | -------------------- | ------------------------ | ----------- | ------------------- |
| Book a tier | Any client           | None                     | `pending`   | Payment             |
| Accept      | The gig's freelancer | `pending`                | `confirmed` | None                |
| Complete    | The gig's freelancer | `confirmed`              | `completed` | None                |
| Decline     | The gig's freelancer | `pending`                | `declined`  | Refund              |
| Cancel      | The booking's client | `pending` or `confirmed` | `cancelled` | Refund              |

Any other change, such as accepting a cancelled booking or cancelling twice, is rejected with a 409.

### Transactions and Refunds

Transactions are append only. A refund is recorded as a second transaction on the same booking with a negative amount, so the original payment is never edited and each refund keeps its own date. A booking can have at most one payment and one refund, which is enforced by a unique database index.

### Income

Freelancers see two figures on their income page:

- **Income:** the total of their completed bookings.
- **Projected income:** the total of their pending and confirmed bookings.

Declined and cancelled bookings count towards neither, because they were refunded. Income is calculated from the bookings each time it is requested rather than stored, so it cannot fall out of step with the data.

## Security Decisions

**Password Hashing (bcrypt):** The password is hashed on registration with bcrypt before it reaches storage, and on login the submitted password is compared against the stored hash with `bcrypt.compare`. This ensures that even if the users were exposed, the passwords cannot be recovered directly.

**Token-based authentication:** On a successful login, the server assigns a JWT containing the user's ID. This lets the server know who is making requests. The client presents a token; the server then verifies its signature and expiry and trusts the payload. The token is signed with a secret loaded from the environment and expires after a configured period.

**Input validation:** All registration and login fields are validated before they reach the business logic to ensure that the specific field requirements are being met. Any that do not meet the correct formatting are rejected before they can reach a controller or the data layer; this helps ensure that injection attacks are prevented.

**HTTPS:** The server is served over HTTPS by default, using a locally generated self-signed certificate. Without HTTPS, tokens and credentials are sent over the network in plain text to anyone in a position to intercept the traffic. HTTPS can be disabled through `USE_HTTPS=false` for convenience, but is enabled by default on purpose.

**Controlled error handling**

**Ownership checks:** Freelancers can only update, remove or reactivate their own gigs, and can only accept, decline or complete bookings on their own gigs. Clients can only cancel their own bookings. The owner of a gig and the client on a booking are always taken from the logged-in user's token, never from the request body.

**Prices come from the database:** When a client books a tier, the price is read from the gig in the database. Any price, status or owner sent in the request body is ignored, so a client cannot change what they pay or confirm their own booking.

**Hiding other users' records:** Requesting a booking that belongs to someone else returns 404, the same as a booking that does not exist, so the API does not confirm that the record exists.

**Atomic status changes:** A booking's status is checked and changed in a single database operation. If two requests arrive at the same moment, for example a double click on Decline, only one succeeds, so a booking can never be refunded twice.

## Setting Up

### Setting up the Database

The API stores its data in MongoDB.

1. Install MongoDB Community Server. MongoDB Compass is optional but useful for viewing the data.
2. Set `MONGODB_URI` in the `.env` file. The default is `mongodb://127.0.0.1:27017/hustlehub`.
3. The database and its collections are created automatically the first time data is saved.

To clear all data and start again, run `npm run db:rst` from `hustlehub-plus/api`.

### Setting up the API

When setting up this project, you will have to run a series of commands in the API directory:

1. `cd hustlehub-plus/api`
2. `npm install`
3. Create a new `.env` file using `.env.example`
4. `npm run certs`
5. `npm run dev`

The API runs at `https://localhost:5000`.

The authentication base path is `/api/auth`:

| Method | Path        | Description              |
| ------ | ----------- | ------------------------ |
| POST   | `/register` | Register a new user      |
| POST   | `/login`    | Log in and receive a JWT |

### Marketplace API Endpoints

All paths start with `/api`.

**Gigs**

| Method | Path                | Who                         | Description                                                                            |
| ------ | ------------------- | --------------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/gigs`             | Anyone                      | Browse active gigs; optional `q` (title search) and `category` filters                 |
| GET    | `/gigs/:id`         | Anyone                      | View an active gig with its tiers and the freelancer's display name and contact method |
| GET    | `/gigs/mygigs`      | Freelancer                  | List own gigs, including removed ones                                                  |
| POST   | `/gigs`             | Freelancer                  | Create a gig with one to three tiers                                                   |
| PUT    | `/gigs/:id`         | Freelancer (owner)          | Update a gig and its tiers                                                             |
| DELETE | `/gigs/:id`         | Freelancer (owner) or admin | Remove a gig (soft delete)                                                             |
| PATCH  | `/gigs/:id/restore` | Freelancer (owner)          | Reactivate a removed gig                                                               |

**Bookings**

| Method | Path                     | Who                                      | Description                                                                              |
| ------ | ------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| POST   | `/bookings`              | Client                                   | Book a tier: send `gigId` and `tierId`. Creates the booking and its payment transaction. |
| GET    | `/bookings/mybookings`   | Client or freelancer                     | Clients see bookings they made; freelancers see bookings on their gigs                   |
| GET    | `/bookings/:id`          | Booking's client or freelancer, or admin | View one booking                                                                         |
| PATCH  | `/bookings/:id/accept`   | Gig's freelancer                         | Accept a pending booking                                                                 |
| PATCH  | `/bookings/:id/complete` | Gig's freelancer                         | Mark a confirmed booking as completed                                                    |
| PATCH  | `/bookings/:id/decline`  | Gig's freelancer                         | Decline a pending booking and refund it                                                  |
| PATCH  | `/bookings/:id/cancel`   | Booking's client                         | Cancel a pending or confirmed booking and refund it                                      |

**Finance**

| Method | Path                    | Who                  | Description                                            |
| ------ | ----------------------- | -------------------- | ------------------------------------------------------ |
| GET    | `/finance/income`       | Freelancer           | Income, projected income, and totals by booking status |
| GET    | `/finance/transactions` | Client or freelancer | The user's payment and refund history                  |

### Setting up the Front End

1. `cd hustlehub-plus/client`
2. `npm install`
3. `npm run dev`

Once these steps are complete, the frontend runs at `http://localhost:5173`.

### Testing the Front End

1. `cd hustlehub-plus/client`
2. `npm install`
3. Run the command `npm test`

### Example 1

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!",
  "name": "Test",
  "surname": "User",
  "displayName": "Tester",
  "role": "client"
}
```

### Example 2

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!"
}
```

## Testing

```http
### Register a new user
POST https://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!",
  "name": "Test",
  "surname": "User",
  "displayName": "Tester",
  "role": "client"
}

### Register again - should be 409
POST https://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!",
  "name": "Test",
  "surname": "User",
  "displayName": "Tester",
  "role": "client"
}

### Password does not meet minimum requirements - should be 400
POST https://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "weakpass"
}

### Missing password - should be 400
POST https://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "nopassword@email.com"
}

### Missing email - should be 400
POST https://localhost:5000/api/auth/register
Content-Type: application/json

{
  "password": "NoEmailIncluded123!"
}

### Bad route - should be 404
GET https://localhost:5000/api/auth/whereami

### Login a new user
POST https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!"
}

### Incorrect email for Login - should be 401
POST https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrongemail@email.com",
  "password": "QwertyTest123!"
}

### Incorrect password for Login - should be 401
POST https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "Wrongpassword123!"
}

### Missing email for Login - should be 400
POST https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "password": "QwertyTest123!"
}

### Missing password for Login - should be 400
POST https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrongemail@email.com"
}

### Not an email for Login - should be 400
POST https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrongemailemail.com",
  "password": "QwertyTest123!"
}
```

## API Security Testing (Postman and Newman)

The HustleHub+ backend includes an automated API security testing suite using Postman and Newman. The tests verify authentication, authorisation, role-based access control, input validation, and access restrictions across the application.

### Tests Covered

- Client and freelancer registration and login
- JWT-based authentication and protected API endpoints
- Public access to gig listings
- Role-based access control (RBAC)
- Freelancer gig creation, retrieval, and editing permissions
- Prevention of unauthorised gig creation and modification
- Client booking creation and booking access restrictions
- Booking lifecycle operations, including acceptance, completion, cancellation, and rejection
- Prevention of accessing or modifying another user's bookings
- Admin authentication and access restrictions
- User profile retrieval and updates
- Prevention of unauthorised role changes
- Invalid booking ID validation
- HTML input sanitisation
- Login rate limiting (tested separately)

### Prerequisites

- Node.js and npm
- MongoDB running and connected
- HustleHub+ backend running at `https://localhost:5000`
- A valid local admin account for the admin authentication tests

### Installation

Navigate to the backend API directory and install the dependencies:

```bash
cd hustlehub-plus/api
npm install
```

Newman and the YAML parser are included as development dependencies.

### Configuring Admin Credentials

Create a file named `newman.local.json` inside `hustlehub-plus/api`:

```json
{
  "name": "HustleHub Local",
  "values": [
    {
      "key": "adminEmail",
      "value": "YOUR_ADMIN_EMAIL",
      "enabled": true
    },
    {
      "key": "adminPassword",
      "value": "YOUR_ADMIN_PASSWORD",
      "enabled": true
    }
  ]
}
```

Replace the placeholder values with credentials for an existing admin account.

**Security:** The `newman.local.json` file contains admin credentials and must not be committed to the repository.

### Running the Security Tests

From the `hustlehub-plus/api` directory, run:

```bash
npm run test:api -- --environment newman.local.json
```

The test script runs Newman against the Postman collection using the `--insecure` option to support the local development HTTPS certificate.

### Regenerating the Postman Collection

The test collection is maintained using YAML request files and converted into a Newman-compatible JSON collection.

From the API directory, run:

```bash
node scripts/convert-postman.mjs
```

This regenerates:

```text
postman/HustleHub-Security-Tests.postman_collection.json
```

After regenerating the collection, run the automated tests again to verify the results.

### Test Results

The automated API security suite was successfully executed:

| Metric                | Result |
| --------------------- | ------ |
| Requests executed     | 38     |
| Test scripts executed | 38     |
| Assertions executed   | 81     |
| Failed requests       | 0      |
| Failed assertions     | 0      |
| Overall result        | PASS   |

The login rate-limiting test is maintained separately from the main automated collection to prevent repeated login attempts from temporarily blocking the remaining authentication tests.

Registration tests support repeated execution with existing test accounts, reducing the need for manual database resets.

### Security Considerations

- Authentication is verified using JWT bearer tokens.
- Protected endpoints reject unauthenticated requests.
- Role-based permissions restrict access to sensitive operations.
- Users are prevented from modifying resources they do not own.
- Sensitive credentials are stored in local, Git-ignored configuration files.
- Generated Newman reports may contain authentication tokens or test credentials and should not be committed to public repositories.

## Scripts

Run from `hustlehub-plus/api`:

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start server with auto-reload     |
| `npm start`        | Start server normally             |
| `npm run certs`    | Generate local SSL certificates   |
| `npm run db:rst`   | Reset the database                |
| `npm run test:api` | Run the Newman API security tests |
