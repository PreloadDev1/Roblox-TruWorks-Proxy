export async function GetAllPages(BaseURL, FilterFunction) {
	const Results = [];
	let Cursor = "";
	let HasMore = true;

	while (HasMore) {
		const URL = `${BaseURL}${Cursor ? `&cursor=${Cursor}` : ""}`;
		const Response = await fetch(URL);

		if (!Response.ok) {
			console.warn("[GetAllPages] Failed to fetch:", URL, Response.status);
			break;
		}

		const Data = await Response.json();
		const Entries = Array.isArray(Data.data) ? Data.data : [];

		for (const Entry of Entries) {
			const Result = await FilterFunction(Entry);
			if (Result) Results.push(Result);
		}

		Cursor = Data.nextPageCursor;
		HasMore = !!Cursor;
	}

	return Results;
}
