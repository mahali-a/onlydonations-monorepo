import type { SelectCategory } from "@repo/core/database/types";
import type { AnyFieldApi } from "@tanstack/react-form";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CampaignMainDetails({
  categories,
  titleField,
  beneficiaryField,
  categoryField,
  amountField,
}: {
  categories: SelectCategory[];
  titleField: AnyFieldApi;
  beneficiaryField: AnyFieldApi;
  categoryField: AnyFieldApi;
  amountField: AnyFieldApi;
}) {
  const [titleLength, setTitleLength] = useState(titleField.state.value.length);
  const maxLength = 50;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">Main details</div>
        <p className="text-sm text-foreground">Choose a title, beneficiary and goal</p>
      </div>

      <div className="col-span-full md:col-span-7 md:col-start-6 space-y-4">
        <section className="space-y-4">
          <Field>
            <div className="flex items-center justify-between">
              <Label htmlFor={titleField.name}>Title</Label>
              <span className="text-muted-foreground text-xs">
                {titleLength}/{maxLength}
              </span>
            </div>
            <Input
              id={titleField.name}
              name={titleField.name}
              value={titleField.state.value}
              onBlur={titleField.handleBlur}
              onChange={(e) => {
                const value = e.target.value;
                setTitleLength(value.length);
                titleField.handleChange(value);
              }}
              placeholder="Start with a clear title"
              maxLength={maxLength}
              className="w-full"
              aria-invalid={titleField.state.meta.errors.length > 0}
            />
            <FieldError errors={titleField.state.meta.errors} />
          </Field>

          <Field>
            <Label htmlFor={beneficiaryField.name}>Beneficiary</Label>
            <Input
              id={beneficiaryField.name}
              name={beneficiaryField.name}
              value={beneficiaryField.state.value}
              onBlur={beneficiaryField.handleBlur}
              onChange={(e) => beneficiaryField.handleChange(e.target.value)}
              placeholder="Who benefits from this campaign?"
              className="w-full"
              aria-invalid={beneficiaryField.state.meta.errors.length > 0}
            />
            <FieldError errors={beneficiaryField.state.meta.errors} />
            <p className="text-muted-foreground text-xs">
              Enter the name of the person or organization that will receive the funds from this
              campaign.
            </p>
          </Field>

          <Field>
            <div className="flex items-center gap-1">
              <Label htmlFor={amountField.name}>Goal</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">More info</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You keep all money you raise, regardless of whether you hit your goal.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">
                GHS
              </span>
              <Input
                id={amountField.name}
                name={amountField.name}
                type="number"
                min="0"
                step="1"
                value={amountField.state.value || ""}
                onBlur={amountField.handleBlur}
                onChange={(e) => amountField.handleChange(Number(e.target.value))}
                placeholder="0.00"
                className="rounded-l-none"
                aria-invalid={amountField.state.meta.errors.length > 0}
              />
            </div>
            <FieldError errors={amountField.state.meta.errors} />
            <p className="text-muted-foreground text-xs">
              Enter the amount in Ghana Cedis (GHS). Large numbers will be displayed with comma
              separators (e.g., 10,000).
            </p>
          </Field>
        </section>

        <section className="space-y-4">
          <Field>
            <Label>Category</Label>
            <p className="text-muted-foreground text-xs">
              Select a category that best describes your campaign. This helps donors find your
              campaign more easily.
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={cn(
                    "border rounded-full px-4 py-2 text-sm font-normal cursor-pointer transition-colors relative flex-shrink-0",
                    categoryField.state.value === category.id
                      ? "bg-primary/10 border-primary text-primary/80"
                      : "border-border hover:bg-accent text-foreground",
                  )}
                  onClick={() => categoryField.handleChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <FieldError errors={categoryField.state.meta.errors} />
          </Field>
        </section>
      </div>
    </div>
  );
}
