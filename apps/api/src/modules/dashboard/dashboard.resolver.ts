import { Query, Resolver } from "@nestjs/graphql";
import { Roles } from "@/core/decorators/roles.decorator";
import { UserRole } from "@/core/enums/user-role.enum";
import { DashboardService } from "./dashboard.service";
import { DashboardEntity } from "./entities/dashboard.entity";

@Resolver(() => DashboardEntity)
export class DashboardResolver {
  constructor(readonly dashboardService: DashboardService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Query(() => DashboardEntity)
  dashboard() {
    return this.dashboardService.getDashboard();
  }
}
