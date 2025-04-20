import Express from "express";
import CORS from "cors";

import AvatarRoutes from "./routes/avatar.mjs";
import ProfileRoutes from "./routes/profile.mjs";
import DevProductsRoutes from "./routes/devproducts.mjs";
import FollowersRoutes from "./routes/followers.mjs";
import FriendsRoutes from "./routes/friends.mjs";
import BadgesRoutes from "./routes/badges.mjs";
import SocialsRoutes from "./routes/socials.mjs";
import GroupRoutes from "./routes/group.mjs";
import GameRoutes from "./routes/game.mjs";
import AppRoutes from "./routes/app.mjs";

const App = Express();
const Port = process.env.PORT || 3000;

App.use(CORS());

App.use("/devproducts", DevProductsRoutes);
App.use("/followers", FollowersRoutes);
App.use("/friends", FriendsRoutes);
App.use("/badges", BadgesRoutes);
App.use("/profile/:userId/socials", SocialsRoutes);
App.use("/group", GroupRoutes);
App.use("/game", GameRoutes);
App.use("/", AppRoutes);

App.listen(Port, () => {
	console.log(`[TruProxy] Proxy server is live on port ${Port}`);
});
