import { SearchIcon } from "lucide-react";
import React, { useEffect } from "react";

const SearchBarStudent = ({ studentName, setStudentName }) => {
  // Update sessionStorage when studentName changes
  useEffect(() => {
    if (studentName) {
      sessionStorage.setItem("studentName", studentName);
    } else {
      sessionStorage.removeItem("studentName");
    }
  }, [studentName]);

  return (
    <form className="flex items-center gap-2 border-2 rounded-full md:rounded-r-none px-4 py-2 border-main md:border-r-slate-600">
      <button type="submit" className="border-none outline-none">
        <SearchIcon />
      </button>
      <input
        type="text"
        placeholder="Enter Student Name..."
        className="w-full py-1 bg-transparent outline-none border-none text-secondary"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
    </form>
  );
};

export default SearchBarStudent;
