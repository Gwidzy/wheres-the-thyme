import React, { useState, useMemo, useEffect, Dispatch, SetStateAction } from 'react';
import type { Project, Task, TimeEntry, ActiveTimer } from '../types';
import Modal from './Modal';
import CategoryDropdown from './CategoryDropdown';
import CustomNumberInput from './CustomNumberInput';

interface ProjectViewProps {
  project: Project | undefined;
  tasks: Task[];
  allTasks: Task[];
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  onAddTask: (projectId: string, category: string, description: string) => void;
  onEditTask: (taskId: string, category: string, description: string) => void;
  onStartTimer: (taskId: string, projectId: string) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onEditTimeEntry: (timeEntryId: string, newDurationInSeconds: number) => void;
}

const TaskItem: React.FC<{
    task: Task;
    timeEntries: TimeEntry[];
    isTimerActiveForThisTask: boolean;
    isAnyTimerActive: boolean;
    onStartTimer: (taskId: string) => void;
    onEdit: (task: Task) => void;
    onToggleTaskCompletion: (taskId: string) => void;
}> = ({ task, timeEntries, isTimerActiveForThisTask, isAnyTimerActive, onStartTimer, onEdit, onToggleTaskCompletion }) => {
    const totalTimeForTask = useMemo(() => {
        return timeEntries
            .filter(entry => entry.taskId === task.id)
            .reduce((sum, entry) => sum + entry.duration, 0);
    }, [timeEntries, task.id]);

    const formatDuration = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours === 0 && minutes === 0 && totalSeconds < 60) return "Not tracked";
        return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
    };

    return (
        <li className={`bg-secondary p-4 rounded-lg flex justify-between items-center transition-all hover:shadow-lg ${task.isCompleted ? 'opacity-60' : ''}`}>
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                 <button 
                    onClick={() => onToggleTaskCompletion(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-accent border-accent' : 'border-border-color hover:border-accent'}`}
                    aria-label={task.isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
                >
                    {task.isCompleted && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                </button>
                <div className="min-w-0">
                    <p className={`text-text-main font-medium truncate ${task.isCompleted ? 'line-through' : ''}`} title={`[${task.category}] ${task.description}`}>
                        <span className="font-bold text-accent mr-2">[{task.category}]</span>
                        {task.description}
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                        Total Time: {formatDuration(totalTimeForTask)}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                 <button
                    onClick={() => onEdit(task)}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                    aria-label={`Edit task: ${task.description}`}
                >
                    Edit
                </button>
                <button
                    onClick={() => onStartTimer(task.id)}
                    disabled={isAnyTimerActive || task.isCompleted}
                    className={`text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 ${
                        isTimerActiveForThisTask 
                            ? 'bg-gray-500 cursor-not-allowed'
                            : (isAnyTimerActive || task.isCompleted)
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    <span>{isTimerActiveForThisTask ? 'Running' : 'Start'}</span>
                </button>
            </div>
        </li>
    );
};

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterButtonGroupProps<T extends string> {
  label: string;
  options: ReadonlyArray<FilterOption<T>>;
  selectedValue: T;
  // FIX: Updated onChange to match the type of a React state setter (Dispatch<SetStateAction<T>>)
  // This resolves the type errors when passing state setters like `setFilterStatus` to this component.
  onChange: Dispatch<SetStateAction<T>>;
}

const FilterButtonGroup = <T extends string>({ label, options, selectedValue, onChange }: FilterButtonGroupProps<T>) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-text-secondary font-medium whitespace-nowrap">{label}:</label>
      <div className="flex items-center space-x-1 bg-primary p-1 rounded-lg">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              selectedValue === option.value
                ? 'bg-accent text-white shadow-md'
                : 'text-text-secondary hover:bg-secondary hover:text-text-main'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};


const ProjectView: React.FC<ProjectViewProps> = ({ project, tasks, allTasks, timeEntries, activeTimer, onAddTask, onEditTask, onStartTimer, onToggleTaskCompletion, onEditTimeEntry }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedCategory, setEditedCategory] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  const [editedHours, setEditedHours] = useState('');
  const [editedMinutes, setEditedMinutes] = useState('');

  // Filtering, Sorting, and Grouping State
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('incomplete');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [filterHasTime, setFilterHasTime] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [groupBy, setGroupBy] = useState<'none' | 'category'>('none');

  useEffect(() => {
    if (editingTask) {
        setEditedCategory(editingTask.category);
        setEditedDescription(editingTask.description);
    }
  }, [editingTask]);

  useEffect(() => {
    if (editingTimeEntry) {
      const { duration } = editingTimeEntry;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      setEditedHours(String(hours));
      setEditedMinutes(String(minutes));
    }
  }, [editingTimeEntry]);

  const uniqueCategories = useMemo(() => {
    const categories = allTasks.map(t => t.category);
    return [...new Set(categories)].filter(Boolean);
  }, [allTasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskCategory.trim() && newTaskDescription.trim() && project) {
      onAddTask(project.id, newTaskCategory.trim(), newTaskDescription.trim());
      setNewTaskCategory('');
      setNewTaskDescription('');
      setIsTaskModalOpen(false);
    }
  };
  
  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedCategory.trim() && editedDescription.trim() && editingTask) {
        onEditTask(editingTask.id, editedCategory.trim(), editedDescription.trim());
        setEditingTask(null);
    }
  };

  const handleEditTimeEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeEntry) return;

    const hours = parseInt(editedHours, 10) || 0;
    const minutes = parseInt(editedMinutes, 10) || 0;
    
    if (hours < 0 || minutes < 0 || minutes > 59) {
        return;
    }

    const newDurationInSeconds = (hours * 3600) + (minutes * 60);
    onEditTimeEntry(editingTimeEntry.id, newDurationInSeconds);
    setEditingTimeEntry(null);
  };

  const projectTimeEntries = useMemo(() => {
    return timeEntries
        .filter(entry => entry.projectId === project?.id)
        .sort((a, b) => b.endTime - a.endTime);
  }, [timeEntries, project]);

  const filteredAndSortedTasks = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    let processedTasks = [...tasks];
    
    // Filter by status
    if (filterStatus === 'completed') processedTasks = processedTasks.filter(t => t.isCompleted);
    if (filterStatus === 'incomplete') processedTasks = processedTasks.filter(t => !t.isCompleted);
    
    // Filter by date
    if (filterDate === 'today') processedTasks = processedTasks.filter(t => (now - t.createdAt) < oneDay);
    if (filterDate === '7days') processedTasks = processedTasks.filter(t => (now - t.createdAt) < 7 * oneDay);
    if (filterDate === '30days') processedTasks = processedTasks.filter(t => (now - t.createdAt) < 30 * oneDay);

    // Filter by category
    if (filterCategory !== 'all') processedTasks = processedTasks.filter(t => t.category === filterCategory);

    // Filter by has time
    if (filterHasTime) {
      const tasksWithTime = new Set(timeEntries.map(entry => entry.taskId));
      processedTasks = processedTasks.filter(t => tasksWithTime.has(t.id));
    }

    // Sort
    processedTasks.sort((a, b) => {
      return sortBy === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
    });

    return processedTasks;

  }, [tasks, filterStatus, filterDate, filterCategory, filterHasTime, sortBy, timeEntries]);
  
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') return null;

    // FIX: Replaced reduce with a for...of loop for more stable type inference.
    const groups: Record<string, Task[]> = {};
    for (const task of filteredAndSortedTasks) {
      const key = task.category || 'Uncategorized';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    }
    return groups;
  }, [filteredAndSortedTasks, groupBy]);


  if (!project) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-border-color" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <h2 className="mt-4 text-2xl font-bold text-text-main">Select a Project</h2>
          <p className="text-text-secondary mt-2">Choose a project from the sidebar to view its tasks and track time.</p>
        </div>
      </div>
    );
  }
  
  const renderTaskItems = (tasksToRender: Task[]) => (
    tasksToRender.map(task => (
      <TaskItem
          key={task.id}
          task={task}
          timeEntries={timeEntries}
          isTimerActiveForThisTask={activeTimer?.taskId === task.id}
          isAnyTimerActive={activeTimer !== null}
          onStartTimer={(taskId) => onStartTimer(taskId, project.id)}
          onEdit={setEditingTask}
          onToggleTaskCompletion={onToggleTaskCompletion}
      />
    ))
  );
  
  const statusOptions = [
    { value: 'incomplete', label: 'Incomplete' },
    { value: 'completed', label: 'Completed' },
    { value: 'all', label: 'All' },
  ] as const;

  const dateOptions = [
      { value: 'all', label: 'All Time' },
      { value: 'today', label: 'Today' },
      { value: '7days', label: '7 Days' },
      { value: '30days', label: '30 Days' },
  ] as const;

  const sortOptions = [
      { value: 'newest', label: 'Newest' },
      { value: 'oldest', label: 'Oldest' },
  ] as const;

  const groupOptions = [
      { value: 'none', label: 'None' },
      { value: 'category', label: 'Category' },
  ] as const;

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-main">{project.name}</h1>
          <p className="text-text-secondary">
            Created on: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </header>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-text-main">Tasks</h2>
            <button onClick={() => setIsTaskModalOpen(true)} className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span>Add Task</span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="bg-secondary p-4 rounded-lg mb-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm">
            <FilterButtonGroup
              label="Show"
              options={statusOptions}
              selectedValue={filterStatus}
              onChange={setFilterStatus}
            />
            <FilterButtonGroup
              label="Date"
              options={dateOptions}
              selectedValue={filterDate}
              onChange={setFilterDate}
            />
            <FilterButtonGroup
              label="Sort"
              options={sortOptions}
              selectedValue={sortBy}
              onChange={setSortBy}
            />
            <FilterButtonGroup
              label="Group"
              options={groupOptions}
              selectedValue={groupBy}
              onChange={setGroupBy}
            />

            <div className="flex items-center space-x-2">
              <label htmlFor="category-filter" className="text-text-secondary font-medium">Category:</label>
              <div className="relative">
                <select
                  id="category-filter"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-primary border border-border-color text-text-main rounded-md px-3 py-1.5 focus:ring-accent focus:border-accent appearance-none pr-8"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <label htmlFor="hasTime" className="flex items-center space-x-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${filterHasTime ? 'bg-accent border-accent' : 'border-border-color group-hover:border-accent'}`}>
                    {filterHasTime && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                </div>
                <input
                    type="checkbox"
                    id="hasTime"
                    checked={filterHasTime}
                    onChange={e => setFilterHasTime(e.target.checked)}
                    className="sr-only"
                />
                <span className="text-text-secondary font-medium group-hover:text-text-main transition-colors">Has time</span>
            </label>
          </div>


          {filteredAndSortedTasks.length > 0 ? (
            <ul className="space-y-3">
              {groupedTasks ? (
                Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                  <li key={groupName}>
                    <h3 className="text-accent font-bold text-lg mb-2 pl-1">{groupName}</h3>
                    <ul className="space-y-3 pl-4 border-l-2 border-border-color">
                      {renderTaskItems(groupTasks)}
                    </ul>
                  </li>
                ))
              ) : (
                renderTaskItems(filteredAndSortedTasks)
              )}
            </ul>
          ) : (
            <div className="text-center py-8 bg-primary rounded-lg">
                <p className="text-text-secondary">No tasks match your filters.</p>
            </div>
          )}
        </section>

        <section>
            <h2 className="text-2xl font-semibold text-text-main mb-4">Time Log</h2>
            <div className="bg-primary rounded-lg shadow-inner">
                {projectTimeEntries.length > 0 ? (
                    <ul className="divide-y divide-border-color">
                        {projectTimeEntries.map(entry => {
                            const task = allTasks.find(t => t.id === entry.taskId);
                            const duration = entry.duration;
                            const hours = Math.floor(duration / 3600).toString().padStart(2, '0');
                            const minutes = Math.floor((duration % 3600) / 60).toString().padStart(2, '0');
                            const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
                            const taskDisplayName = task ? `[${task.category}] ${task.description}` : "Unknown Task";

                            return (
                                <li key={entry.id} className="p-4 flex justify-between items-center group">
                                    <div>
                                        <p className="font-semibold text-text-main truncate" title={taskDisplayName}>{taskDisplayName}</p>
                                        <p className="text-sm text-text-secondary">{new Date(entry.startTime).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <p className="font-mono text-text-main">{`${hours}:${minutes}:${seconds}`}</p>
                                        <button
                                            onClick={() => setEditingTimeEntry(entry)}
                                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded-lg transition-all text-sm"
                                            aria-label="Edit time entry"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-text-secondary">No time logged for this project yet.</p>
                    </div>
                )}
            </div>
        </section>

      </div>
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add New Task">
        <form onSubmit={handleAddTask}>
          <div className="space-y-4">
            <div>
              <label htmlFor="taskCategory" className="block text-sm font-medium text-text-secondary mb-1">Category</label>
              <CategoryDropdown
                 value={newTaskCategory}
                 onChange={setNewTaskCategory}
                 categories={uniqueCategories}
                 placeholder="e.g., Development"
              />
            </div>
            <div>
              <label htmlFor="taskDescription" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <input
                type="text"
                id="taskDescription"
                value={newTaskDescription}
                onChange={e => setNewTaskDescription(e.target.value)}
                className="w-full bg-primary text-text-main px-3 py-2 border border-border-color rounded-md focus:ring-accent focus:border-accent"
                placeholder="e.g., Implement user authentication"
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Create Task
              </button>
            </div>
          </div>
        </form>
      </Modal>

    <Modal isOpen={editingTask !== null} onClose={() => setEditingTask(null)} title="Edit Task">
        <form onSubmit={handleEditTask}>
            <div className="space-y-4">
            <div>
              <label htmlFor="editTaskCategory" className="block text-sm font-medium text-text-secondary mb-1">Category</label>
               <CategoryDropdown
                 value={editedCategory}
                 onChange={setEditedCategory}
                 categories={uniqueCategories}
              />
            </div>
            <div>
              <label htmlFor="editTaskDescription" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <input
                type="text"
                id="editTaskDescription"
                value={editedDescription}
                onChange={e => setEditedDescription(e.target.value)}
                className="w-full bg-primary text-text-main px-3 py-2 border border-border-color rounded-md focus:ring-accent focus:border-accent"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setEditingTask(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editingTimeEntry !== null} onClose={() => setEditingTimeEntry(null)} title="Edit Time Entry">
        <form onSubmit={handleEditTimeEntrySubmit}>
          <div className="space-y-4">
            <div>
              <p className="text-text-secondary mb-2">
                Task:{' '}
                <span className="font-semibold text-text-main">
                  {editingTimeEntry ? (allTasks.find(t => t.id === editingTimeEntry.taskId)?.description ?? 'Unknown Task') : ''}
                </span>
              </p>
            </div>
            <div className="flex items-start space-x-4">
              <CustomNumberInput
                id="editedHours"
                label="Hours"
                value={editedHours}
                onChange={setEditedHours}
                min={0}
              />
              <CustomNumberInput
                id="editedMinutes"
                label="Minutes"
                value={editedMinutes}
                onChange={setEditedMinutes}
                min={0}
                max={59}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setEditingTimeEntry(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default ProjectView;
