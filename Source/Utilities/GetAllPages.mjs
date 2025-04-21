export default async function GetAllPages(baseUrl, mapper) {
  const results = []
  let cursor = ""

  while (true) {
    const url = cursor ? `${baseUrl}&cursor=${cursor}` : baseUrl
    const res = await fetch(url)
    if (!res.ok) break

    const json = await res.json()
    if (!Array.isArray(json.data)) break

    results.push(
      ...json.data
        .map(mapper)
        .filter(item => item != null)
    )

    if (!json.nextPageCursor) break
    cursor = json.nextPageCursor
  }

  return results
}
