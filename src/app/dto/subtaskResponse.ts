import { Priority } from './priorityEnum';

export interface SubtaskResponse {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date;
  isCompleted: boolean;
  projectId: number;
  taskId: number;
}
