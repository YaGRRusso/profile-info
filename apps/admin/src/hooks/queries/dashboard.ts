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
        ownedLocalSkills
        ownedLocalOrganizations
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
        slug
        i18n {
          locale
          messages {
            title
          }
        }
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
