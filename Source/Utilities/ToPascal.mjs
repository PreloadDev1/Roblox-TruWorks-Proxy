function ToPascalCase(Text) {
	return Text
		.replace(/[_\-\s]+/g, " ")
		.split(" ")
		.map(Part => Part.charAt(0).toUpperCase() + Part.slice(1).toLowerCase())
		.join("");
}

function ToPascalCaseObject(Value) {
	if (Array.isArray(Value)) {
		return Value.map(ToPascalCaseObject);
	} else if (Value !== null && typeof Value === "object") {
		const Result = {};
		for (const Key in Value) {
			const PascalKey = ToPascalCase(Key);
			Result[PascalKey] = ToPascalCaseObject(Value[Key]);
		}
		return Result;
	} else {
		return Value;
	}
}

export { ToPascalCase, ToPascalCaseObject };
