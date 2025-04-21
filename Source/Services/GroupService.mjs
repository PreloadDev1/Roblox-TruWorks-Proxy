import FilterJSON from "../Utilities/FilterJson.mjs";
import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";
import Games, { CreatorTypes } from "./GameService.mjs";
import Users from "./UserService.mjs";

function ParseDate(DateString) {
	if (!DateString) return null;

	const Date = new globalThis.Date(DateString);

	return {
		Year: Date.getUTCFullYear(),
		Month: Date.getUTCMonth() + 1,
		Day: Date.getUTCDate(),
		Hour: Date.getUTCHours(),
		Minute: Date.getUTCMinutes(),
		Second: Date.getUTCSeconds(),
		Millisecond: Date.getUTCMilliseconds()
	};
}

const Groups = {};

Groups.Get = async function (UserID) {
	const GroupRoles = await FilterJSON({
		URL: `https://groups.roblox.com/v1/users/${UserID}/groups/roles?includeLocked=false`,
		Exhaust: false,
		Filter: async (Row) => {
			const Group = Row.group;

			if (!Group || !Row.role || Row.role.rank !== 255) return null;

			const GroupID = Group.id;

			const Res = await fetch(`https://groups.roblox.com/v1/groups/${GroupID}`);
			if (!Res.ok) return null;

			const Info = await Res.json();
			const GamesList = await Games.Get(GroupID, CreatorTypes.Group);

			const Favourites = GamesList.reduce((Sum, G) => Sum + (G.Favourites || 0), 0);
			const ActivePlayers = GamesList.reduce((Sum, G) => Sum + (G.ActivePlayers || 0), 0);

			const GamePasses = (
				await Promise.all(
					GamesList.map((Game) =>
						Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID)
					)
				)
			).flat();

			const Merch = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID);

			return ToPascalCaseObject({
				OwnerID: UserID,
				ID: GroupID,
				Name: Group.name,
				OwnerName: Info.owner?.username || null,
				Created: ParseDate(Info.created),
				Members: Info.memberCount || 0,
				Games: GamesList,
				ActivePlayers: ActivePlayers,
				Favourites: Favourites,
				GamePasses: GamePasses,
				Merch: Merch || []
			});
		}
	});

	return GroupRoles;
};

Groups.GetSingle = async function (GroupID, OwnerID = null) {
	const Res = await fetch(`https://groups.roblox.com/v1/groups/${GroupID}`);
	if (!Res.ok) return null;

	const Info = await Res.json();
	const GamesList = await Games.Get(GroupID, CreatorTypes.Group);

	const Favourites = GamesList.reduce((Sum, G) => Sum + (G.Favourites || 0), 0);
	const ActivePlayers = GamesList.reduce((Sum, G) => Sum + (G.ActivePlayers || 0), 0);

	const GamePasses = (
		await Promise.all(
			GamesList.map((Game) =>
				Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID)
			)
		)
	).flat();

	const Merch = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID);

	return ToPascalCaseObject({
		OwnerID: OwnerID,
		ID: GroupID,
		Name: Info.name,
		OwnerName: Info.owner?.username || null,
		Created: ParseDate(Info.created),
		Members: Info.memberCount || 0,
		Games: GamesList,
		ActivePlayers: ActivePlayers,
		Favourites: Favourites,
		GamePasses: GamePasses,
		Merch: Merch || []
	});
};

Groups.GetStoreAssets = async function (GroupID) {
	return await FilterJSON({
		URL: `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${GroupID}&CreatorType=2&Limit=30&SortType=3`,
		Exhaust: true,
		Filter: async (Item) =>
			ToPascalCaseObject({
				ID: Item.id,
				Name: Item.name,
				Price: Item.price,
				CreatorID: GroupID,
				CreatorType: "Groups",
				Thumbnail: Item.thumbnail?.imageUrl || null
			})
	});
};

export default Groups;
