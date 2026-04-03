import { Router, type IRouter, type Request, type Response } from "express";
import { User } from "../models/User";
import { signToken, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" });
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const user = new User({ name, email, password, phone, address });
  await user.save();
  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  res.status(201).json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      coins: user.coins,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await (user as any).comparePassword(password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      coins: user.coins,
      avatar: user.avatar,
      createdAt: (user as any).createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", (_req: Request, res: Response): void => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.userId;
  const user = await User.findById(userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    coins: user.coins,
    avatar: user.avatar,
    createdAt: (user as any).createdAt.toISOString(),
  });
});

export default router;
