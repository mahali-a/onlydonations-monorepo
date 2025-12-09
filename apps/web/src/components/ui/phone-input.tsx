"use client";

import { forwardRef, useCallback, useMemo, useState } from "react";
import { type Country, countries, defaultCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export type PhoneInputValue = {
  country: Country;
  nationalNumber: string;
};

type PhoneInputProps = {
  value?: PhoneInputValue;
  onChange?: (value: PhoneInputValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  placeholder?: string;
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    { value, onChange, onBlur, disabled, className, error, placeholder = "Enter phone number" },
    ref,
  ) => {
    const initialCountry = value?.country ?? defaultCountry;
    const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry);
    const [nationalNumber, setNationalNumber] = useState(value?.nationalNumber ?? "");

    const handleCountryChange = useCallback(
      (countryCode: string) => {
        const country = countries.find((c) => c.code === countryCode);
        if (country) {
          setSelectedCountry(country);
          onChange?.({ country, nationalNumber });
        }
      },
      [nationalNumber, onChange],
    );

    const handleNumberChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "");
        setNationalNumber(digits);
        onChange?.({ country: selectedCountry, nationalNumber: digits });
      },
      [selectedCountry, onChange],
    );

    const { popularCountries, otherCountries } = useMemo(() => {
      const popular = countries.slice(0, 7);
      const others = countries.slice(7);
      return { popularCountries: popular, otherCountries: others };
    }, []);

    return (
      <div className={cn("flex", className)}>
        <Select
          value={selectedCountry.code}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              "w-[90px] rounded-r-none border-r-0 focus:z-10",
              error && "border-destructive",
            )}
          >
            <SelectValue>
              <span className="text-sm">{selectedCountry.dialCode}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-[240px]">
            <ScrollArea className="h-[300px]">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Popular</div>
              {popularCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex w-full items-center justify-between gap-2">
                    <span>{country.name}</span>
                    <span className="text-muted-foreground">{country.dialCode}</span>
                  </span>
                </SelectItem>
              ))}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Other Countries
              </div>
              {otherCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex w-full items-center justify-between gap-2">
                    <span>{country.name}</span>
                    <span className="text-muted-foreground">{country.dialCode}</span>
                  </span>
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          value={nationalNumber}
          onChange={handleNumberChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "rounded-l-none",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        />
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export function getE164Number(value: PhoneInputValue): string {
  const { country, nationalNumber } = value;
  const cleanNumber = nationalNumber.startsWith("0") ? nationalNumber.slice(1) : nationalNumber;
  return `${country.dialCode}${cleanNumber}`;
}
