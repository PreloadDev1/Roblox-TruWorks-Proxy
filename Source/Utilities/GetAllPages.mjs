export async function GetAllPages(BaseURL, FilterFunction) {
	const Results = []
	let Cursor = ""
	let HasMore = true

	while (HasMore) {
		const URL = `${BaseURL}${Cursor ? `&cursor=${Cursor}` : ""}`
		const Response = await fetch(URL)

		if (!Response.ok) break

		const Data = await Response.json()
		if (!Array.isArray(Data.data)) break

		for (const Entry of Data.data) {
			const Result = await FilterFunction(Entry)
			if (Result) Results.push(Result)
		}

		Cursor = Data.nextPageCursor
		HasMore = !!Cursor
	}

	return Results
}
