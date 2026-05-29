import {
  createMultiParser,
  createParser,
  type MultiParserBuilder,
  type SingleParserBuilder,
} from "nuqs";
import type { z } from "zod";

// Cada forma de schema usa um encoding fixo na URL:
//   primitive                      -> ?key=value
//   array de primitives            -> ?key=valor1&key=valor2
//   object de primitives           -> ?key=campo1:valor1,campo2:valor2
//   array de object de primitives  -> ?key=...&key=...

type PrimitiveValue = string | number | boolean;
type PrimitiveObject = Record<string, PrimitiveValue>;

interface ZodDefinition {
  element?: { _zod: { def: ZodDefinition } };
  innerType?: { _zod: { def: ZodDefinition } };
  shape?: Record<string, { _zod: { def: ZodDefinition } }>;
  type: string;
}

function getZodDefinition(schema: unknown): ZodDefinition {
  return (schema as { _zod: { def: ZodDefinition } })._zod.def;
}

// Desembrulha optional / nullable / default para alcançar o tipo primitivo interno
function getPrimitiveType(schema: unknown): string {
  let definition = getZodDefinition(schema);
  while (
    (definition.type === "optional" ||
      definition.type === "nullable" ||
      definition.type === "default") &&
    definition.innerType
  ) {
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
    .filter(
      ([, fieldValue]) =>
        fieldValue !== undefined && fieldValue !== null && fieldValue !== ""
    )
    .map(
      ([fieldKey, fieldValue]) =>
        `${fieldKey}:${encodeURIComponent(String(fieldValue))}`
    )
    .join(",");
}

function parseObjectFields(
  rawString: string,
  objectShape: Record<string, { _zod: { def: ZodDefinition } }>
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

function deepEqual<Value>(current: Value, next: Value): boolean {
  return JSON.stringify(current) === JSON.stringify(next);
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
      const objectShape = itemDefinition.shape ?? {};
      return createMultiParser<PrimitiveObject[]>({
        parse: (rawValues) => {
          const decodedItems = rawValues
            .map((rawItem) => parseObjectFields(rawItem, objectShape))
            .filter((item): item is PrimitiveObject => item !== null);
          if (!schema.safeParse(decodedItems).success) return null;
          return decodedItems.length ? decodedItems : null;
        },
        serialize: (objectArray) =>
          objectArray.map(serializeObjectFields).filter(Boolean),
        eq: deepEqual,
      });
    }

    const itemPrimitiveType = itemDefinition.type;
    return createMultiParser<PrimitiveValue[]>({
      parse: (rawValues) => {
        const decodedItems = rawValues
          .map((rawItem) => parsePrimitive(rawItem, itemPrimitiveType))
          .filter((item): item is PrimitiveValue => item !== null);
        if (!schema.safeParse(decodedItems).success) return null;
        return decodedItems.length ? decodedItems : null;
      },
      serialize: (primitiveArray) => primitiveArray.map(String),
      eq: (currentArray, nextArray) =>
        currentArray.length === nextArray.length &&
        currentArray.every((value, index) => value === nextArray[index]),
    });
  }

  if (definition.type === "object") {
    const objectShape = definition.shape ?? {};
    return createParser<PrimitiveObject>({
      parse: (rawString) => {
        const parsedObject = parseObjectFields(rawString, objectShape);
        if (!parsedObject) return null;
        return schema.safeParse(parsedObject).success ? parsedObject : null;
      },
      serialize: serializeObjectFields,
      eq: deepEqual,
    });
  }

  const primitiveType = definition.type;
  return createParser<PrimitiveValue>({
    parse: (rawString) => {
      const parsedValue = parsePrimitive(rawString, primitiveType);
      if (parsedValue === null) return null;
      return schema.safeParse(parsedValue).success ? parsedValue : null;
    },
    serialize: (primitiveValue) => String(primitiveValue),
    eq: Object.is,
  });
}
