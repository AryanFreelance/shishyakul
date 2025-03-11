"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxGroup } from "@/components/private/dashboard/members/CheckboxGroup";
import { Loader2 } from "lucide-react";

export function MemberDialog({
  open,
  onOpenChange,
  onSave,
  member,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roles: {
      Attendance: false,
      Tests: false,
      Fees: false,
      "Manage Students": false,
      Content: false,
      Members: false,
    },
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        roles: { ...member.roles },
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        roles: {
          Attendance: false,
          Tests: false,
          Fees: false,
          "Manage Students": false,
          Content: false,
          Members: false,
        },
      });
    }
  }, [member, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role, checked) => {
    setFormData((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: checked,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset Form Data
    setFormData({
      name: "",
      email: "",
      phone: "",
      roles: {
        Attendance: false,
        Tests: false,
        Fees: false,
        "Manage Students": false,
        Content: false,
        Members: false,
      },
    });

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="sm:text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="sm:col-span-3"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="email" className="sm:text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="sm:col-span-3"
                required
                disabled={isLoading || member}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="phone" className="sm:text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="sm:col-span-3"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label className="sm:text-right pt-2">Roles</Label>
              <div className="sm:col-span-3 space-y-2">
                <CheckboxGroup
                  roles={[
                    "Attendance",
                    "Tests",
                    "Fees",
                    "Manage Students",
                    "Content",
                    "Members",
                  ]}
                  selectedRoles={formData.roles}
                  onChange={handleRoleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {member ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
