import {
  ArrowsClockwiseIcon,
  PlusIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Alert } from "@/components/display/alert";
import { DataState } from "@/components/display/data-state";
import { Json } from "@/components/display/json";
import { Modal } from "@/components/display/modal";
import { PageTitle } from "@/components/display/page-title";
import type { CommonFormValuesProps } from "@/forms/common";
import { SkillForm, type SkillSchema } from "@/forms/skill";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneSkill,
  useRemoveOneSkill,
  useUpdateOneSkill,
} from "@/hooks/mutations/skills";
import { useFindManySkills } from "@/hooks/queries/skills";
import { cn } from "@/lib/cn";
import { SkillsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/skills/")({
  component: RouteComponent,
});

function RouteComponent() {
  const findManySkills = useFindManySkills();
  const createOneSkill = useCreateOneSkill();
  const updateOneSkill = useUpdateOneSkill();
  const removeOneSkill = useRemoveOneSkill();

  const [formValues, setFormValues] = useState<CommonFormValuesProps>();

  const handleSubmit = useCallback(
    (data: SkillSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneSkill.mutate(data, {
            onSuccess: () => {
              setFormValues(undefined);
              findManySkills.refetch();
            },
          });
          break;
        case "UPDATING":
          updateOneSkill.mutate(
            {
              skillId: formValues.customValues?.id,
              updateSkillInput: {
                category: data.category,
                name: data.name,
                relevance: data.relevance,
                slug: data.slug,
              },
            },
            {
              onSuccess: () => {
                setFormValues(undefined);
                findManySkills.refetch();
              },
            }
          );
          break;
        default:
          console.log(formValues?.state, data);
          break;
      }
    },
    [
      createOneSkill.mutate,
      findManySkills.refetch,
      formValues?.customValues,
      formValues?.state,
      updateOneSkill.mutate,
    ]
  );

  useQueryAllPages(findManySkills);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManySkills.isFetching && "animate-spin")}
              />
            ),
            label: "Refetch",
            className: "btn-ghost",
            onClick: () => findManySkills.refetch(),
          },
          {
            icon: <PlusIcon />,
            label: "New Skill",
            className: "btn-soft",
            onClick: () =>
              setFormValues({ state: "CREATING", customValues: {} }),
          },
        ]}
        description="Create, update or delete skills that can be associated with your profile."
        title="Manage Skills"
      />

      <Modal
        description="Fill the details below and submit."
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title="Manage Skill"
      >
        <SkillForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneSkill.isPending || updateOneSkill.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        actions={[
          {
            label: "Close",
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
        ]}
        description="Read only view of the skill."
        isOpen={formValues?.state === "READING"}
        onClose={() => setFormValues(undefined)}
        title="Read Skill"
      >
        <Json data={{ ...formValues?.customValues }} />
      </Modal>

      <Modal
        actions={[
          {
            label: "Cancel",
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
          {
            label: "Confirm",
            className: "btn-soft btn-error",
            onClick: () =>
              removeOneSkill.mutate(formValues?.customValues?.id ?? "", {
                onSuccess: () => {
                  setFormValues(undefined);
                  findManySkills.refetch();
                },
              }),
          },
        ]}
        description="Are you sure you want to delete this skill?"
        isOpen={formValues?.state === "DELETING"}
        onClose={() => setFormValues(undefined)}
        title="Delete Skill"
      />

      <DataState
        isEmpty={findManySkills.data?.nodes.length === 0}
        isFetching={findManySkills.isFetching}
        isLoading={findManySkills.isPending}
      >
        <DataState.Loading>
          <div className="skeleton h-96 w-full" />
        </DataState.Loading>

        <DataState.Empty>
          <Alert
            actions={[
              {
                label: "Refetch",
                className: "btn-ghost",
                onClick: () => findManySkills.refetch(),
              },
            ]}
            description="Try refreshing the page or create a new skill."
            icon={<WarningIcon weight="bold" />}
            title="Nothing found!"
          />
        </DataState.Empty>

        <DataState.Content>
          <SkillsTable
            data={findManySkills.data?.nodes ?? []}
            onDelete={(skill) =>
              setFormValues({
                state: "DELETING",
                customValues: { id: skill.id },
              })
            }
            onEdit={(skill) =>
              setFormValues({
                defaultValues: skill,
                state: "UPDATING",
                customValues: { id: skill.id },
              })
            }
            onSelect={(skill) => console.log(skill)}
            onView={(skill) =>
              setFormValues({
                state: "READING",
                customValues: skill,
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
