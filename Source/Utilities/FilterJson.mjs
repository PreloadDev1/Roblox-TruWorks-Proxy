export default async function FilterJSON({ URL, Filter, Exhaust }) {
	const Results = [];
	let Cursor = "";
	let Done = false;

	while (!Done) {
		const Response = await fetch(`${URL}&cursor=${Cursor}`);
		if (!Response.ok) break;

		const Body = await Response.json();
		if (!Array.isArray(Body.data)) break;

		for (const Row of Body.data) {
			const Result = await Filter(Row);
			if (Result) Results.push(Result);
		}

		if (Exhaust && Body.nextPageCursor) {
			Cursor = Body.nextPageCursor;
		} else {
			Done = true;
		}
	}

	return Results;
}

export function GetMarketInfo(CreatorType, CreatorID) {
	return function (Item) {
		return {
			ID: Item.id,
			Name: Item.name,
			Price: Item.price,
			CreatorType,
			CreatorID,
			Thumbnail: Item.thumbnail?.imageUrl || null
		};
	};
}

export function GetIdentificationInfo(Item) {
	return {
		ID: Item.id,
		Name: Item.name,
		Thumbnail: Item.thumbnail?.imageUrl || null
	};
}
