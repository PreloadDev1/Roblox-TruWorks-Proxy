export function ToPascalCaseObject(ObjectValue) {
	if (Array.isArray(ObjectValue)) {
		return ObjectValue.map(ToPascalCaseObject);
	}

	if (typeof ObjectValue === "object" && ObjectValue !== null) {
		const Output = {};

		for (const [Key, Value] of Object.entries(ObjectValue)) {
			let Pascal = Key.replace(/(^|_)(\w)/g, (_, __, Character) => Character.toUpperCase());

			Pascal = Pascal
				.replace(/Id$/, "ID")
				.replace(/Url$/, "URL");

			Output[Pascal] = ToPascalCaseObject(Value);
		}

		return Output;
	}

	return ObjectValue;
}
