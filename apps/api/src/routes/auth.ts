import { Router, Request, Response } from "express";
import { signIn, signUp, signOut } from "@repo/core";

const router: Router = Router();

/**
 * @openapi
 * /auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successful sign in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 */
router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        error: "Email and password are required",
      });
    }

    // Call core service
    const { data, error } = await signIn(email, password);

    if (error) {
      return res.status(error.status).json({
        status: "error",
        error: error.message,
      });
    }

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    console.error("[AUTH] Sign in error:", err);
    return res.status(500).json({
      status: "error",
      error: "Failed to sign in",
    });
  }
});

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input or password too short
 */
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        error: "Email and password are required",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        error: "Password must be at least 6 characters long",
      });
    }

    // Call core service
    const { data, error } = await signUp(email, password);

    if (error) {
      return res.status(error.status).json({
        status: "error",
        error: error.message,
      });
    }

    return res.status(201).json({
      status: "success",
      data,
    });
  } catch (err) {
    console.error("[AUTH] Sign up error:", err);
    return res.status(500).json({
      status: "error",
      error: "Failed to sign up",
    });
  }
});

/**
 * @openapi
 * /auth/signout:
 *   post:
 *     summary: Sign out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully signed out
 *       401:
 *         description: Unauthorized
 */
router.post("/signout", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^(Bearer\s+)+/i, "");

    if (!token) {
      return res.status(401).json({
        status: "error",
        error: "Authorization token is required",
      });
    }

    // Call core service
    const { error } = await signOut(token);

    if (error) {
      return res.status(error.status).json({
        status: "error",
        error: error.message,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Successfully signed out",
    });
  } catch (err) {
    console.error("[AUTH] Sign out error:", err);
    return res.status(500).json({
      status: "error",
      error: "Failed to sign out",
    });
  }
});

export default router;
