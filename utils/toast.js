import toast from "react-hot-toast";

export const errorToast = (message) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
