import React from "react";
import EditContentButton from "./EditContentButton";
import DeleteContentButton from "./DeleteContentButton";

const ActionButtonTeachers = ({ type }) => {
  return (
    <div className="flex w-full justify-evenly items-center gap-2 mt-4">
      <EditContentButton type={type} id="123" />
      <DeleteContentButton type={type} id="123" />
    </div>
  );
};

export default ActionButtonTeachers;
