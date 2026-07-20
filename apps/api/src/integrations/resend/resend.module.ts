import { Module } from "@nestjs/common";
import { EmailProvider } from "./email.provider";
import { ResendService } from "./resend.service";

@Module({
  exports: [EmailProvider],
  providers: [
    ResendService,
    { provide: EmailProvider, useExisting: ResendService },
  ],
})
export class ResendModule {}
