import React, { useState, useEffect, useMemo } from 'react';
import type { ActiveTimer, Task, Project } from '../types';

interface TimerProps {
  activeTimer: ActiveTimer | null;
  tasks: Task[];
  projects: Project[];
  onStopTimer: () => void;
}

const Timer: React.FC<TimerProps> = ({ activeTimer, tasks, projects, onStopTimer }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        setElapsedSeconds(seconds);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  const trackedTaskInfo = useMemo(() => {
    if (!activeTimer) return null;
    const task = tasks.find(t => t.id === activeTimer.taskId);
    const project = projects.find(p => p.id === activeTimer.projectId);
    return { task, project };
  }, [activeTimer, tasks, projects]);

  const taskDisplayName = useMemo(() => {
      if (!trackedTaskInfo?.task) return 'Loading task...';
      return `[${trackedTaskInfo.task.category}] ${trackedTaskInfo.task.description}`;
  }, [trackedTaskInfo]);


  if (!activeTimer) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary/80 backdrop-blur-md border-t border-border-color z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 overflow-hidden">
            <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="overflow-hidden">
                <p className="text-text-main font-semibold truncate" title={taskDisplayName}>
                    {taskDisplayName}
                </p>
                <p className="text-text-secondary text-sm truncate" title={trackedTaskInfo?.project?.name}>
                    Project: {trackedTaskInfo?.project?.name || '...'}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-xl font-mono text-text-main w-28 text-center">{formatTime(elapsedSeconds)}</p>
          <button
            onClick={onStopTimer}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;