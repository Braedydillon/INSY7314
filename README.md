Hustle Hub 

Hustle Hub is a secure freelance marketplace platform. The purpose of this platform is to allow freelancers to advertise services and clients to browse and book those services.
In this repository, we have Part 1 the secure backend foundation – an API is used to support user registration and login; this is built with security in mind.

Intended Users 

The final system will support

Clients

Freelancers 

Admins

At this stage of development, we have only added registration and login. 

Tech Stack

Runtime: Node.js

Framework: Express 5

Authentication: JSON Web Tokens

Password Hashing: bcrypt

Validation: express-validator 

TLS/SSL: node- forge

Development tools: nodemon


Frontend

The frontend used in this application provides a view for the clients, freelancers and administrators.
The frontend is designed using React and Vite and that communicates with the Node.js and Express backend through the Rest API requests.
Frontend features:
Authentication:
The frontend allows the users to register and login using there email address and password. The frontend communicates with the backend authentication API and uses JWT authentication for protected requests.

Client Features:

Can browse the currrent services that are available.
Can view descriptions of the gig and pricing packages.
They can book services offered by freelances once they login.
View the avaliablity sessions they can book and the avaliablity of freelances.
view their transactions.
Manage their own profile information.

Freelancers Features:

Create and manage service listings.
Change their gigs information.
See when clients request services and bookings.
Manage the bookings.
View income information.
Manage profile information

Administration Features:

The frontend has a administration dashboard intended for viewing and managing platform information. Administration functionality depends on the corresponding protected backend endpoints. 

Security Decisions

Password Hashing(bcrypt): The password is hashed on registration with bcrypt before it reaches storage, and on login the submitted password is compared against the stored HASH with bcrypt.compare. this ensure that even if the users were exposed the passwords can no be recovered directly. 
Token-based authentication: On a successful login, the server assigns a JWT containing the user's ID. This helps let the server know who is on the server and is making requests. The client presents a token; the server then verifies its signature and expiry and trusts the payload. The token is signed with a secret loaded from the environment and has an expiry after a configured period. 

Input validation: All registration and login fields are validated before they reach the business logic to ensure that the specific field requirements are being met. Any that do not meet the correct formatting are rejected before they can reach a controller or the data layer; this helps ensure that attacks are prevented by injection. 

HTTPS: The server is served over HTTPS by default to ensure that locally generated self signed certificate. Without HTTPS, tokens and credentials are sent over the network in plain text to anyone in a position to intercept the traffic data. HTTPS can be disabled though USE_HTTPS = false for convenience, but is enabled by default on purpose.

Controlled error handling

Setting Up 

When setting up this project, you will have to run a series of commands in the API directory:
1.	cd  api
3.	npm install 
4.	Create a new .env folder using the example env
5.	npm run certs
6.	npm run dev
The api runs at https://localhost:5000
The base path is /api/auth
Post	/register	Register a new user
Post	/login	Log in and receive a JWT

Setting up the Front end
1. cd hustlehub-plus/client
2. npm install
3. npm run dev

Once these steps are complete the frontend runs at http://localhost:5173

For testing front end 
1. cd hustlehub-plus/client
2. npm install -D vitest@^3 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
3.  Run the command "npm test"

Example 1
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!"
}


Example 2
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!"
}

Testing
### Register a new user
POST https://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!"
}

### Register again - should be 409
POST https://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "QwertyTest123!"
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
POST  https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrongemail@email.com",
  "password": "QwertyTest123!"
}


### Incorrect pasword for Login - should be 401
POST  https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "Wrongpassword123!"
}


### Missing email for Login - should be 401
POST  https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "password": "QwertyTest123!"
}


### Missing pasword for Login - should be 401
POST  https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrongemail@email.com"
}

### Not an email for Login - should be 401
POST  https://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrongemailemail.com",
  "password": "QwertyTest123!"
}


API security Testing (Postman and Newman)
The HustleHub+ backend includes an automated API security testing suite using Postman and Newman. The tests verify authentication, authorisation, role-based access control, input validation, and access restrictions across the application.


Tests covered
Client and freelancer registration and login

JWT-based authentication and protected API endpoints

Public access to gig listings

Role-based access control (RBAC)

Freelancer gig creation, retrieval, and editing permissions

Prevention of unauthorised gig creation and modification

Client booking creation and booking access restrictions

Booking lifecycle operations, including acceptance, completion, cancellation, and rejection

Prevention of accessing or modifying another user's bookings

Admin authentication and access restrictions

User profile retrieval and updates

Prevention of unauthorised role changes

Invalid booking ID validation

HTML input sanitisation

Login rate limiting (tested separately)


Prerequisites:
Node.js and npm

MongoDB running and connected

HustleHub+ backend running at https://localhost:5000

A valid local admin account for the admin authentication tests


Installation

cd hustlehub-plus/api    npm install   | Navigate to the backend API directory:
Newman and the YAML parser are included as development dependencies

Configuring Admin Credentials

Create a file named newman.local.json inside hustlehub-plus/api:
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

Replace the placeholder values with credentials for an existing admin account.
Security: The newman.local.json file 


Running the Security Tests
npm run test:api -- --environment newman.local.json | From the hustlehub-plus/api directory, run

The test script runs Newman against the Postman collection using the --insecure option to support the local development HTTPS certificate.


Regenerating the Postman Collection
The test collection is maintained using YAML request files and converted into a Newman-compatible JSON collection.


node scripts/convert-postman.mjs | From the API directory, run

This regenerates:

postman/HustleHub-Security-Tests.postman_collection.json

After regenerating the collection, run the automated tests again to verify the results.

Test Results

The automated API security suite was successfully executed:

Metric                                      Result

Requests executed                            38

Test scripts executed                        38

Assertions executed                          81

Failed requests                               0

Failed assertions                             0

Overall result                                PASS


The login rate-limiting test is maintained separately from the main automated collection to prevent repeated login attempts from temporarily blocking the remaining authentication tests.

Registration tests support repeated execution with existing test accounts, reducing the need for manual database resets.

Security Considerations:
Authentication is verified using JWT bearer tokens.

Protected endpoints reject unauthenticated requests.

Role-based permissions restrict access to sensitive operations.

Users are prevented from modifying resources they do not own.

Sensitive credentials are stored in local, Git-ignored configuration files.

Generated Newman reports may contain authentication tokens or test credentials and should not be committed to public repositories.




Scripts

Command	Description

npm run dev	|Start server with auto-reload

npm start|	Start server normally

Npm run certs	|Generate local SSL certificates


