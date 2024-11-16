"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DELETE_STUDENTS_IN_BULK,
  DELETE_TEMP_STUDENT,
} from "@/graphql/mutations/students.mutation";
import { GET_TEMP_STUDENTS } from "@/graphql/queries/students.query";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { set } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Repeat,
  SearchIcon,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TempStudentsComp = () => {
  const [onePageTempStudent, setOnePageTempStudent] = useState([]);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [searchEmail, setSearchEmail] = useState("");
  const [filteredTempStudents, setFilteredTempStudents] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  // const pageSize = 20;

  const { data: tempStudents } = useSuspenseQuery(GET_TEMP_STUDENTS);

  const [deleteTempStudent] = useMutation(DELETE_TEMP_STUDENT, {
    refetchQueries: [{ query: GET_TEMP_STUDENTS }],
  });

  const [bulkDeleteTempStudents] = useMutation(DELETE_STUDENTS_IN_BULK, {
    refetchQueries: [{ query: GET_TEMP_STUDENTS }],
  });

  const deleteTempStudentHandler = async (email) => {
    const toastId = toast.loading("Deleting Student...");

    await deleteTempStudent({ variables: { email: email } });

    toast.success("Temporary Student Deleted Successfully!", {
      id: toastId,
    });
    setSearchEmail("");
  };

  const handleSearchTempStudent = (e) => {
    const value = e.target.value;
    setSearchEmail(value);
    const filteredTempStudents = tempStudents?.tempStudents.filter((student) =>
      student.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTempStudents(filteredTempStudents);
  };

  useEffect(() => {
    setFilteredTempStudents(tempStudents?.tempStudents);
  }, [tempStudents]);

  const handleCheckboxChange = (email) => {
    setSelectedEmails((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email); // Remove email if already selected
      } else {
        return [...prev, email]; // Add email if not selected
      }
    });
    // console.log("SELECTED", selectedEmails);
  };

  const bulkDeleteVerifications = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Deleting Temp Student(s)...");
    // console.log("EMAILS", selectedEmails);

    await bulkDeleteTempStudents({
      variables: {
        emails: selectedEmails,
      },
    })
      .then((resp) => {
        if (resp.bulkDeleteTempStudents === "SUCCESS") {
          setSelectedEmails([]);
          toast.success("Temp Student(s) Deleted Successfully!", {
            id: loadingToast,
          });
        } else {
          toast.error("There was an error deleting temp student(s)!", {
            id: loadingToast,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("There was an error deleting temp student(s)!", {
          id: loadingToast,
        });
      });
  };

  const resendVerificationCode = async (e, studEmail, verificationCode) => {
    e.preventDefault();
    const loading = toast.loading(
      "ReSending Verification Code to the Student..."
    );

    const domain = window.location.origin;

    const inviteResp = await fetch("/api/invite", {
      method: "POST",
      body: JSON.stringify({
        email: studEmail,
        r_message: `Sign Up Link - ${domain}/register/${verificationCode}`,
        r_code: verificationCode,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // console.log("INVITERESP", inviteResp);

    if (inviteResp.status !== 200) {
      toast.error("Failed to resend invite. Please try again.", {
        id: loading,
      });
      // setOpenAddStudentDialog(false);
      return;
    }

    toast.success("Invite Resend to the Student Successfully!", {
      id: loading,
    });
  };

  useEffect(() => {
    if (filteredTempStudents) {
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const slicedTempStudents = filteredTempStudents.slice(
        startIndex,
        endIndex
      );

      setOnePageTempStudent(slicedTempStudents);
      setPages(Math.ceil(filteredTempStudents.length / pageSize));

      // console.log("Sliced Temp Students", slicedTempStudents);
      // console.log("Pages", pages);
      // console.log("Current Page", currentPage);
    }
  }, [filteredTempStudents, currentPage, pageSize]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="subheading">Students Pending</h2>
      </div>
      <div className="my-4 mb-6 text-lg">
        <span>{filteredTempStudents.length} Students Found.</span>
      </div>
      {/* Searchbar */}
      <div className="flex justify-center items-center w-full">
        <div className="w-full max-w-[300px] md:max-w-[600px]">
          <form className="flex items-center gap-2 border-2 rounded-full px-4 py-2 border-main">
            <button type="submit" className="border-none outline-none">
              <SearchIcon />
            </button>
            <input
              type="text"
              placeholder="Enter Student Email..."
              className="w-full py-1 bg-transparent outline-none border-none text-secondary"
              value={searchEmail}
              onChange={handleSearchTempStudent}
            />
          </form>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
        {/* Set the value of the input in the pageSize when the input focus changes */}
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
          className="border-2 border-main bg-transparent px-3 py-1 rounded"
        >
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
        <div className="flex justify-center items-center gap-4 mt-4 md:mt-0">
          <button
            onClick={() => currentPage !== 0 && setCurrentPage(currentPage - 1)}
            className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
            disabled={currentPage === 0}
          >
            <ArrowLeft />
          </button>
          <div className="flex flex-wrap justify-center items-center max-w-[300px] lg:max-w-[600px] gap-4">
            {new Array(pages).fill(0).map((_, index) => (
              <button
                key={index}
                className={`border-2 px-3 py-1 rounded ${
                  index === currentPage
                    ? "text-black border-main"
                    : "border-black/50 hover:border-black"
                }`}
                onClick={() => setCurrentPage(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              currentPage !== pages - 1 && setCurrentPage(currentPage + 1)
            }
            className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
            disabled={currentPage === pages - 1}
          >
            <ArrowRight />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end my-2">
        {selectedEmails.length > 0 && (
          <span className="text-lg">
            {selectedEmails.length} Emails Selected!
          </span>
        )}
        <Button
          disabled={selectedEmails.length === 0}
          onClick={bulkDeleteVerifications}
        >
          Bulk Delete
        </Button>
      </div>
      <div className="my-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="barlow-semibold">SR No.</TableHead>
              <TableHead className="barlow-semibold">Email</TableHead>
              <TableHead className="barlow-semibold">
                Verification Code
              </TableHead>
              <TableHead className="barlow-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tempStudents?.tempStudents.length === 0 &&
              filteredTempStudents?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan="4"
                    className="barlow-semibold text-center"
                  >
                    No pending students
                  </TableCell>
                </TableRow>
              )}
            {filteredTempStudents?.length === 0 &&
              tempStudents?.tempStudents.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan="4"
                    className="barlow-semibold text-center"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              )}
            {onePageTempStudent?.map((tempStudents, index) => (
              <TableRow key={index}>
                <TableCell className="barlow-regular">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(tempStudents.email)}
                      checked={selectedEmails.includes(tempStudents.email)}
                      className="transform scale-150"
                    />
                    {currentPage * pageSize + index + 1}
                  </div>
                </TableCell>
                <TableCell className="barlow-semibold">
                  {tempStudents.email}
                </TableCell>
                <TableCell className="barlow-regular">
                  {tempStudents.verificationCode}
                </TableCell>
                <TableCell className="barlow-regular flex items-center gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="border-2 border-main rounded p-1">
                        <Trash />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteTempStudentHandler(tempStudents.email)
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="border-2 border-main rounded p-1">
                        <Repeat />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Share the verification code again?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          The code will be sent to the shishya's email once you
                          confirm the operation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) =>
                            resendVerificationCode(
                              e,
                              tempStudents.email,
                              tempStudents.verificationCode
                            )
                          }
                        >
                          Resend
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => currentPage !== 0 && setCurrentPage(currentPage - 1)}
          className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
          disabled={currentPage === 0}
        >
          <ArrowLeft />
        </button>
        <div className="flex flex-wrap justify-center items-center max-w-[300px] lg:max-w-[600px] gap-4">
          {new Array(pages).fill(0).map((_, index) => (
            <button
              key={index}
              className={`border-2 px-3 py-1 rounded ${
                index === currentPage
                  ? "text-black border-main"
                  : "border-black/50 hover:border-black"
              }`}
              onClick={() => setCurrentPage(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            currentPage !== pages - 1 && setCurrentPage(currentPage + 1)
          }
          className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
          disabled={currentPage === pages - 1}
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  );
};

export default TempStudentsComp;
