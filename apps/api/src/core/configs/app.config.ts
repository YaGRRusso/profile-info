import { INestApplication, Logger } from "@nestjs/common";
import chalk from "chalk";

const localhost = /^http:\/\/localhost:\d+$/;

export async function appConfig(app: INestApplication) {
  const port = Number(process.env.PORT) || 8080;
  const host = process.env.HOST || "0.0.0.0";

  app.enableCors({
    origin: [localhost, "https://yagrrusso.github.io"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
