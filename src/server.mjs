// src/server.mjs

import express from "express";
import cors from "cors";

// ✅ Routers
import avatarRoutes from "./routes/avatar.mjs";
import profileRoutes from "./routes/profile.mjs";
import devProductsRoutes from "./routes/devproducts.mjs";
import followersRoutes from "./routes/followers.mjs";
import friendsRoutes from "./routes/friends.mjs";
import badgesRoutes from "./routes/badges.mjs";
import socialsRoutes from "./routes/socials.mjs";
import groupRoutes from "./routes/group.mjs";      // NEW: single group
import gameRoutes from "./routes/game.mjs";        // NEW: single game
import appRoutes from "./routes/app.mjs";          // general tools like /avatar/:id, /assets/:id, etc.

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ Route mounts
app.use("/avatar", avatarRoutes);                  // optional, unless it's handled in appRoutes
app.use("/profile", profileRoutes);
app.use("/devproducts", devProductsRoutes);
app.use("/followers", followersRoutes);
app.use("/friends", friendsRoutes);
app.use("/badges", badgesRoutes);
app.use("/profile/:userId/socials", socialsRoutes);
app.use("/group", groupRoutes);                    // ✅ Single group info: /group/:id
app.use("/game", gameRoutes);                      // ✅ Single game info: /game/:id
app.use("/", appRoutes);                           // ✅ universal endpoints like /assets/:id

app.listen(port, () => {
	console.log(`[TruProxy] Proxy server is live on port ${port}`);
});
