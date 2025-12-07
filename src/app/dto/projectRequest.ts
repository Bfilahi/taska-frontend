import { Priority } from "../enum/priorityEnum";
import { Status } from "../enum/statusEnum";

export interface ProjectRequest{
    name: string;
    description: string;
    dueDate: Date | null;
    priority: Priority;
    status?: Status;
}