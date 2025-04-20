import express from "express";
import cors from "cors";

// Route Imports
import avatarRoutes from "./routes/avatar.mjs";
import gamesRoutes from "./routes/games.mjs";
import groupsRoutes from "./routes/groups.mjs";
import profileRoutes from "./routes/profile.mjs";
import usersRoutes from "./routes/users.mjs";
import devProductsRoutes from "./routes/devproducts.mjs";
import followersRoutes from "./routes/followers.mjs";
import friendsRoutes from "./routes/friends.mjs";
import badgesRoutes from "./routes/badges.mjs";
import socialsRoutes from "./routes/socials.mjs";
import thumbnailsRoutes from "./routes/thumbnails.mjs"; // ✅ Required for /thumbnails
import appRoutes from "./routes/app.mjs";               // ✅ Required for /assets

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Register routes
app.use("/avatar", avatarRoutes);
app.use("/games", gamesRoutes);
app.use("/groups", groupsRoutes);
app.use("/profile", profileRoutes);
app.use("/users", usersRoutes);
app.use("/devproducts", devProductsRoutes);
app.use("/followers", followersRoutes);
app.use("/friends", friendsRoutes);
app.use("/badges", badgesRoutes);
app.use("/profile/:userId/socials", socialsRoutes);
app.use("/thumbnails", thumbnailsRoutes); // ✅ Optional but useful
app.use("/assets", appRoutes);            // ✅ For GetPublicAssets endpoint

// Start server
app.listen(port, () => {
  console.log(`[TruProxy] Proxy server is live on port ${port}`);
});
