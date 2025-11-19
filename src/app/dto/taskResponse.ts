import { Priority } from "./priorityEnum";

export interface TaskResponse{
    id: number;
    title: string;
    description: string;
    priority: Priority;
    dueDate: Date;
    isCompleted: boolean;
    projectId: number;
    subtaskIds: number[]
}