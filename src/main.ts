import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import chalk from "chalk";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "0.0.0.0";
  await app.listen(port, host);

  const url = await app.getUrl();
  const schemaUrl = `${url}/schema.gql`;
  const playgroundUrl = `${url}/graphql`;

  Logger.log(`Schema available at ${chalk.yellow(schemaUrl)}`, "GraphQL");
  Logger.log(`Playground running at ${chalk.yellow(playgroundUrl)}`, "GraphQL");
}

bootstrap();
