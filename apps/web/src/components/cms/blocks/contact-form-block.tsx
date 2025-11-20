import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RichText } from "../rich-text";
import { getBgColorClass } from "../utils";
import type { ContactFormBlock as ContactFormBlockType } from "@repo/types/payload";

export function ContactFormBlock({ block }: { block: ContactFormBlockType }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const maxWidthClass = {
        full: "max-w-none",
        large: "max-w-4xl",
        medium: "max-w-2xl",
        small: "max-w-xl",
    }[block.maxWidth || "medium"];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission - replace with actual API call
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSubmitStatus("success");
        } catch {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === "success") {
        return (
            <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
                <div className="container px-4">
                    <div className={cn(maxWidthClass, "mx-auto text-center")}>
                        <div className="bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 p-6 rounded-lg">
                            {block.successMessage || "Thank you! Your message has been sent."}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
            <div className="container px-4">
                <div className={cn(maxWidthClass, "mx-auto")}>
                    {(block.title || block.description) && (
                        <div className="text-center mb-8">
                            {block.title && (
                                <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
                            )}
                            {block.description && (
                                <div className="text-muted-foreground">
                                    <RichText content={block.description} />
                                </div>
                            )}
                        </div>
                    )}

                    {submitStatus === "error" && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
                            {block.errorMessage || "Something went wrong. Please try again."}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={cn("grid gap-4", block.layout === "two" && "md:grid-cols-2")}>
                            {block.formFields?.map((field) => (
                                <div key={field.id} className={cn(field.type === "textarea" && "md:col-span-2")}>
                                    <Label htmlFor={field.name} className="mb-2 block">
                                        {field.label}
                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>

                                    {field.type === "textarea" ? (
                                        <Textarea
                                            id={field.name}
                                            name={field.name}
                                            placeholder={field.placeholder || undefined}
                                            required={field.required || false}
                                            rows={field.rows || 4}
                                        />
                                    ) : field.type === "select" ? (
                                        <Select name={field.name} required={field.required || false}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={field.placeholder || "Select..."} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((option) => (
                                                    <SelectItem key={option.id} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : field.type === "checkbox" ? (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={field.name}
                                                name={field.name}
                                                required={field.required || false}
                                            />
                                            <Label htmlFor={field.name} className="text-sm font-normal">
                                                {field.placeholder}
                                            </Label>
                                        </div>
                                    ) : field.type === "radio" && field.options ? (
                                        <RadioGroup name={field.name} required={field.required || false}>
                                            {field.options.map((option) => (
                                                <div key={option.id} className="flex items-center gap-2">
                                                    <RadioGroupItem
                                                        value={option.value}
                                                        id={`${field.name}-${option.value}`}
                                                    />
                                                    <Label htmlFor={`${field.name}-${option.value}`} className="font-normal">
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            placeholder={field.placeholder || undefined}
                                            required={field.required || false}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting ? "Sending..." : block.submitButtonText || "Submit"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
