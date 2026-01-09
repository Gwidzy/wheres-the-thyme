import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Project, Task, TimeEntry, ActiveTimer } from './types';
import Header from './components/Header';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import Timer from './components/Timer';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('timeEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => {
      const saved = localStorage.getItem('activeTimer');
      return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<'dashboard' | 'project'>('dashboard');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);
  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [activeTimer]);

  const addProject = (name: string) => {
    const newProject: Project = { id: crypto.randomUUID(), name, createdAt: Date.now() };
    setProjects(prev => [...prev, newProject]);
  };
  
  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
        addProject(newProjectName.trim());
        setNewProjectName('');
        setIsProjectModalOpen(false);
    }
  };

  const addTask = (projectId: string, category: string, description: string) => {
    const newTask: Task = { id: crypto.randomUUID(), projectId, category, description, createdAt: Date.now(), isCompleted: false };
    setTasks(prev => [...prev, newTask]);
  };

  const editTask = (taskId: string, newCategory: string, newDescription: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId 
            ? { ...task, category: newCategory, description: newDescription } 
            : task
    ));
  };

  const editTimeEntry = (timeEntryId: string, newDurationInSeconds: number) => {
    setTimeEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.id === timeEntryId) {
          return {
            ...entry,
            duration: newDurationInSeconds,
            endTime: entry.startTime + newDurationInSeconds * 1000,
          };
        }
        return entry;
      })
    );
  };
  
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
            const isCompleted = !task.isCompleted;
            return {
                ...task,
                isCompleted,
                completedAt: isCompleted ? Date.now() : undefined,
            };
        }
        return task;
    }));
  };

  const startTimer = useCallback((taskId: string, projectId: string) => {
    if (!activeTimer) {
      setActiveTimer({ taskId, projectId, startTime: Date.now() });
    }
  }, [activeTimer]);

  const stopTimer = useCallback(() => {
    if (activeTimer) {
      const endTime = Date.now();
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        taskId: activeTimer.taskId,
        projectId: activeTimer.projectId,
        startTime: activeTimer.startTime,
        endTime,
        duration: Math.round((endTime - activeTimer.startTime) / 1000),
      };
      setTimeEntries(prev => [...prev, newEntry]);
      setActiveTimer(null);
    }
  }, [activeTimer]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);
  
  const tasksForSelectedProject = useMemo(() => {
    return tasks.filter(t => t.projectId === selectedProjectId).sort((a,b) => a.createdAt - b.createdAt);
  }, [tasks, selectedProjectId]);


  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setView('project');
  };
  
  const handleViewChange = (newView: 'dashboard' | 'project') => {
    if (newView === 'project' && !selectedProjectId && projects.length > 0) {
        setSelectedProjectId(projects[0].id);
    }
    setView(newView);
  };
  
  const handleNavigateToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('project');
  };

  return (
    <div className="bg-primary text-text-main min-h-screen flex flex-col font-sans">
      <Header currentView={view} onViewChange={handleViewChange}/>
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {view === 'project' && (
            <ProjectList
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={handleSelectProject}
                onAddProject={() => setIsProjectModalOpen(true)}
            />
        )}
        
        {view === 'dashboard' ? (
          <Dashboard 
            projects={projects} 
            tasks={tasks} 
            timeEntries={timeEntries}
            onNavigateToProject={handleNavigateToProject}
          />
        ) : (
          <ProjectView
            project={selectedProject}
            tasks={tasksForSelectedProject}
            allTasks={tasks}
            timeEntries={timeEntries}
            activeTimer={activeTimer}
            onAddTask={addTask}
            onEditTask={editTask}
            onStartTimer={startTimer}
            onToggleTaskCompletion={toggleTaskCompletion}
            onEditTimeEntry={editTimeEntry}
          />
        )}
      </div>
      <Timer
        activeTimer={activeTimer}
        tasks={tasks}
        projects={projects}
        onStopTimer={stopTimer}
      />
      <div className={`${activeTimer ? 'pb-20' : ''}`}></div>

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Add New Project">
        <form onSubmit={handleAddProjectSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
              <input
                type="text"
                id="projectName"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                className="w-full bg-primary text-text-main px-3 py-2 border border-border-color rounded-md focus:ring-accent focus:border-accent"
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Create Project
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;