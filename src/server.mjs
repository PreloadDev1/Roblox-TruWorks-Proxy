import express from "express";
import cors from "cors";

// ✅ Routers
import avatarRoutes from "./routes/avatar.mjs";
import gamesRoutes from "./routes/games.mjs";
import groupsRoutes from "./routes/groups.mjs";
import profileRoutes from "./routes/profile.mjs";
import devProductsRoutes from "./routes/devproducts.mjs";
import followersRoutes from "./routes/followers.mjs";
import friendsRoutes from "./routes/friends.mjs";
import badgesRoutes from "./routes/badges.mjs";
import socialsRoutes from "./routes/socials.mjs";
import thumbnailsRoutes from "./routes/thumbnails.mjs";
import groupRoutes from "./routes/group.mjs";
import appRoutes from "./routes/app.mjs";

// ✅ NEW ROUTES:
import groupRoutes from "./routes/group.mjs";
import gameRoutes from "./routes/game.mjs";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ Route mounts
app.use("/devproducts", devProductsRoutes);
app.use("/followers", followersRoutes);
app.use("/friends", friendsRoutes);
app.use("/badges", badgesRoutes);
app.use("/profile/:userId/socials", socialsRoutes);
app.use("/thumbnails", thumbnailsRoutes);
app.use("/group", groupRoutes);     // ✅ NEW
app.use("/game", gameRoutes);       // ✅ NEW
app.use("/group", groupRoutes);
app.use("/", appRoutes);            // ✅ general tools like /assets, /avatar, /games, /groups

app.listen(port, () => {
	console.log(`[TruProxy] Proxy server is live on port ${port}`);
});
