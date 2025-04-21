export default async function GetAllPages(BaseURL, FilterFunction) {
  const Results = []
  let Cursor = ""
  let HasMore = true

  while (HasMore) {
    const Response = await fetch(`${BaseURL}${Cursor ? `&cursor=${Cursor}` : ""}`)
    if (!Response.ok) break

    const Body = await Response.json()
    if (!Array.isArray(Body.data)) break

    for (const Item of Body.data) {
      const Entry = await FilterFunction(Item)
      if (Entry) Results.push(Entry)
    }

    Cursor = Body.nextPageCursor
    HasMore = !!Cursor
  }

  return Results
}
