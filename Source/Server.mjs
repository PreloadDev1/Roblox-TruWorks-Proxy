import Express from "express";
import CORS from "cors";

import AvatarRoutes from "./Connections/Avatar.mjs";
import BadgesRoutes from "./Connections/Badges.mjs";
import DevProductsRoutes from "./Connections/DevProducts.mjs";
import FollowersRoutes from "./Connections/Followers.mjs";
import FriendsRoutes from "./Connections/Friends.mjs";
import GameRoutes from "./Connections/Game.mjs";
import GroupRoutes from "./Connections/Group.mjs";
import MainRoutes from "./Connections/Main.mjs";
import ProfileRoutes from "./Connections/Profile.mjs";
import RouterRoutes from "./Connections/Router.mjs";
import SocialsRoutes from "./Connections/Socials.mjs";

const App = Express();
const Port = process.env.PORT || 3000;

App.use(CORS());

App.use("/avatar", AvatarRoutes);
App.use("/badges", BadgesRoutes);
App.use("/devproducts", DevProductsRoutes);
App.use("/followers", FollowersRoutes);
App.use("/friends", FriendsRoutes);
App.use("/game", GameRoutes);
App.use("/group", GroupRoutes);
App.use("/main", MainRoutes);
App.use("/profile", ProfileRoutes);
App.use("/router", RouterRoutes);
App.use("/socials", SocialsRoutes);

App.listen(Port, () => {
	console.log(`[TruProxy] Proxy server is live on port ${Port}`);
});
