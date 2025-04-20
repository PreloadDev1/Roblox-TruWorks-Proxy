// src/server.mjs
import express from "express";
import cors from "cors";

// ✅ Route handlers from /routes
import avatarRoutes from "./routes/avatar.mjs";
import profileRoutes from "./routes/profile.mjs";
import devProductsRoutes from "./routes/devproducts.mjs";
import followersRoutes from "./routes/followers.mjs";
import friendsRoutes from "./routes/friends.mjs";
import badgesRoutes from "./routes/badges.mjs";
import socialsRoutes from "./routes/socials.mjs";
import groupRoutes from "./routes/group.mjs"; // ✅ group info (singular)
import gameRoutes from "./routes/game.mjs";   // ✅ game info (singular)
import appRoutes from "./routes/app.mjs";     // ✅ general tools (like /assets etc.)

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ Mounted routes
app.use("/devproducts", devProductsRoutes);
app.use("/followers", followersRoutes);
app.use("/friends", friendsRoutes);
app.use("/badges", badgesRoutes);
app.use("/profile/:userId/socials", socialsRoutes);
app.use("/group", groupRoutes);     // singular group info
app.use("/game", gameRoutes);       // singular game info
app.use("/", appRoutes);            // fallback & general tools

app.listen(port, () => {
	console.log(`[TruProxy] Proxy server is live on port ${port}`);
});
