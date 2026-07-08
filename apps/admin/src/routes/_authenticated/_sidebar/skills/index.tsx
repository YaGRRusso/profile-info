import {
  ArrowsClockwiseIcon,
  PlusIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Alert } from "@/components/display/alert";
import { DataState } from "@/components/display/data-state";
import { Json } from "@/components/display/json";
import { Modal } from "@/components/display/modal";
import { PageTitle } from "@/components/display/page-title";
import type { CommonFormValuesProps } from "@/forms/common";
import {
  SkillForm,
  type SkillSchema,
  skillToForm,
  skillToInput,
} from "@/forms/skill";
import { SkillMultiForm } from "@/forms/skill-multi";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneSkill,
  useDisableManySkills,
  useDisableOneSkill,
  useEnableManySkills,
  useEnableOneSkill,
  useUpdateManySkills,
  useUpdateOneSkill,
} from "@/hooks/mutations/skills";
import { type SkillRow, useFindManySkills } from "@/hooks/queries/skills";
import { cn } from "@/lib/cn";
import { i18nLabel } from "@/lib/i18n";
import { SkillsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/skills/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<SkillSchema, SkillRow[]>>();

  const findManySkills = useFindManySkills();
  useQueryAllPages(findManySkills);

  const createOneSkill = useCreateOneSkill();
  const updateOneSkill = useUpdateOneSkill();
  const updateManySkills = useUpdateManySkills();
  const disableOneSkill = useDisableOneSkill();
  const disableManySkills = useDisableManySkills();
  const enableOneSkill = useEnableOneSkill();
  const enableManySkills = useEnableManySkills();

  const closeForm = useCallback(() => {
    setFormValues(undefined);
  }, []);

  const selectedSkillIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((skill) => skill?.id)
        .filter((skillId): skillId is string => Boolean(skillId)),
    [formValues?.customValues]
  );

  const handleSubmit = useCallback(
    (data: SkillSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneSkill.mutate(skillToInput(data), {
            onSuccess: () => {
              closeForm();
              toast.success("Skill created successfully");
            },
          });
          break;
        case "UPDATING":
          updateOneSkill.mutate(
            {
              skillId: selectedSkillIds[0],
              updateSkillInput: skillToInput(data),
            },
            {
              onSuccess: () => {
                closeForm();
                toast.success("Skill updated successfully");
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
      createOneSkill.mutate,
      closeForm,
      formValues?.state,
      updateOneSkill.mutate,
      selectedSkillIds,
    ]
  );

  const handleDisable = useCallback(() => {
    switch (formValues?.state) {
      case "DISABLING":
        disableOneSkill.mutate(selectedSkillIds[0], {
          onSuccess: () => {
            closeForm();
            toast.success("Skill disabled successfully");
          },
        });
        break;
      case "MULTI_DISABLING":
        disableManySkills.mutate(selectedSkillIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              `${data.disableManySkills.succeeded} skills disabled successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    disableOneSkill,
    selectedSkillIds,
    closeForm,
    disableManySkills,
  ]);

  const handleEnable = useCallback(() => {
    switch (formValues?.state) {
      case "ENABLING":
        enableOneSkill.mutate(selectedSkillIds[0], {
          onSuccess: () => {
            closeForm();
            toast.success("Skill enabled successfully");
          },
        });
        break;
      case "MULTI_ENABLING":
        enableManySkills.mutate(selectedSkillIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              `${data.enableManySkills.succeeded} skills enabled successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    enableOneSkill,
    selectedSkillIds,
    closeForm,
    enableManySkills,
  ]);

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
            className: "btn-ghost btn-square",
            onClick: () => findManySkills.refetch(),
            disabled: findManySkills.isFetching,
          },
          {
            icon: <PlusIcon />,
            label: "New Skill",
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description="Create, update, disable or enable skills that can be associated with your profile."
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
          slugsList={findManySkills.data?.nodes.map((skill) => skill.slug)}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={`Update the fields below to apply them to all ${formValues?.customValues?.length ?? 0} selected skills.`}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title="Update Skills"
      >
        <SkillMultiForm
          isLoading={updateManySkills.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={(updateSkillInput) =>
            updateManySkills.mutate(
              { skillIds: selectedSkillIds, updateSkillInput },
              {
                onSuccess: (data) => {
                  closeForm();
                  toast.success(
                    `${data.updateManySkills.succeeded} skills updated successfully`
                  );
                },
              }
            )
          }
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
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title="Read Skill"
      >
        {formValues?.customValues?.map((skill) => (
          <Json data={skill} key={skill?.id} />
        ))}
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
            disabled: disableOneSkill.isPending || disableManySkills.isPending,
            onClick: () => handleDisable(),
          },
        ]}
        description="Are you sure you want to disable the following skills?"
        isOpen={
          formValues?.state === "MULTI_DISABLING" ||
          formValues?.state === "DISABLING"
        }
        onClose={() => setFormValues(undefined)}
        title="Disable skills?"
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((skill) => (
            <li className="badge badge-sm badge-soft" key={skill?.id}>
              {skill ? i18nLabel(skill) : null}
            </li>
          ))}
        </ul>
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
            className: "btn-soft btn-success",
            disabled: enableOneSkill.isPending || enableManySkills.isPending,
            onClick: () => handleEnable(),
          },
        ]}
        description="Are you sure you want to enable the following skills?"
        isOpen={
          formValues?.state === "MULTI_ENABLING" ||
          formValues?.state === "ENABLING"
        }
        onClose={() => setFormValues(undefined)}
        title="Enable skills?"
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((skill) => (
            <li className="badge badge-sm badge-soft" key={skill?.id}>
              {skill ? i18nLabel(skill) : null}
            </li>
          ))}
        </ul>
      </Modal>

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
            description="Try refreshing the page or create a new skill."
            icon={<WarningIcon weight="bold" />}
            title="Nothing found!"
          />
        </DataState.Empty>

        <DataState.Content>
          <SkillsTable
            data={findManySkills.data?.nodes ?? []}
            onDisable={(skill) =>
              setFormValues({
                state: "DISABLING",
                customValues: [skill],
              })
            }
            onEdit={(skill) =>
              setFormValues({
                defaultValues: skillToForm(skill),
                state: "UPDATING",
                customValues: [skill],
              })
            }
            onEnable={(skill) =>
              setFormValues({
                state: "ENABLING",
                customValues: [skill],
              })
            }
            onMultiDisable={(skills) =>
              setFormValues({
                state: "MULTI_DISABLING",
                customValues: skills,
              })
            }
            onMultiEdit={(skills) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: skills,
              })
            }
            onMultiEnable={(skills) =>
              setFormValues({
                state: "MULTI_ENABLING",
                customValues: skills,
              })
            }
            onMultiView={(skills) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: skills,
              })
            }
            onView={(skill) =>
              setFormValues({
                state: "READING",
                customValues: [skill],
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
