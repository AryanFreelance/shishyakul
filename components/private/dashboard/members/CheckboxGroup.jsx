"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxGroup({ roles, selectedRoles, onChange, disabled }) {
  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <div key={role} className="flex items-center space-x-3">
          <Checkbox
            id={`role-${role}`}
            checked={selectedRoles[role]}
            onCheckedChange={(checked) => onChange(role, checked)}
            className="h-5 w-5"
            disabled={disabled}
          />
          <Label
            htmlFor={`role-${role}`}
            className={`cursor-pointer text-sm ${disabled ? "opacity-50" : ""}`}
          >
            {role}
          </Label>
        </div>
      ))}
    </div>
  );
}
