import type { ProductOption, ProductOptionType } from "@print3d/shared-types";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { adminTokens } from "@/lib/admin-tokens";
import { randomId } from "@/lib/randomId";

type ProductOptionsEditorProps = {
  value: ProductOption[];
  onChange: (options: ProductOption[]) => void;
  errors?: Record<string, string>;
};

const optionTypes: ProductOptionType[] = ["select", "text", "boolean"];

function createOptionId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? `opt-${slug}` : `opt-${randomId().slice(0, 8)}`;
}

export function ProductOptionsEditor({ value, onChange, errors }: ProductOptionsEditorProps) {
  function updateOption(index: number, patch: Partial<ProductOption>) {
    const next = value.map((option, i) => (i === index ? { ...option, ...patch } : option));
    onChange(next);
  }

  function addOption() {
    onChange([
      ...value,
      { id: createOptionId("option"), name: "", type: "select", required: false, choices: [""] },
    ]);
  }

  function removeOption(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={adminTokens.sectionTitle}>Options</h3>
        <Button type="button" variant="secondary" onClick={addOption}>
          Add option
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">No product options configured.</p>
      ) : null}

      {value.map((option, index) => (
        <div key={option.id} className="space-y-3 rounded-lg border border-hairline p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Name"
              value={option.name}
              onChange={(event) => {
                const name = event.target.value;
                updateOption(index, { name, id: createOptionId(name) || option.id });
              }}
              error={errors?.[`options.${index}.name`]}
            />
            <Select
              label="Type"
              value={option.type}
              onChange={(event) =>
                updateOption(index, {
                  type: event.target.value as ProductOptionType,
                  choices: event.target.value === "select" ? option.choices ?? [""] : undefined,
                })
              }
            >
              {optionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={option.required}
                onChange={(event) => updateOption(index, { required: event.target.checked })}
              />
              Required
            </label>
          </div>

          {option.type === "select" ? (
            <div className="space-y-2">
              <p className={adminTokens.label}>Choices</p>
              {(option.choices ?? [""]).map((choice, choiceIndex) => (
                <div key={choiceIndex} className="flex gap-2">
                  <Input
                    value={choice}
                    onChange={(event) => {
                      const choices = [...(option.choices ?? [""])];
                      choices[choiceIndex] = event.target.value;
                      updateOption(index, { choices });
                    }}
                    error={errors?.[`options.${index}.choices`]}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const choices = (option.choices ?? []).filter((_, i) => i !== choiceIndex);
                      updateOption(index, { choices: choices.length > 0 ? choices : [""] });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  updateOption(index, { choices: [...(option.choices ?? []), ""] })
                }
              >
                Add choice
              </Button>
            </div>
          ) : null}

          <Button type="button" variant="danger" onClick={() => removeOption(index)}>
            Remove option
          </Button>
        </div>
      ))}
    </div>
  );
}
