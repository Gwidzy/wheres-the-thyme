export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  category: string;
  description: string;
  createdAt: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  projectId: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}

export interface ActiveTimer {
  taskId: string;
  projectId: string;
  startTime: number;
}