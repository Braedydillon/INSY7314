import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import {getUserByEmail, createUser} from '../store/users.js';

function createToken(user){
    return jwt.sign(
        {
            id: user.id,
        },
        config.JWT_SECRET,
        {
            expiresIn: config.JWT_EXPIRES_IN || '1h'
        }
    );
}

export async function register(req, res){

    const {email, password } = req.body;

    const existingUser = getUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser(email, passwordHash);

    res.status(201).json({message: 'User created successfully', user: { id: user.id, email: user.email }});
       
}

export async function login (req, res){

    const {email, password} = req.body;

    const user = getUserByEmail(email);

    if(!user){

        return res.status(401).json({error: 'Invalid email or password'});
    }

    const passwordMatch = await bcrypt.compare(password,user.passwordHash);

    if(!passwordMatch){

        return res.status(401).json({error: 'Invalid email or password'});
    }

    const token = createToken(user);

    return res.status(200).json({message: 'Login successful',token})

}
