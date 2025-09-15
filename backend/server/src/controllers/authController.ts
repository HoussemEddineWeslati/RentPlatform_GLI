import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { storage } from "../database/storage.js";
import { insertUserSchema, loginSchema } from "../database/schema.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);

    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });

    req.session.userId = user.id;

    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ message: "Invalid user data" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    req.session.userId = user.id;

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ message: "Invalid credentials" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
};

export const getUser = async (req: Request, res: Response) => {
  try {
    if (!req.session?.userId) {
      // Guest — return null rather than 401 so frontend can detect guest cleanly
      return res.json(null);
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
