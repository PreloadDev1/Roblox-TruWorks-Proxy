export function ToPascalCase(Key) {
	return Key.replace(/(^\w|_\w)/g, (m) => m.replace(/_/, '').toUpperCase())
		.replace(/Id$/, "ID")
		.replace(/Url$/, "URL");
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
