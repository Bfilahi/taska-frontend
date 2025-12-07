import { Priority } from "../enum/priorityEnum";
import { Status } from "../enum/statusEnum";

export interface ProjectResponse{
    id: number;
    name: string;
    description: string;
    startDate: Date;
    dueDate: Date;
    priority: Priority;
    status: Status;
    progress: number;
}