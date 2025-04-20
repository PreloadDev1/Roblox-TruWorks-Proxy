export default async function filterJSON({ url, filter, exhaust }) {
	const results = [];
	let cursor = "";
	let done = false;

	while (!done) {
		const res = await fetch(`${url}&cursor=${cursor}`);
		if (!res.ok) break;

		const body = await res.json();
		if (!Array.isArray(body.data)) break;

		for (const row of body.data) {
			const result = await filter(row);
			if (result) results.push(result);
		}

		if (exhaust && body.nextPageCursor) {
			cursor = body.nextPageCursor;
		} else {
			done = true;
		}
	}

	return results;
}

export function getMarketInfo(creatorType, creatorId) {
	return function (item) {
		return {
			ID: item.id,
			Name: item.name,
			Price: item.price,
			CreatorType: creatorType,
			CreatorID: creatorId,
			Thumbnail: item.thumbnail?.imageUrl || null,
		};
	};
}

export function getIdentificationInfo(item) {
	return {
		ID: item.id,
		Name: item.name,
		Thumbnail: item.thumbnail?.imageUrl || null,
	};
}
