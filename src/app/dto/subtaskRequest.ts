import { Priority } from '../enum/priorityEnum';
import { Status } from '../enum/statusEnum';

export interface SubtaskRequest {
  title: string;
  description: string;
  priority: Priority;
  status?: Status;
  dueDate: Date;
  taskId: number;
}
