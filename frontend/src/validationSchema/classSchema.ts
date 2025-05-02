import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  userIds: Yup.array()
    .of(Yup.string().uuid('Invalid UUID format'))
    .min(1, 'At least one user ID is required')
    .required('User IDs are required'),
});

export default validationSchema