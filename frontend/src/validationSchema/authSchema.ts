import * as Yup from 'yup';


export const signupSchema = Yup.object().shape({
    fullName: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    userType: Yup.string()
        .required('User type is required')
        .oneOf(['user', 'instructor'], 'Invalid user type'),
    startYear: Yup.string()
        .oneOf(['2022', '2023', '2024', '2025'], 'Invalid start year')
        .when('userType', {
            is: 'user',
            then: (schema) => schema.required('Start year is required'),
            otherwise: (schema) => schema.optional(),
        }),
    program: Yup.string()
        .oneOf(['BSE', 'BEL'], 'Invalid program')
        .when('userType', {
            is: 'user',
            then: (schema) => schema.required('Program is required'),
            otherwise: (schema) => schema.optional(),
        }),
    intake: Yup.string()
        .oneOf(['January', 'May', 'September'], 'Invalid intake')
        .when('userType', {
            is: 'user',
            then: (schema) => schema.required('Intake is required'),
            otherwise: (schema) => schema.optional(),
        }),
    githubUsername: Yup.string().optional()    
});


export const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 6 characters')
})

export const changePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('This field is required').min(6, 'Password must be at least 6 characters'),
    newPassword: Yup.string().required('This field is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('This field is required'), 
})

export const editProfileSchema = Yup.object().shape({
    fullName: Yup.string().required('Name is required'),
    profileImg: Yup.string().required('Profile Image is required')
})

export const editStudentProfileSchema = Yup.object().shape({
    fullName: Yup.string().required('Name is required'),
    profileImg: Yup.string().required('Profile Image is required'),
    program: Yup.string()
        .oneOf(['BSE', 'BEL'], 'Invalid program')
        .required('Program is  required'),
    githubUsername: Yup.string().optional()    
})