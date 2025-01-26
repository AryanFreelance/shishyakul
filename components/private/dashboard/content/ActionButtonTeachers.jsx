import React from "react";
import EditContentButton from "./EditContentButton";
import DeleteContentButton from "./DeleteContentButton";

const ActionButtonTeachers = ({ type, id, data }) => {
  return (
    <div className="flex w-full justify-evenly items-center gap-2 mt-4">
      <EditContentButton type={type} id={id} data={data} />
      <DeleteContentButton type={type} id={id} />
    </div>
  );
};

export default ActionButtonTeachers;
