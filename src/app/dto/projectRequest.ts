import { Priority } from "./priorityEnum";

export interface ProjectRequest{
    name: string;
    description: string;
    dueDate: Date;
    priority: Priority
}