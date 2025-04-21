export async function GetAllPages(BaseURL, FilterFunction) {
  const results = []
  let cursor = ""
  let hasMore = true

  while (hasMore) {
    const url = `${BaseURL}${cursor ? `&cursor=${cursor}` : ""}`
    const res = await fetch(url)
    if (!res.ok) break

    const body = await res.json()
    if (!Array.isArray(body.data)) break

    for (const entry of body.data) {
      const item = await FilterFunction(entry)
      if (item) results.push(item)
    }

    cursor = body.nextPageCursor
    hasMore = Boolean(cursor)
  }

  return results
}
