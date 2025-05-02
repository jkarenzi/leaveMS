import * as Yup from "yup";

export const createAssignmentSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  dueDate: Yup.date()
    .required("Due date is required")
    .min(new Date(), "Due date must be in the future"),
  classId: Yup.string().uuid().required('Class is required'),
  technical: Yup.string().required('This field is required')
});

export const updateAssignmentSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  dueDate: Yup.date()
    .required("Due date is required")
    .min(new Date(), "Due date must be in the future"),
  classId: Yup.string().uuid().required('Class is required')
});