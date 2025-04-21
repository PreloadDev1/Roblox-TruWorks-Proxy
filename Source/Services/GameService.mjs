import FilterJSON from "../Utilities/FilterJson.mjs";
import { GetThumbnail } from "./ThumbnailService.mjs";
import Profile from "./ProfileService.mjs";
import { ToPascalCaseObject } from "../Utilities/ToPascal.mjs";

const Games = {};

const CreatorTypes = {
	User: "Users",
	Group: "Groups"
};

function ParseDate(DateString) {
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

Games.Get = async function (CreatorID, CreatorType) {
	const URI = CreatorType === CreatorTypes.User ? "users" : "groups";

	const BaseGames = await FilterJSON({
		URL: `https://games.roblox.com/v2/${URI}/${CreatorID}/games?accessFilter=2&limit=50&sortOrder=Asc`,
		Exhaust: true,
		Filter: (Game) => ({
			UniverseID: Game.id,
			PlaceID: Game.rootPlace?.id
		})
	});

	const FinalGames = [];

	for (const Entry of BaseGames) {
		const PlaceID = Entry.PlaceID;

		try {
			const UniverseRes = await fetch(`https://apis.roblox.com/universes/v1/places/${PlaceID}/universe`);
			if (!UniverseRes.ok) continue;

			const { universeId } = await UniverseRes.json();

			const GameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
			if (!GameRes.ok) continue;

			const GameData = await GameRes.json();
			const Game = GameData?.data?.[0];
			if (!Game) continue;

			let CreatorInfo = {
				ID: Game.creator.id,
				Username: Game.creator.name,
				DisplayName: null,
				IsVerified: false,
				Created: null,
				Description: null,
				IsBanned: false
			};

			if (Game.creator?.type === "User" && Game.creator?.id) {
				try {
					CreatorInfo = await Profile.GetBasicInfo(Game.creator.id);
				} catch {}
			}

			const FormattedGame = {
				AllowedGearCategories: Game.allowedGearCategories || [],
				AllowedGearGenres: Game.allowedGearGenres || [],
				CopyingAllowed: Game.copyingAllowed,
				CreateVipServersAllowed: Game.createVipServersAllowed,
				Created: ParseDate(Game.created),
				Updated: ParseDate(Game.updated),
				Creator: CreatorInfo,
				Favourites: Game.favoritedCount || 0,
				Genre1: Game.genre,
				Genre2: Game.genre_L1 || "",
				Genre3: Game.genre_L2 || "",
				UniverseID: Game.id,
				PlaceID: Game.rootPlaceId,
				IsAllGenre: Game.isAllGenre,
				IsGenreEnforced: Game.isGenreEnforced,
				ServerSize: Game.maxPlayers,
				Name: Game.name,
				ActivePlayers: Game.playing,
				Description: Game.sourceDescription || "",
				SourcedName: Game.sourceName || "",
				StudioAccessToAPI: Game.studioAccessToApisAllowed,
				AvatarType: Game.universeAvatarType,
				Visits: Game.visits,
				UpVotes: Game.upVotes,
				DownVotes: Game.downVotes,
				Thumbnail: await GetThumbnail(Game.id, "GameIcon")
			};

			FinalGames.push(ToPascalCaseObject(FormattedGame));
		} catch {}
	}

	return FinalGames;
};

Games.GetPasses = async function (UniverseID, CreatorType, CreatorID) {
	return await FilterJSON({
		URL: `https://games.roblox.com/v1/games/${UniverseID}/game-passes?limit=100&sortOrder=Asc`,
		Exhaust: true,
		Filter: async (Pass) =>
			ToPascalCaseObject({
				ID: Pass.id,
				Name: Pass.name,
				Price: Pass.price,
				Thumbnail: Pass.thumbnail?.imageUrl || (await GetThumbnail(Pass.id, "Asset")),
				CreatorType,
				CreatorID
			})
	});
};

Games.GetDevProducts = async function (UniverseID, CreatorType, CreatorID) {
	return await FilterJSON({
		URL: `https://games.roblox.com/v1/games/${UniverseID}/developer-products?limit=50`,
		Exhaust: true,
		Filter: async (Product) =>
			ToPascalCaseObject({
				ID: Product.id,
				Name: Product.name,
				Price: Product.priceInRobux,
				CreatorType,
				CreatorID,
				Thumbnail: await GetThumbnail(Product.id, "Asset")
			})
	});
};

export default Games;
export { CreatorTypes };
