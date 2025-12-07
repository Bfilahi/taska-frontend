import { Priority } from '../enum/priorityEnum';
import { Status } from '../enum/statusEnum';

export interface TaskRequest {
  title: string;
  description: string;
  priority: Priority;
  status?: Status;
  dueDate: Date;
  projectId: number;
}
