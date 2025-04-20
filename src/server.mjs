import express from "express";
import cors from "cors";

// Route imports (only routers)
import appRoutes from "./routes/app.mjs";
import avatarRoutes from "./routes/avatar.mjs";
import profileRoutes from "./routes/profile.mjs";
import usersRoutes from "./routes/users.mjs";
import devProductsRoutes from "./routes/devproducts.mjs";
import followersRoutes from "./routes/followers.mjs";
import friendsRoutes from "./routes/friends.mjs";
import badgesRoutes from "./routes/badges.mjs";
import socialsRoutes from "./routes/socials.mjs";
import thumbnailsRoutes from "./routes/thumbnails.mjs";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Register routes
app.use("/", appRoutes);
app.use("/profile", profileRoutes);
app.use("/users", usersRoutes);
app.use("/devproducts", devProductsRoutes);
app.use("/followers", followersRoutes);
app.use("/friends", friendsRoutes);
app.use("/badges", badgesRoutes);
app.use("/profile/:userId/socials", socialsRoutes);
app.use("/thumbnails", thumbnailsRoutes);

app.listen(port, () => {
	console.log(`[TruProxy] Proxy server is live on port ${port}`);
});
