import { Query, Resolver } from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { DashboardService } from "./dashboard.service";
import { DashboardEntity } from "./entities/dashboard.entity";

@Resolver(() => DashboardEntity)
export class DashboardResolver {
  constructor(readonly dashboardService: DashboardService) {}

  @Query(() => DashboardEntity)
  dashboard(@Auth() ctx: AuthContext) {
    return this.dashboardService.getDashboard(ctx);
  }
}
