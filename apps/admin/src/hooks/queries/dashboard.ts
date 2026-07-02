import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import { execute } from "@/lib/execute";

const dashboard = graphql(`
  query Dashboard {
    dashboard {
      totals {
        skills
        courses
        educations
        organizations
        projects
        experiences
      }
      experiencesByCategory {
        label
        value
      }
      coursesByStatus {
        label
        value
      }
      recentActivity {
        type
        label
        updatedAt
      }
    }
  }
`);

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => execute(dashboard),
  });
}
