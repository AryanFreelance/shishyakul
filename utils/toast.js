import toast from "react-hot-toast";

const successToast = (message) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 5000,
    // hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    // progress: undefined,
  });
};

const errorToast = (message) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 5000,
    // hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    // progress: undefined,
  });
};

export { successToast, errorToast };
