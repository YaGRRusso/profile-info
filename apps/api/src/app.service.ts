import { Injectable } from "@nestjs/common";
import { t } from "@/core/i18n/i18n";

@Injectable()
export class AppService {
  getHello(): string {
    return t("app.HELLO_WORLD");
  }
}
