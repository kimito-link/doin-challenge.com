/**
 * Vercel Serverless Function for OAuth
 * 
 * This handles OAuth callbacks at /api/auth/*
 */

import express from "express";
import { registerOAuthRoutes } from "../../server/_core/oauth";

const app = express();

// Enable CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

// Register OAuth routes
registerOAuthRoutes(app);

export default app;
