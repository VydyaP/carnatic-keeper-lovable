import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Props = {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  placeholder?: string;
};

export function ComboField({ label, value, options, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const all = useMemo(() => {
    const set = new Set(options);
    if (value) set.add(value);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [options, value]);

  const canCreate =
    search.trim().length > 0 && !all.some((o) => o.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="space-y-1.5">
      <span className="label-caps">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal"
          >
            <span className={cn(!value && "text-muted-foreground")}>
              {value ?? placeholder ?? `Choose ${label.toLowerCase()}`}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Search or type a new ${label.toLowerCase()}`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty className="p-2 text-sm text-muted-foreground">
                Type to create a new value.
              </CommandEmpty>
              {canCreate && (
                <CommandGroup>
                  <CommandItem
                    value={`__create__${search}`}
                    onSelect={() => {
                      onChange(search.trim());
                      setSearch("");
                      setOpen(false);
                    }}
                  >
                    <Plus className="size-4" />
                    Add "{search.trim()}"
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {value && (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <span className="text-muted-foreground">Clear</span>
                  </CommandItem>
                )}
                {all.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option);
                      setSearch("");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("size-4", value === option ? "opacity-100" : "opacity-0")}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
