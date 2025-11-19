import { Priority } from './priorityEnum';

export interface TaskRequest {
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date;
  projectId: number;
}
