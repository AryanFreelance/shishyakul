"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MemberDialog } from "@/components/private/dashboard/members/MemberDialog";
import { MembersList } from "@/components/private/dashboard/members/MembersList";
import { PlusCircle } from "lucide-react";
import {
  saveMember,
  deleteMember,
  subscribeToMembers,
} from "@/firebase/members";
import { toast } from "sonner";

export function MembersManagement() {
  const [members, setMembers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to members collection
    const unsubscribe = subscribeToMembers((updatedMembers) => {
      setMembers(updatedMembers);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleAddMember = async (member) => {
    try {
      setIsLoading(true);
      await saveMember(member);
      setIsDialogOpen(false);
      toast.success("Member added successfully");
    } catch (error) {
      toast.error("Failed to add member");
      console.error("Error adding member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (updatedMember) => {
    try {
      setIsLoading(true);
      await saveMember(updatedMember);
      setIsDialogOpen(false);
      setEditingMember(null);
      toast.success("Member updated successfully");
    } catch (error) {
      toast.error("Failed to update member");
      console.error("Error updating member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (email) => {
    const confirming = confirm("Are you sure you want to delete this member?");
    if (!confirming) return;
    try {
      setIsLoading(true);
      await deleteMember(email);
      toast.success("Member deleted successfully");
    } catch (error) {
      toast.error("Failed to delete member");
      console.error("Error deleting member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <Button onClick={() => setIsDialogOpen(true)} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <MembersList
        members={members}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      <MemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={editingMember ? handleUpdateMember : handleAddMember}
        member={editingMember}
        isLoading={isLoading}
      />
    </div>
  );
}
