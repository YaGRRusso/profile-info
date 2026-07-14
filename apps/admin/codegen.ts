import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  documents: ["src/hooks/queries/*.ts", "src/hooks/mutations/*.ts"],
  generates: {
    "./schema.graphql": {
      config: {
        includeDirectives: true,
      },
      plugins: ["schema-ast"],
    },
    "./src/generated/graphql/": {
      config: {
        documentMode: "string",
        enumType: "enum",
        scalars: {
          DateTime: "string",
        },
      },
      preset: "client",
    },
  },
  ignoreNoDocuments: true,
  schema: "../api/src/schema.gql",
};

export default config;
