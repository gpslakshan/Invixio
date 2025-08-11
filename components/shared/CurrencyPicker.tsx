"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { currencies } from "@/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  control: any; // You might want to type this more specifically
  name: string;
  label?: string;
  description?: string;
  className?: string;
}

const CurrencyPicker = ({
  control,
  name,
  label = "Preferred currency",
  description,
  className,
}: Props) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? `${
                        currencies.find(
                          (currency) => currency.code === field.value
                        )?.flag
                      } - ${
                        currencies.find(
                          (currency) => currency.code === field.value
                        )?.name
                      }`
                    : "Select Currency"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end">
              <Command>
                <CommandInput
                  placeholder="Search Currency Code..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>No currency found.</CommandEmpty>
                  <CommandGroup>
                    {currencies.map((currency) => (
                      <CommandItem
                        value={currency.code}
                        key={currency.code}
                        onSelect={() => {
                          field.onChange(currency.code);
                        }}
                      >
                        {currency.flag} - {currency.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            currency.code === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CurrencyPicker;
