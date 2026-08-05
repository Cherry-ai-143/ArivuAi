"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

interface ChipSelectorProps {
  label?: string;
  description?: string;
  options: string[];
  selectedValues: string[];
  onChange: (updated: string[]) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
  error?: string;
}

export function ChipSelector({
  label,
  description,
  options,
  selectedValues = [],
  onChange,
  allowCustom = true,
  customPlaceholder = "Add custom...",
  error,
}: ChipSelectorProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((val) => val !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleAddCustom = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed]);
      setCustomInput("");
    }
  };

  const removeChip = (valToRemove: string) => {
    onChange(selectedValues.filter((val) => val !== valToRemove));
  };

  // Combine standard options and custom selected values
  const allChips = Array.from(new Set([...options, ...selectedValues]));

  return (
    <div className="space-y-3">
      {label && (
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* Selected & Available Chips */}
      <div className="flex flex-wrap gap-2">
        {allChips.map((chip) => {
          const isSelected = selectedValues.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => toggleOption(chip)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                  : "bg-muted/60 text-foreground hover:bg-muted border border-border/80"
              }`}
            >
              {isSelected ? <Check className="size-3.5" /> : null}
              <span>{chip}</span>
              {isSelected && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(chip);
                  }}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-primary-foreground/20"
                >
                  <X className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Custom Input (div container to prevent nested form error) */}
      {allowCustom && (
        <div className="flex items-center gap-2 pt-1 max-w-sm">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom(e);
              }
            }}
            placeholder={customPlaceholder}
            className="flex-1 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customInput.trim()}
            className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50 transition-all shadow-sm"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
      )}

      {error && <p className="text-xs font-medium text-destructive mt-1">{error}</p>}
    </div>
  );
}
