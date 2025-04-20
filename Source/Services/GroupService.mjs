import FilterJSON from "../utils/filterjson.mjs";
import Games, { CreatorTypes } from "./games.mjs";
import Users from "./users.mjs";

function ParseDateParts(DateString) {
	if (!DateString) return null;

	const DateObj = new Date(DateString);
	return {
		Year: DateObj.getUTCFullYear(),
		Month: DateObj.getUTCMonth() + 1,
		Day: DateObj.getUTCDate(),
		Hour: DateObj.getUTCHours(),
		Minute: DateObj.getUTCMinutes(),
		Second: DateObj.getUTCSeconds(),
		Millisecond: DateObj.getUTCMilliseconds()
	};
}

const Groups = {};

Groups.Get = async function (UserID) {
	const GroupsList = await FilterJSON({
		url: `https://groups.roblox.com/v1/users/${UserID}/groups/roles?includeLocked=false`,
		exhaust: false,
		filter: async (Row) => {
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
					GamesList.map(Game => Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID))
				)
			).flat();

			const Merch = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID);

			return {
				OwnerID: UserID,
				ID: GroupID,
				Name: Group.name,
				OwnerName: Info.owner?.username || null,
				Created: ParseDateParts(Info.created),
				Members: Info.memberCount || 0,
				Games: GamesList,
				ActivePlayers,
				Favourites,
				GamePasses,
				Merch: Merch || []
			};
		}
	});

	return GroupsList;
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
			GamesList.map(Game => Games.GetPasses(Game.PlaceID, CreatorTypes.Group, GroupID))
		)
	).flat();

	const Merch = await Users.GetStoreAssets(GroupID, CreatorTypes.Group, GroupID);

	return {
		OwnerID,
		ID: GroupID,
		Name: Info.name,
		OwnerName: Info.owner?.username || null,
		Created: ParseDateParts(Info.created),
		Members: Info.memberCount || 0,
		Games: GamesList,
		ActivePlayers,
		Favourites,
		GamePasses,
		Merch: Merch || []
	};
};

Groups.GetStoreAssets = async function (GroupID) {
	const StoreAssets = await FilterJSON({
		url: `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${GroupID}&CreatorType=2&Limit=30&SortType=3`,
		exhaust: true,
		filter: async (Item) => ({
			ID: Item.id,
			Name: Item.name,
			Price: Item.price,
			CreatorID: GroupID,
			CreatorType: "Groups",
			Thumbnail: Item.thumbnail?.imageUrl || null
		})
	});

	return StoreAssets;
};

export default Groups;
