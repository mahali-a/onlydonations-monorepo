import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type GeneralSettingsProps = {
  publishCampaignField: AnyFieldApi;
  endDateField: AnyFieldApi;
  donateButtonTextField: AnyFieldApi;
  defaultEndDate?: Date | null;
  isPublished?: boolean;
  isEditable?: boolean;
};

export function GeneralSettings({
  publishCampaignField,
  endDateField,
  donateButtonTextField,
  defaultEndDate,
  isPublished = false,
  isEditable = true,
}: GeneralSettingsProps) {
  const [hasEndDate, setHasEndDate] = useState(!!defaultEndDate);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultEndDate || undefined);
  const [endTime, setEndTime] = useState("15:00");

  const timeOptions = Array.from({ length: 24 }, (_, hour) => {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour < 12 ? "AM" : "PM";
    return {
      value: `${hour}:00`,
      label: `${displayHour}:00 ${period}`,
    };
  });

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      endDateField.handleChange(date.toISOString());
    } else {
      endDateField.handleChange(null);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="flex w-72 max-w-full shrink-0 flex-col gap-6">
          <div>
            <div className="text-lg font-medium">General</div>
            <p className="text-sm text-muted-foreground">
              Publish your campaign and manage your general campaign settings.
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-full md:col-span-8 md:col-start-6">
        <div className="flex flex-col gap-6">
          <Field>
            <div className="flex items-center justify-between">
              <Label htmlFor={publishCampaignField.name}>Publish campaign</Label>
              <Switch
                id={publishCampaignField.name}
                checked={publishCampaignField.state.value}
                onCheckedChange={(checked: boolean) => publishCampaignField.handleChange(checked)}
                disabled={!isEditable || isPublished}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Make this campaign publicly viewable and live.
              {isPublished && (
                <span className="text-muted-foreground"> This campaign is already published.</span>
              )}
            </p>
            <p className="text-sm text-muted-foreground italic">
              Note: You cannot un-publish a campaign once you've started raising money.
            </p>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <Label htmlFor="hasEndDate">End date</Label>
              <Switch id="hasEndDate" checked={hasEndDate} onCheckedChange={setHasEndDate} />
            </div>
            <p className="text-sm text-muted-foreground">Add an end date/countdown to your page.</p>
            {hasEndDate && (
              <div className="w-full">
                <div className="flex w-full flex-col justify-start gap-2 md:flex-row md:items-center">
                  <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 sm:flex-nowrap">
                    <DatePicker
                      date={endDate}
                      onDateChange={handleEndDateChange}
                      placeholder="Select date & time"
                    />
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="h-10 w-full bg-background sm:w-fit">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </Field>

          <Field>
            <Label htmlFor={donateButtonTextField.name}>Custom donate button text</Label>
            <p className="text-sm text-muted-foreground">
              Change the text of the main button on your campaign page.
              {!isEditable && (
                <span className="text-muted-foreground">
                  {" "}
                  This field cannot be modified in the current campaign status.
                </span>
              )}
            </p>
            <Input
              id={donateButtonTextField.name}
              name={donateButtonTextField.name}
              placeholder="Donate"
              value={donateButtonTextField.state.value || ""}
              onChange={(e) => donateButtonTextField.handleChange(e.target.value)}
              disabled={!isEditable}
            />
            <FieldError errors={donateButtonTextField.state.meta.errors} />
          </Field>
        </div>
      </div>
    </div>
  );
}
