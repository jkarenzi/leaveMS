import * as Yup from "yup";


export const peerAssessmentSchema = Yup.object().shape({
    receiverId: Yup.string()
        .uuid()
        .required("Group member is required"),
    groupId: Yup.string()
        .uuid()
        .required("Group ID is required"),
    involvement: Yup.number()
        .typeError("Involvement score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Involvement score is required"),
    completion: Yup.number()
        .typeError("Completion score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Completion score is required"),
    collaboration: Yup.number()
        .typeError("Collaboration score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Collaboration score is required"),
    leadership: Yup.number()
        .typeError("Leadership score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Leadership score is required"),
    overallContribution: Yup.number()
        .typeError("Overall Contribution score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Overall Contribution score is required"),
    feedback: Yup.string().optional(),
});

export const selfAssessmentSchema = Yup.object().shape({
    groupId: Yup.string()
        .uuid()
        .required("Group ID is required"),
    involvement: Yup.number()
        .typeError("Involvement score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Involvement score is required"),
    completion: Yup.number()
        .typeError("Completion score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Completion score is required"),
    collaboration: Yup.number()
        .typeError("Collaboration score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Collaboration score is required"),
    leadership: Yup.number()
        .typeError("Leadership score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Leadership score is required"),
    overallContribution: Yup.number()
        .typeError("Overall Contribution score must be a number")
        .min(0, 'Score can not be less than zero')
        .max(5, 'Score should not exceed 5')
        .required("Overall Contribution score is required"),
    feedback: Yup.string().optional(),
});