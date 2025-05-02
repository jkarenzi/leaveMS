import * as Yup from "yup";

export const taskSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required"),
    status: Yup.string().oneOf(["to_do", "in_progress", "completed", "stuck"], "Invalid status").required("Status is required"),
    priorityLevel: Yup.mixed<"low" | "medium" | "high">().oneOf(["low", "medium", "high"], "Invalid priority level").required("Priority level is required"),
    userId: Yup.string().uuid().required("User ID is required"),
    groupId: Yup.string().uuid().required("Group ID is required"),
    dueDate: Yup.date().required("Due date is required").min(new Date(), "Due date must be in the future")
})  

export const updateTaskSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required"),
    status: Yup.string().oneOf(["to_do", "in_progress", "completed", "stuck"], "Invalid status").required("Status is required"),
    priorityLevel: Yup.mixed<"low" | "medium" | "high">().oneOf(["low", "medium", "high"], "Invalid priority level").required("Priority level is required"),
    userId: Yup.string().uuid().required("User ID is required"),
    groupId: Yup.string().uuid().required("Group ID is required"),
    dueDate: Yup.date().typeError("Due date must be a valid date").required("Due date is required")
})
