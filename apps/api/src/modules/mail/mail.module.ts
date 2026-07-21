import { Module } from "@nestjs/common";
import { ResendModule } from "@/integrations/resend/resend.module";
import { OnUserAccountEnabledListener } from "./listeners/on-user-account-enabled.listener";
import { OnUserRegisteredListener } from "./listeners/on-user-registered.listener";

@Module({
  imports: [ResendModule],
  providers: [OnUserRegisteredListener, OnUserAccountEnabledListener],
})
export class MailModule {}
