import { Request, Response } from 'express';
import bcrypt from "bcrypt";
import { storage } from "../database/storage.js";
import { insertUserSchema, loginSchema } from "../database/schema.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });

    // Create session
    (req as any).session.userId = user.id;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ message: "Invalid user data" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create session
    (req as any).session.userId = user.id;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: "Invalid credentials" });
  }
};

export const logout = (req: Request, res: Response) => {
  (req as any).session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
};

export const getUser = async (req: any, res: Response) => {
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};