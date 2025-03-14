"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storage } from "@/firebase";
import { CREATE_FEE } from "@/graphql/mutations/fees.mutation";
import { GET_STUDENT_DETAILS } from "@/graphql/queries/students.query";
import { useMutation } from "@apollo/client";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { CloudUpload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const AddFeeDialog = ({ id, studData }) => {
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [feeData, setFeeData] = useState({
    feesPaid: "",
    paidOn: "",
    month: "",
    year: "",
    mode: "",
    chequeRefNo: "",
    chequeImgUrl: "",
    upiId: "",
    upiImgUrl: "",
    neftRefNo: "",
  });

  const [createFee] = useMutation(CREATE_FEE, {
    refetchQueries: [
      {
        query: GET_STUDENT_DETAILS,
        variables: {
          ay: studData?.student?.ay,
          grade: studData?.student?.grade,
          userId: id,
        },
      },
    ],
  });

  const addFeeHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding Fee...");
    if (
      !feeData.feesPaid ||
      !feeData.paidOn ||
      !feeData.month ||
      !feeData.year ||
      !feeData.mode
    ) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      setIsFeeDialogOpen(false);
      return;
    }
    // console.log(feeData);

    if (
      feeData.mode === "cheque" &&
      (!feeData.chequeRefNo || !feeData.chequeImgUrl)
    ) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      setIsFeeDialogOpen(false);
      return;
    }
    if (feeData.mode === "upi" && (!feeData.upiId || !feeData.upiImgUrl)) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      setIsFeeDialogOpen(false);
      return;
    }
    if (feeData.mode === "neft" && !feeData.neftRefNo) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      setIsFeeDialogOpen(false);
      return;
    }
    let today = new Date();
    let feeid = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}_${
      today.getHours() < 10 ? "0" + today.getHours() : today.getHours()
    }:${
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()
    }:${
      today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds()
    }`;

    const storageRef = ref(storage, `fee/${feeid}`);

    if (feeData.mode === "cheque" || feeData.mode === "upi") {
      await uploadBytes(
        storageRef,
        feeData.mode === "cheque" ? feeData.chequeImgUrl : feeData.upiImgUrl
      )
        .then(async (snapshot) => {
          const downloadUrl = await getDownloadURL(storageRef);
          // console.log("SNAPSHOT", snapshot);
          // console.log("DOWNLOAD", downloadUrl);
          // feeData.mode === "cheque"
          //   ? setFeeData({ ...feeData, chequeImgUrl: downloadUrl })
          //   : setFeeData({ ...feeData, upiImgUrl: downloadUrl });
          if (feeData.mode === "cheque") {
            // setFeeData({ ...feeData, chequeImgUrl: downloadUrl });
            feeData.chequeImgUrl = downloadUrl;
          } else {
            // setFeeData({ ...feeData, upiImgUrl: downloadUrl });
            feeData.upiImgUrl = downloadUrl;
          }

          // console.log("FEE DATA", feeData);

          // toast.success("Test Paper Added Successfully!", {
          //   id: toastId,
          // });
        })
        .catch((error) => {
          toast.error("Something went wrong!", {
            id: toastId,
          });
          // console.error(error);
          setIsFeeDialogOpen(false);
          return;
        });
    }

    await createFee({
      variables: {
        id: feeid,
        userId: id,
        email: studData?.student.email,
        feesPaid: parseInt(feeData.feesPaid),
        paidOn: feeData.paidOn,
        month: feeData.month,
        year: feeData.year,
        mode: feeData.mode,
        chequeRefNo: feeData.chequeRefNo || "",
        chequeImgUrl: feeData.chequeImgUrl || "",
        upiId: feeData.upiId || "",
        upiImgUrl: feeData.upiImgUrl || "",
        neftRefNo: feeData.neftRefNo || "",
      },
    })
      .then((data) => {
        // console.log(data);
        toast.success("Fee added successfully!", {
          id: toastId,
        });
      })
      .catch((error) => {
        // console.log(error);
        toast.error("There was an error adding fee!", {
          id: toastId,
        });
      });

    setFeeData({
      feesPaid: "",
      paidOn: "",
      month: "",
      year: "",
      mode: "",
      chequeRefNo: "",
      chequeImgUrl: "",
      upiId: "",
      upiImgUrl: "",
      neftRefNo: "",
    });
    setIsFeeDialogOpen(false);
  };
  return (
    <div>
      <Dialog
        open={isFeeDialogOpen}
        onOpenChange={() => {
          setIsFeeDialogOpen(!isFeeDialogOpen);
          // console.log("ISFEEDIALOGOPEN", isFeeDialogOpen);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="border-2">
            Add Fee
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Fee</DialogTitle>
            <DialogDescription>
              Add Fee here, and click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fees-paid" className="text-right">
                Fees Paid
              </Label>
              <Input
                id="fees-paid"
                placeholder="1000"
                className="col-span-3"
                type="number"
                value={feeData.feesPaid}
                onChange={(e) => {
                  setFeeData({
                    ...feeData,
                    feesPaid: e.target.value,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paid-on" className="text-right">
                Paid On
              </Label>
              <Input
                id="paid-on"
                type="date"
                className="col-span-3"
                value={feeData.paidOn}
                onChange={(e) => {
                  setFeeData({
                    ...feeData,
                    paidOn: e.target.value,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month" className="text-right">
                Month
              </Label>
              <Input
                id="month"
                placeholder="January"
                className="col-span-3"
                value={feeData.month}
                onChange={(e) => {
                  setFeeData({
                    ...feeData,
                    month: e.target.value,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>
              <Input
                id="year"
                placeholder="2024"
                className="col-span-3"
                value={feeData.year}
                onChange={(e) => {
                  setFeeData({
                    ...feeData,
                    year: e.target.value,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Paid Via
              </Label>
              <RadioGroup
                value={feeData.mode}
                onValueChange={(e) => setFeeData({ ...feeData, mode: e })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cheque" id="cheque" />
                  <Label htmlFor="cheque">Cheque</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neft" id="neft" />
                  <Label htmlFor="neft">NEFT</Label>
                </div>
              </RadioGroup>
            </div>
            {
              // Cheque Details
              feeData.mode === "cheque" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="chequeRefNo" className="text-right">
                      Ref No.
                    </Label>
                    <Input
                      id="chequeRefNo"
                      className="col-span-3"
                      value={feeData.chequeRefNo}
                      onChange={(e) => {
                        setFeeData({
                          ...feeData,
                          chequeRefNo: e.target.value,
                        });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Image</Label>
                    {feeData.chequeImgUrl === "" ? (
                      <>
                        <Label
                          htmlFor="chequeImage"
                          className="flex justify-center items-center col-span-3 bg-secondary text-primary rounded px-4 py-2 cursor-pointer"
                        >
                          <CloudUpload /> Upload Image
                        </Label>
                        <input
                          id="chequeImage"
                          type="file"
                          accept="image/*"
                          className="col-span-3 hidden"
                          onChange={(e) => {
                            setFeeData({
                              ...feeData,
                              chequeImgUrl: e.target.files[0],
                            });
                            // console.log("FILE", e.target.files[0]);
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <span className="col-span-3">
                          {feeData.chequeImgUrl.name}
                        </span>
                        <div className="col-span-1"></div>
                        <Button
                          variant="nav"
                          className="col-span-3 test-secondary"
                          onClick={() =>
                            setFeeData({
                              ...feeData,
                              chequeImgUrl: "",
                            })
                          }
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )
            }
            {
              // UPI Details
              feeData.mode === "upi" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right">
                      Transaction ID
                    </Label>
                    <Input
                      id="upiId"
                      className="col-span-3"
                      value={feeData.upiId}
                      onChange={(e) => {
                        setFeeData({
                          ...feeData,
                          upiId: e.target.value,
                        });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Image</Label>
                    {feeData.upiImgUrl === "" ? (
                      <>
                        <Label
                          htmlFor="upiImage"
                          className="flex justify-center items-center col-span-3 bg-secondary text-primary rounded px-4 py-2 cursor-pointer"
                        >
                          <CloudUpload /> Upload Image
                        </Label>
                        <input
                          id="upiImage"
                          type="file"
                          accept="image/*"
                          className="col-span-3 hidden"
                          onChange={(e) => {
                            setFeeData({
                              ...feeData,
                              upiImgUrl: e.target.files[0],
                            });
                            // console.log("FILE", e.target.files[0]);
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <span className="col-span-3">
                          {feeData.upiImgUrl.name}
                        </span>
                        <div className="col-span-1"></div>
                        <Button
                          variant="nav"
                          className="col-span-3 test-secondary"
                          onClick={() =>
                            setFeeData({
                              ...feeData,
                              upiImgUrl: "",
                            })
                          }
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )
            }
            {
              // NEFT Details
              feeData.mode === "neft" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="neftRefNo" className="text-right">
                    NEFT Ref No.
                  </Label>
                  <Input
                    id="neftRefNo"
                    className="col-span-3"
                    value={feeData.neftRefNo}
                    onChange={(e) => {
                      setFeeData({
                        ...feeData,
                        neftRefNo: e.target.value,
                      });
                    }}
                  />
                </div>
              )
            }
          </div>
          <DialogFooter>
            <Button type="submit" onClick={addFeeHandler}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddFeeDialog;
