import { compact, isEqual, isNil } from "lodash";
import {
  createMultiParser,
  createParser,
  type MultiParserBuilder,
  type SingleParserBuilder,
} from "nuqs";
import type { z } from "zod";

// Each schema shape uses a fixed URL encoding:
//   primitive                       -> ?key=value
//   array of primitives             -> ?key=value1&key=value2
//   object of primitives            -> ?key=field1:value1,field2:value2
//   array of object of primitives   -> ?key=...&key=...

type PrimitiveValue = string | number | boolean;
type PrimitiveObject = Record<string, PrimitiveValue>;
type ObjectShape = Record<string, ZodSchemaRef>;

interface ZodSchemaRef {
  _zod: { def: ZodDefinition };
}

interface ZodDefinition {
  element?: ZodSchemaRef;
  innerType?: ZodSchemaRef;
  shape?: ObjectShape;
  type: string;
}

const WRAPPER_TYPES = new Set(["optional", "nullable", "default"]);

function getZodDefinition(schema: unknown): ZodDefinition {
  return (schema as ZodSchemaRef)._zod.def;
}

function getPrimitiveType(schema: unknown): string {
  let definition = getZodDefinition(schema);
  while (WRAPPER_TYPES.has(definition.type) && definition.innerType) {
    definition = getZodDefinition(definition.innerType);
  }
  return definition.type;
}

function parsePrimitive(
  rawString: string,
  primitiveType: string
): PrimitiveValue | null {
  if (primitiveType === "number" || primitiveType === "int") {
    if (rawString === "") return null;
    const parsedNumber = Number(rawString);
    return Number.isFinite(parsedNumber) ? parsedNumber : null;
  }
  if (primitiveType === "boolean") {
    if (rawString === "true") return true;
    if (rawString === "false") return false;
    return null;
  }
  return rawString;
}

function serializeObjectFields(objectValue: Record<string, unknown>): string {
  return Object.entries(objectValue)
    .filter(([, fieldValue]) => !isNil(fieldValue) && fieldValue !== "")
    .map(
      ([fieldKey, fieldValue]) =>
        `${fieldKey}:${encodeURIComponent(String(fieldValue))}`
    )
    .join(",");
}

function parseObjectFields(
  rawString: string,
  objectShape: ObjectShape
): PrimitiveObject | null {
  const result: PrimitiveObject = {};
  for (const keyValuePair of rawString.split(",")) {
    const separatorIndex = keyValuePair.indexOf(":");
    if (separatorIndex === -1) continue;
    const fieldKey = keyValuePair.slice(0, separatorIndex);
    const fieldSchema = objectShape[fieldKey];
    if (!fieldSchema) continue;
    const rawFieldValue = decodeURIComponent(
      keyValuePair.slice(separatorIndex + 1)
    );
    const parsedFieldValue = parsePrimitive(
      rawFieldValue,
      getPrimitiveType(fieldSchema)
    );
    if (parsedFieldValue === null) continue;
    result[fieldKey] = parsedFieldValue;
  }
  return Object.keys(result).length ? result : null;
}

function validate(schema: z.ZodType, value: unknown): boolean {
  return schema.safeParse(value).success;
}

function buildPrimitiveParser(
  schema: z.ZodType,
  primitiveType: string
): SingleParserBuilder<PrimitiveValue> {
  return createParser<PrimitiveValue>({
    eq: Object.is,
    parse: (rawString) => {
      const parsedValue = parsePrimitive(rawString, primitiveType);
      if (parsedValue === null) return null;
      return validate(schema, parsedValue) ? parsedValue : null;
    },
    serialize: String,
  });
}

function buildObjectParser(
  schema: z.ZodType,
  objectShape: ObjectShape
): SingleParserBuilder<PrimitiveObject> {
  return createParser<PrimitiveObject>({
    eq: isEqual,
    parse: (rawString) => {
      const parsedObject = parseObjectFields(rawString, objectShape);
      if (!parsedObject) return null;
      return validate(schema, parsedObject) ? parsedObject : null;
    },
    serialize: serializeObjectFields,
  });
}

function buildPrimitiveArrayParser(
  schema: z.ZodType,
  itemPrimitiveType: string
): MultiParserBuilder<PrimitiveValue[]> {
  return createMultiParser<PrimitiveValue[]>({
    eq: isEqual,
    parse: (rawValues) => {
      const decodedItems = rawValues
        .map((rawItem) => parsePrimitive(rawItem, itemPrimitiveType))
        .filter((item): item is PrimitiveValue => item !== null);
      if (!decodedItems.length) return null;
      return validate(schema, decodedItems) ? decodedItems : null;
    },
    serialize: (primitiveArray) => primitiveArray.map(String),
  });
}

function buildObjectArrayParser(
  schema: z.ZodType,
  itemShape: ObjectShape
): MultiParserBuilder<PrimitiveObject[]> {
  return createMultiParser<PrimitiveObject[]>({
    eq: isEqual,
    parse: (rawValues) => {
      const decodedItems = rawValues
        .map((rawItem) => parseObjectFields(rawItem, itemShape))
        .filter((item): item is PrimitiveObject => item !== null);
      if (!decodedItems.length) return null;
      return validate(schema, decodedItems) ? decodedItems : null;
    },
    serialize: (objectArray) => compact(objectArray.map(serializeObjectFields)),
  });
}

export function parseAsShape<Schema extends z.ZodArray<z.ZodType>>(
  schema: Schema
): MultiParserBuilder<z.infer<Schema>>;
export function parseAsShape<Schema extends z.ZodType>(
  schema: Schema
): SingleParserBuilder<z.infer<Schema>>;
export function parseAsShape(schema: z.ZodType): unknown {
  const definition = getZodDefinition(schema);

  if (definition.type === "array" && definition.element) {
    const itemDefinition = getZodDefinition(definition.element);
    if (itemDefinition.type === "object") {
      return buildObjectArrayParser(schema, itemDefinition.shape ?? {});
    }
    return buildPrimitiveArrayParser(schema, itemDefinition.type);
  }

  if (definition.type === "object") {
    return buildObjectParser(schema, definition.shape ?? {});
  }

  return buildPrimitiveParser(schema, definition.type);
}
