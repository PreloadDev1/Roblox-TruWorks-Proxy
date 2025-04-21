export function ToPascalCase(Key) {
	return Key.replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_, __, chr) => chr.toUpperCase())
		.replace(/Id\b/g, "ID")
		.replace(/Url\b/g, "URL");
}

export function ToPascalCaseObject(Object) {
	if (!Object || typeof Object !== "object") return Object;

	const Output = {};
	for (const [Key, Value] of Object.entries(Object)) {
		const PascalKey = ToPascalCase(Key);
		Output[PascalKey] = typeof Value === "object" && !Array.isArray(Value)
			? ToPascalCaseObject(Value)
			: Value;
	}
	return Output;
}
