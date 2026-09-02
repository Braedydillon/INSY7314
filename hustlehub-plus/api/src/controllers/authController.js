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
    try {
        const {email, password } = req.body;
        
        if (!email || !password ){
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = createUser(email, passwordHash);

        res.status(201).json({message: 'User created successfully', user: { id: user.id, email: user.email }});
        
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
       
}
