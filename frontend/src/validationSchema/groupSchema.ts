import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  assignmentId: Yup.string().uuid().required('Assignment ID is required'),
  userIds: Yup.array()
      .of(Yup.string().uuid('Invalid UUID format'))
      .min(1, 'At least one user ID is required')
      .required('User IDs are required'),
})