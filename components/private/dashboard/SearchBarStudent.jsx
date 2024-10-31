import { SearchIcon } from "lucide-react";
import React from "react";

const SearchBarStudent = ({ studentName, setStudentName }) => {
  return (
    <form className="flex items-center gap-2 border-2 rounded-full md:rounded-r-none px-4 py-2 border-main md:border-r-slate-600">
      <button t Fype="submit" className="border-none outline-none">
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
