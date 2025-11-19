import { Priority } from './priorityEnum';

export interface SubtaskRequest {
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date;
  projectId: number;
  taskId: number;
}
