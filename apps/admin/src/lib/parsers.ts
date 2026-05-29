import {
  createMultiParser,
  createParser,
  type MultiParserBuilder,
  type SingleParserBuilder,
} from "nuqs";
import type { z } from "zod";

// Encoding por forma (sem encodings de domínio):
//   primitive              -> ?key=value
//   array<primitive>       -> ?key=v1&key=v2
//   object<primitive>      -> ?key=f1:v1,f2:v2
//   array<object<prim>>    -> ?key=f1:v1,f2:v2&key=f1:v3,f2:v4

type Primitive = string | number | boolean;
type PrimitiveObject = Record<string, Primitive>;

interface ZodDef {
  element?: { _zod: { def: ZodDef } };
  innerType?: { _zod: { def: ZodDef } };
  shape?: Record<string, { _zod: { def: ZodDef } }>;
  type: string;
}

function defOf(schema: unknown): ZodDef {
  return (schema as { _zod: { def: ZodDef } })._zod.def;
}

// Peel optional / nullable / default wrappers so we can read the inner primitive type
function primitiveTypeOf(schema: unknown): string {
  let def = defOf(schema);
  while (
    (def.type === "optional" ||
      def.type === "nullable" ||
      def.type === "default") &&
    def.innerType
  ) {
    def = defOf(def.innerType);
  }
  return def.type;
}

function decodePrimitive(raw: string, type: string): Primitive | null {
  if (type === "number" || type === "int") {
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (type === "boolean") {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  }
  return raw;
}

function encodeFields(value: Record<string, unknown>): string {
  return Object.entries(value)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}:${encodeURIComponent(String(v))}`)
    .join(",");
}

function decodeFields(
  raw: string,
  shape: Record<string, { _zod: { def: ZodDef } }>
): PrimitiveObject | null {
  const out: PrimitiveObject = {};
  for (const pair of raw.split(",")) {
    const sep = pair.indexOf(":");
    if (sep === -1) continue;
    const key = pair.slice(0, sep);
    const fieldSchema = shape[key];
    if (!fieldSchema) continue;
    const val = decodePrimitive(
      decodeURIComponent(pair.slice(sep + 1)),
      primitiveTypeOf(fieldSchema)
    );
    if (val === null) continue;
    out[key] = val;
  }
  return Object.keys(out).length ? out : null;
}

const eqDeep = <T>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);

export function parseAsShape<S extends z.ZodArray<z.ZodObject>>(
  schema: S
): MultiParserBuilder<z.infer<S>>;
export function parseAsShape<S extends z.ZodArray<z.ZodType<Primitive>>>(
  schema: S
): MultiParserBuilder<z.infer<S>>;
export function parseAsShape<S extends z.ZodObject>(
  schema: S
): SingleParserBuilder<z.infer<S>>;
export function parseAsShape<S extends z.ZodType<Primitive>>(
  schema: S
): SingleParserBuilder<z.infer<S>>;
export function parseAsShape(schema: z.ZodType): unknown {
  const def = defOf(schema);
  const validate = <T>(input: unknown): T | null => {
    const r = schema.safeParse(input);
    return r.success ? (r.data as T) : null;
  };

  if (def.type === "array") {
    const itemDef = defOf(def.element);

    if (itemDef.type === "object") {
      const shape = itemDef.shape ?? {};
      return createMultiParser<PrimitiveObject[]>({
        parse: (values) => {
          const items = values
            .map((s) => decodeFields(s, shape))
            .filter((v): v is PrimitiveObject => v !== null);
          const parsed = validate<PrimitiveObject[]>(items);
          return parsed?.length ? parsed : null;
        },
        serialize: (value) => value.map(encodeFields).filter(Boolean),
        eq: eqDeep,
      });
    }

    const itemType = itemDef.type;
    return createMultiParser<Primitive[]>({
      parse: (values) => {
        const decoded = values
          .map((s) => decodePrimitive(s, itemType))
          .filter((v): v is Primitive => v !== null);
        const parsed = validate<Primitive[]>(decoded);
        return parsed?.length ? parsed : null;
      },
      serialize: (value) => value.map(String),
      eq: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
    });
  }

  if (def.type === "object") {
    const shape = def.shape ?? {};
    return createParser<PrimitiveObject>({
      parse: (str) => {
        const obj = decodeFields(str, shape);
        return obj ? validate<PrimitiveObject>(obj) : null;
      },
      serialize: encodeFields,
      eq: eqDeep,
    });
  }

  const primitiveType = def.type;
  return createParser<Primitive>({
    parse: (str) => {
      const v = decodePrimitive(str, primitiveType);
      return v === null ? null : validate<Primitive>(v);
    },
    serialize: (value) => String(value),
    eq: Object.is,
  });
}
