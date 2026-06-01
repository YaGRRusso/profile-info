import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
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
      skillsByCategory {
        label
        value
      }
      experiencesByCategory {
        label
        value
      }
      coursesByStatus {
        label
        value
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
