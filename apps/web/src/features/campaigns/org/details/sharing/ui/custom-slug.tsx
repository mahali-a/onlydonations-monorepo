import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardCopy, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAsyncDebouncer } from "@tanstack/react-pacer";
import type { AnyFieldApi } from "@tanstack/react-form";
import { getIsSlugAvailableFromServer } from "../../../server";

type CustomSlugProps = {
  field: AnyFieldApi;
  defaultSlug: string;
  campaignId: string;
};

export function CustomSlug({ field, defaultSlug, campaignId }: CustomSlugProps) {
  const [currentSlug, setCurrentSlug] = useState(defaultSlug);
  const [slugStatus, setSlugStatus] = useState<{
    available?: boolean;
    error?: string;
    message?: string;
  }>({});

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const params = useParams({ from: "/o/$orgId/campaigns/$campaignId" });

  const checkAvailability = useAsyncDebouncer(
    async (lowercaseValue: string) => {
      try {
        const result = await getIsSlugAvailableFromServer({
          data: {
            organizationId: params.orgId,
            slug: lowercaseValue,
            campaignId,
          },
        });
        setSlugStatus(result);
      } catch (_error) {
        setSlugStatus({
          available: false,
          error: "Failed to check slug availability",
        });
      }
    },
    { wait: 1000 },
    (state) => ({ isExecuting: state.isExecuting }),
  );

  const handleSlugChange = (value: string) => {
    const lowercaseValue = value.toLowerCase();
    setCurrentSlug(lowercaseValue);
    field.handleChange(lowercaseValue);

    if (!lowercaseValue || lowercaseValue.length < 3 || lowercaseValue === defaultSlug) {
      setSlugStatus({});
      return;
    }

    checkAvailability.maybeExecute(lowercaseValue);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${baseUrl}/f/${currentSlug}`);
    toast.success("Link copied to clipboard");
  };

  const isSlugAvailable = slugStatus.available;
  const slugError = slugStatus.error;
  const showStatusIcon = currentSlug && currentSlug !== defaultSlug;
  const isChecking = checkAvailability.state.isExecuting;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">General</div>
        <p className="text-sm text-foreground">
          Choose a custom sharing link to personalize your campaign.{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.yoursite.com/custom-urls"
            className="text-primary hover:underline"
          >
            Read the guide
          </a>
          .
        </p>
      </div>
      <div className="col-span-full md:col-span-7 md:col-start-6">
        <div className="flex flex-col gap-4">
          <div className="w-full space-y-2">
            <Label htmlFor={field.name}>
              Custom campaign link
              <span className="font-medium text-red-600">
                <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </span>
            </Label>
            <p className="text-muted-foreground text-sm">
              Choose a custom sharing link to personalize your campaign.
            </p>
            <div className="flex flex-nowrap max-w-full">
              <div className="flex items-center rounded-bl-md rounded-tl-md bg-muted px-3 h-10 shrink-0">
                <p className="text-sm font-medium leading-none whitespace-nowrap">{baseUrl}/f/</p>
              </div>
              <div className="w-full flex h-10 cursor-text items-center gap-2 rounded-r-lg bg-background pl-3 pr-1 text-foreground ring-1 ring-inset ring-input py-2 grow">
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="my-campaign"
                  className="h-full border-0 shadow-none focus-visible:ring-0 p-0 text-sm"
                />
                <div className="flex items-center gap-1">
                  <AnimatePresence mode="wait">
                    {isChecking && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </motion.div>
                    )}
                    {!isChecking && showStatusIcon && isSlugAvailable === true && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                    )}
                    {!isChecking && showStatusIcon && isSlugAvailable === false && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Copy"
                    onClick={handleCopy}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {slugError && !isChecking && showStatusIcon && (
                <motion.p
                  key="error-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-destructive"
                >
                  {slugError}
                </motion.p>
              )}
              {!isChecking && showStatusIcon && isSlugAvailable === true && (
                <motion.p
                  key="success-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-emerald-600 dark:text-emerald-400"
                >
                  This slug is available!
                </motion.p>
              )}
              {!isChecking && showStatusIcon && isSlugAvailable === false && !slugError && (
                <motion.p
                  key="taken-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-destructive"
                >
                  {slugStatus.message || "This slug is already taken"}
                </motion.p>
              )}
            </AnimatePresence>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
            )}
            <p className="text-sm text-foreground">
              Find your campaign page here:{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${baseUrl}/f/${currentSlug}`}
                className="text-primary hover:underline"
              >
                {baseUrl}/f/{currentSlug}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
