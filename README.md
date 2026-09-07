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


Scripts

Command	Description

npm run dev	|Start server with auto-reload

npm start|	Start server normally

Npm run certs	|Generate local SSL certificates


