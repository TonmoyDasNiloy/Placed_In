import express from "express";
import authRoute from "./authRoutes.js";
import userRoute from "./userRoutes.js";
import postRoute from "./postRoutes.js";
import messageRoutes from "./messageRoutes.js";

const router = express.Router();

router.use(`/auth`, authRoute); 
router.use(`/users`, userRoute);
router.use(`/posts`, postRoute);
router.use("/messages", messageRoutes);

export default router;
