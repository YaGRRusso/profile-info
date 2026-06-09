import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../api/src/schema.gql",
  documents: ["src/hooks/queries/*.ts", "src/hooks/mutations/*.ts"],
  ignoreNoDocuments: true,
  generates: {
    "./src/generated/graphql/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
