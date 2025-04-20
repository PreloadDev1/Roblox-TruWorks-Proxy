// src/server.mjs
import express from "express";
import cors from "cors";

// Route Imports (ONLY actual routers!)
import avatarRoutes from "./routes/avatar.mjs"; // ❌ Still a function, remove from use()
import gamesRoutes from "./routes/games.mjs";   // ❌ Utility
import groupsRoutes from "./routes/groups.mjs"; // ❌ Utility
import profileRoutes from "./routes/profile.mjs"; // ❌ Utility
import usersRoutes from "./routes/users.mjs";   // ❌ Utility
import devProductsRoutes from "./routes/devproducts.mjs";
import followersRoutes from "./routes/followers.mjs";
import friendsRoutes from "./routes/friends.mjs";
import badgesRoutes from "./routes/badges.mjs";
import socialsRoutes from "./routes/socials.mjs";
import thumbnailsRoutes from "./routes/thumbnails.mjs";
import developerRoutes from "./routes/developer.mjs";
import appRoutes from "./routes/app.mjs"; // ✅ Proper Router

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ ONLY register route files that export an express.Router()
app.use("/devproducts", devProductsRoutes);
app.use("/followers", followersRoutes);
app.use("/friends", friendsRoutes);
app.use("/badges", badgesRoutes);
app.use("/profile/:userId/socials", socialsRoutes);
app.use("/thumbnails", thumbnailsRoutes);
app.use("/developer", developerRoutes);
app.use("/", appRoutes); // includes /assets, /games/:id, etc.

app.listen(port, () => {
  console.log(`[TruProxy] Proxy server is live on port ${port}`);
});
