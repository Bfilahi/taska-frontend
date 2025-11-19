import { Priority } from "./priorityEnum";
import { TaskResponse } from "./taskResponse";

export interface ProjectResponse{
    id: number;
    name: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    isCompleted: boolean;
    taskResponses: TaskResponse[]
}