import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrashIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const ProfileSiblingInformation = ({
  tempSiblingInformation,
  setTempSiblingInformation,
  siblingInformation,
  setSiblingInformation,
}) => {
  const [isAddingSiblingDialogOpen, setIsAddingSiblingDialogOpen] =
    useState(false);

  const addSiblingInformation = (e) => {
    e.preventDefault();
    if (
      tempSiblingInformation.siblingName === "" ||
      tempSiblingInformation.age === 0 ||
      tempSiblingInformation.status === "" ||
      tempSiblingInformation.organization === ""
    ) {
      toast.error("Please fill all the fields!");
      return;
    }
    setSiblingInformation([
      ...siblingInformation,
      {
        siblingName: tempSiblingInformation.siblingName,
        age: parseInt(tempSiblingInformation.age),
        status: tempSiblingInformation.status,
        organization: tempSiblingInformation.organization,
      },
    ]);
    setTempSiblingInformation({
      siblingName: "",
      age: 0,
      status: "",
      organization: "",
    });
    setIsAddingSiblingDialogOpen(false);
  };

  const deleteSiblingInformationHandler = (e, siblingName) => {
    e.preventDefault();
    const updatedSiblingInformation = siblingInformation.filter(
      (sibling) => sibling.siblingName !== siblingName
    );
    setSiblingInformation(updatedSiblingInformation);
    toast.success("Sibling Deleted! To undo action just reload the page.");
  };

  return (
    <div className="m-2 p-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h3 className="subsubheading text-secondary">Sibilings Information</h3>
        <Dialog
          open={isAddingSiblingDialogOpen}
          onOpenChange={setIsAddingSiblingDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex gap-3 items-center mt-2 md:mt-0"
            >
              Add <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Sibling</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter name..."
                  className="col-span-3"
                  value={tempSiblingInformation.siblingName}
                  onChange={(e) =>
                    setTempSiblingInformation({
                      ...tempSiblingInformation,
                      siblingName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right">
                  Age
                </Label>
                <Input
                  id="age"
                  placeholder="Enter age..."
                  className="col-span-3"
                  value={tempSiblingInformation.age}
                  onChange={(e) =>
                    setTempSiblingInformation({
                      ...tempSiblingInformation,
                      age: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Input
                  id="status"
                  placeholder="Studying / Working..."
                  className="col-span-3"
                  value={tempSiblingInformation.status}
                  onChange={(e) =>
                    setTempSiblingInformation({
                      ...tempSiblingInformation,
                      status: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school-org" className="text-right">
                  School / Organization
                </Label>
                <Input
                  id="school-org"
                  placeholder="Enter school/organization..."
                  className="col-span-3"
                  value={tempSiblingInformation.organization}
                  onChange={(e) =>
                    setTempSiblingInformation({
                      ...tempSiblingInformation,
                      organization: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={addSiblingInformation}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="barlow-semibold w-[100px]">
                Sr No.
              </TableHead>
              <TableHead className="barlow-semibold">Name</TableHead>
              <TableHead className="barlow-semibold">Age</TableHead>
              <TableHead className="barlow-semibold">Status</TableHead>
              <TableHead className="barlow-semibold">
                School / Organization
              </TableHead>
              <TableHead className="barlow-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siblingInformation.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No sibling information found.
                </TableCell>
              </TableRow>
            )}
            {siblingInformation.map((sibling, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{sibling.siblingName}</TableCell>
                <TableCell>{sibling.age}</TableCell>
                <TableCell>{sibling.status}</TableCell>
                <TableCell>{sibling.organization}</TableCell>
                <TableCell>
                  <Button
                    onClick={(e) =>
                      deleteSiblingInformationHandler(e, sibling.siblingName)
                    }
                  >
                    <TrashIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProfileSiblingInformation;
