// Create hashtable to store users by email
const userByEmail = new Map();
// Create hashtable to store users by id
const userById = new Map();
// Set the next user id to 1 otherwise it would start at 0
let nextUserId = 1;

// Store user in the hashtables by email and id
export function createUser(email, passwordHash) {
    const user = {
        id: String(nextUserId++),
        email: email.toLowerCase(),
        passwordHash,
    };
    userByEmail.set(user.email, user);
    userById.set(user.id, user);
    return user;
}

// Retrieve user from hashtable by email
export function getUserByEmail(email) {
    return userByEmail.get(email.toLowerCase());
}

// Retrieve user from hashtable by id
export function getUserById(id) {
    return userById.get(String(id));
}
