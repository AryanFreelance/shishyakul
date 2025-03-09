"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const StudentFeesInfoDialog = () => {
  const [totalFees, setTotalFees] = useState(0);

  const saveFeeInfoHandler = () => {
    console.log("TOTAL FEES", totalFees);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-2">
          Edit Fee Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Fee Details</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="total-fees">Total Fees</Label>
          <Input
            id="total-fees"
            placeholder="1000"
            value={totalFees}
            onChange={(e) => setTotalFees(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={saveFeeInfoHandler}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFeesInfoDialog;
