import express from "express";
import cors from "cors";

import appRoutes from "../routes/app.mjs";
import avatarRoutes from "../routes/avatar.mjs";
import gamesRoutes from "../routes/games.mjs";
import groupsRoutes from "../routes/groups.mjs";
import profileRoutes from "../routes/profile.mjs";
import usersRoutes from "../routes/users.mjs";
import thumbnailsRoutes from "../routes/thumbnails.mjs";
import mainRoutes from "../routes/main.mjs";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Register route modules
app.use("/", appRoutes);
app.use("/avatar", avatarRoutes);
app.use("/games", gamesRoutes);
app.use("/groups", groupsRoutes);
app.use("/profile", profileRoutes);
app.use("/users", usersRoutes);
app.use("/thumbnails", thumbnailsRoutes);
app.use("/assets", mainRoutes); // main.mjs serves /assets

// Start server
app.listen(port, () => {
  console.log(`[TruProxy] Proxy server is live on port ${port}`);
});
