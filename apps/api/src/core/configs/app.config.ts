import { INestApplication, Logger } from "@nestjs/common";
import chalk from "chalk";

const localhost = /^http:\/\/localhost:\d+$/;

export async function appConfig(app: INestApplication) {
  const port = Number(process.env.PORT) || 8080;
  const host = process.env.HOST || "0.0.0.0";

  app.enableCors({
    allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    origin: [localhost, "https://yagrrusso.github.io"],
  });

  // app.use(
  //   morgan("dev", {
  //     stream: {
  //       write: (message: string) => {
  //         Logger.log(message.trim(), "HTTP");
  //       },
  //     },
  //   })
  // );

  await app.listen(port, host);

  const url = await app.getUrl();
  const playgroundUrl = `${url}/graphql`;

  Logger.log(`Playground running at ${chalk.yellow(playgroundUrl)}`, "GraphQL");
}
