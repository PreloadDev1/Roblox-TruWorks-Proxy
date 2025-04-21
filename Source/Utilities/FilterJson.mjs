export default async function FilterJSON({ URL, Filter, Exhaust }) {
	const Results = [];
	let Cursor = "";
	let Done = false;

	while (!Done) {
		const Res = await fetch(`${URL}&cursor=${Cursor}`);
		if (!Res.ok) break;

		const Body = await Res.json();
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

function ToPascalCase(Text) {
	if (typeof Text !== "string") return Text;

	return Text
		.replace(/[_-](.)/g, (_, Character) => Character.toUpperCase())
		.replace(/^(.)/, (_, Character) => Character.toUpperCase());
}

function ToPascalCaseObject(Object) {
	if (typeof Object !== "object" || Object === null || Array.isArray(Object)) {
		return Object;
	}

	const Result = {};
	for (const [Key, Value] of Object.entries(Object)) {
		const PascalKey = ToPascalCase(Key);
		Result[PascalKey] = typeof Value === "object" && Value !== null
			? Array.isArray(Value)
				? Value.map(ToPascalCaseObject)
				: ToPascalCaseObject(Value)
			: Value;
	}

	return Result;
}

export { ToPascalCase, ToPascalCaseObject };
