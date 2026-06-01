import { Query, Resolver } from "@nestjs/graphql";
import { DashboardService } from "./dashboard.service";
import { DashboardEntity } from "./entities/dashboard.entity";

@Resolver(() => DashboardEntity)
export class DashboardResolver {
  constructor(readonly dashboardService: DashboardService) {}

  @Query(() => DashboardEntity)
  dashboard() {
    return this.dashboardService.getDashboard();
  }
}
