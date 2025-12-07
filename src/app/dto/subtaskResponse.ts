import { Priority } from "../enum/priorityEnum";
import { Status } from "../enum/statusEnum";

export interface SubtaskResponse {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status,
  dueDate: Date;
  taskId: number;
}
