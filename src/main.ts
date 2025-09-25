import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appConfig } from "./core/configs/app.config";
import { validationConfig } from "./core/configs/validation.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  validationConfig(app);
  await appConfig(app);
}

bootstrap();
