import {
  ArrowsClockwiseIcon,
  PlusIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
  useRemoveManySkills,
  useRemoveOneSkill,
  useUpdateManySkills,
  useUpdateOneSkill,
} from "@/hooks/mutations/skills";
import { type SkillRow, useFindManySkills } from "@/hooks/queries/skills";
import { cn } from "@/lib/cn";
import { isNonEmptyString } from "@/lib/empty-value";
import { i18nLabel } from "@/lib/i18n";
import { pageHelp } from "@/lib/page-help";
import { SkillsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/skills/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const entity = tPage("skills.entity");
  const entityPlural = tPage("skills.entityPlural");
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
  const removeOneSkill = useRemoveOneSkill();
  const removeManySkills = useRemoveManySkills();

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
              toast.success(tAlert("created", { entity }));
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
                toast.success(tAlert("updated", { entity }));
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
      tAlert,
      entity,
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
            toast.success(tAlert("disabled", { entity }));
          },
        });
        break;
      case "MULTI_DISABLING":
        disableManySkills.mutate(selectedSkillIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              tAlert("batchDisabled", {
                count: data.disableManySkills.succeeded,
                entityPlural,
              })
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    tAlert,
    entity,
    entityPlural,
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
            toast.success(tAlert("enabled", { entity }));
          },
        });
        break;
      case "MULTI_ENABLING":
        enableManySkills.mutate(selectedSkillIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              tAlert("batchEnabled", {
                count: data.enableManySkills.succeeded,
                entityPlural,
              })
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    tAlert,
    entity,
    entityPlural,
    formValues?.state,
    enableOneSkill,
    selectedSkillIds,
    closeForm,
    enableManySkills,
  ]);

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneSkill.mutate(selectedSkillIds[0], {
          onSuccess: () => {
            closeForm();
            toast.success(tAlert("deleted", { entity }));
          },
        });
        break;
      case "MULTI_DELETING":
        removeManySkills.mutate(selectedSkillIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              tAlert("batchDeleted", {
                count: data.removeManySkills.succeeded,
                entityPlural,
              })
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    tAlert,
    entity,
    entityPlural,
    formValues?.state,
    removeOneSkill,
    selectedSkillIds,
    closeForm,
    removeManySkills,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            className: "btn-ghost btn-square",
            disabled: findManySkills.isFetching,
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManySkills.isFetching && "animate-spin")}
              />
            ),
            onClick: () => findManySkills.refetch(),
          },
          {
            className: "btn-soft",
            icon: <PlusIcon />,
            label: tPage("skills.newButton"),
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("skills.manageDescription")}
        help={pageHelp(tHelp, "skills")}
        title={tPage("skills.manageTitle")}
      />

      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("skills.modalManage")}
      >
        <SkillForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneSkill.isPending || updateOneSkill.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          slugsList={findManySkills.data?.nodes
            .map((skill) => skill.slug)
            .filter(isNonEmptyString)}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={tPage("shared.modalBatchUpdateDescription", {
          count: formValues?.customValues?.length ?? 0,
          entityPlural,
        })}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title={tPage("skills.modalBatchUpdate")}
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
                    tAlert("batchUpdated", {
                      count: data.updateManySkills.succeeded,
                      entityPlural,
                    })
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
            className: "btn-ghost",
            label: tAction("close"),
            onClick: () => setFormValues(undefined),
          },
        ]}
        description={tPage("shared.modalReadDescription", { entity })}
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("skills.modalRead")}
      >
        {formValues?.customValues?.map((skill) => (
          <Json data={skill} key={skill?.id} />
        ))}
      </Modal>

      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: () => setFormValues(undefined),
          },
          {
            className: "btn-soft btn-error",
            disabled: disableOneSkill.isPending || disableManySkills.isPending,
            label: tAction("confirm"),
            onClick: () => handleDisable(),
          },
        ]}
        description={tPage("shared.disableDescription", { entityPlural })}
        isOpen={
          formValues?.state === "MULTI_DISABLING" ||
          formValues?.state === "DISABLING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("shared.disableTitle", { entityPlural })}
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((skill) => (
            <li className="badge badge-sm badge-soft" key={skill?.id}>
              {skill ? i18nLabel(skill, locale) : null}
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: () => setFormValues(undefined),
          },
          {
            className: "btn-soft btn-success",
            disabled: enableOneSkill.isPending || enableManySkills.isPending,
            label: tAction("confirm"),
            onClick: () => handleEnable(),
          },
        ]}
        description={tPage("shared.enableDescription", { entityPlural })}
        isOpen={
          formValues?.state === "MULTI_ENABLING" ||
          formValues?.state === "ENABLING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("shared.enableTitle", { entityPlural })}
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((skill) => (
            <li className="badge badge-sm badge-soft" key={skill?.id}>
              {skill ? i18nLabel(skill, locale) : null}
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: () => setFormValues(undefined),
          },
          {
            className: "btn-soft btn-error",
            disabled: removeOneSkill.isPending || removeManySkills.isPending,
            label: tAction("confirm"),
            onClick: () => handleDelete(),
          },
        ]}
        description={tPage("shared.deleteDescription", { entityPlural })}
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("shared.deleteTitle", { entityPlural })}
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((skill) => (
            <li className="badge badge-sm badge-soft" key={skill?.id}>
              {skill ? i18nLabel(skill, locale) : null}
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
            description={tPage("shared.emptyDescription", { entity })}
            icon={<WarningIcon weight="bold" />}
            title={tPage("shared.emptyTitle")}
          />
        </DataState.Empty>

        <DataState.Content>
          <SkillsTable
            data={findManySkills.data?.nodes ?? []}
            onDisable={(skill) =>
              setFormValues({
                customValues: [skill],
                state: "DISABLING",
              })
            }
            onEdit={(skill) =>
              setFormValues({
                customValues: [skill],
                defaultValues: skillToForm(skill),
                state: "UPDATING",
              })
            }
            onEnable={(skill) =>
              setFormValues({
                customValues: [skill],
                state: "ENABLING",
              })
            }
            onMultiDisable={(skills) =>
              setFormValues({
                customValues: skills,
                state: "MULTI_DISABLING",
              })
            }
            onMultiEdit={(skills) =>
              setFormValues({
                customValues: skills,
                state: "MULTI_UPDATING",
              })
            }
            onMultiEnable={(skills) =>
              setFormValues({
                customValues: skills,
                state: "MULTI_ENABLING",
              })
            }
            onMultiRemove={(skills) =>
              setFormValues({
                customValues: skills,
                state: "MULTI_DELETING",
              })
            }
            onMultiView={(skills) =>
              setFormValues({
                customValues: skills,
                state: "MULTI_READING",
              })
            }
            onRemove={(skill) =>
              setFormValues({
                customValues: [skill],
                state: "DELETING",
              })
            }
            onView={(skill) =>
              setFormValues({
                customValues: [skill],
                state: "READING",
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
