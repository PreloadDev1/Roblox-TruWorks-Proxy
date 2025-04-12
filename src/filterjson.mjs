async function getThumbnail(id, type = "Asset") {
    const endpoint = type === "Asset"
        ? `https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=420x420&format=Png&isCircular=false`
        : `https://thumbnails.roblox.com/v1/game-passes?gamePassIds=${id}&size=150x150&format=Png&isCircular=false`;

    try {
        const response = await fetch(endpoint);
        const json = await response.json();
        return json?.data?.[0]?.imageUrl || null;
    } catch (err) {
        console.error("Thumbnail fetch failed:", err);
        return null;
    }
}

export default async function filterJSON(parameters) {
    let results = [];
    let cursor = "";

    try {
        do {
            const response = await fetch(parameters.url + `&cursor=${cursor}`);
            if (!response.ok) break;

            const body = await response.json();
            for (const row of body.data) {
                const filtered = await parameters.filter(row);
                if (filtered) results.push(filtered);
            }

            cursor = parameters.exhaust && body.nextPageCursor ? body.nextPageCursor : null;
        } while (cursor);
    } catch (error) {
        console.log("filterJSON error:", error);
    }

    return results;
}

export async function getMarketInfo(item) {
    return {
        ID: item.id,
        Name: item.name,
        Price: item.price,
        CreatorType: item.creatorType || "Unknown",
        CreatorID: item.creatorTargetId || null,
        Thumbnail: await getThumbnail(item.id, "Asset"),
    };
}

export async function getIdentificationInfo(item) {
    return {
        ID: item.id,
        Name: item.name,
        Thumbnail: await getThumbnail(item.id, "Asset"),
    };
}
