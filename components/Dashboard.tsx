import React, { useMemo, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { Project, Task, TimeEntry } from '../types';
import { getProductivityInsights } from '../services/geminiService';
import Modal from './Modal';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  onNavigateToProject: (projectId: string) => void;
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const hours = (payload[0].value / 3600).toFixed(2);
      return (
        <div className="p-2 bg-secondary border border-border-color rounded-md shadow-lg">
          <p className="font-bold text-text-main">{label}</p>
          <p className="text-text-secondary">{`Time Logged: ${hours} hours`}</p>
        </div>
      );
    }
  
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({ projects, tasks, timeEntries, onNavigateToProject }) => {
  const [insights, setInsights] = useState('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [modalContent, setModalContent] = useState<'insights' | 'projects' | 'tasks' | 'completedTasks' | null>(null);

  const chartData = useMemo(() => {
    const projectTime = projects.map(project => {
      const totalSeconds = timeEntries
        .filter(entry => entry.projectId === project.id)
        .reduce((sum, entry) => sum + entry.duration, 0);
      return { name: project.name, time: totalSeconds };
    });
    return projectTime.filter(p => p.time > 0).sort((a,b) => b.time - a.time);
  }, [projects, timeEntries]);

  const totalTimeTracked = useMemo(() => timeEntries.reduce((sum, entry) => sum + entry.duration, 0), [timeEntries]);
  const totalTasks = tasks.length;
  const completedTasksCount = useMemo(() => tasks.filter(t => t.isCompleted).length, [tasks]);
  
  const projectsByRecentActivity = useMemo(() => {
    const activityMap = new Map<string, number>();
    timeEntries.forEach(entry => {
        const lastActivity = activityMap.get(entry.projectId) || 0;
        if (entry.endTime > lastActivity) {
            activityMap.set(entry.projectId, entry.endTime);
        }
    });
    return [...projects].sort((a, b) => (activityMap.get(b.id) || b.createdAt) - (activityMap.get(a.id) || a.createdAt)).slice(0, 5);
  }, [projects, timeEntries]);

  const recentTasks = useMemo(() => [...tasks].sort((a,b) => b.createdAt - a.createdAt).slice(0, 5), [tasks]);
  const recentCompletedTasks = useMemo(() => tasks.filter(t => t.isCompleted).sort((a,b) => (b.completedAt || 0) - (a.completedAt || 0)).slice(0, 5), [tasks]);


  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleGetInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    setModalContent('insights');
    const result = await getProductivityInsights(projects, tasks, timeEntries);
    setInsights(result);
    setIsLoadingInsights(false);
  }, [projects, tasks, timeEntries]);

  const handleNavigate = (projectId: string) => {
    setModalContent(null);
    onNavigateToProject(projectId);
  }

  const renderInsights = () => {
    // A simple markdown-to-html renderer
    return insights.split('\n').map((line, index) => {
      if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-text-main">{line.substring(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-text-main">{line.substring(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-text-main">{line.substring(2)}</h1>;
      if (line.trim().startsWith('* ')) return <li key={index} className="ml-6 list-disc text-text-secondary">{line.trim().substring(2)}</li>;
      if (line.trim() === '') return <br key={index} />;
      return <p key={index} className="text-text-secondary my-1">{line}</p>;
    });
  };
  
  const getModalTitle = () => {
      switch(modalContent) {
        case 'insights': return "Productivity Insights";
        case 'projects': return "Recent Projects";
        case 'tasks': return "Recent Tasks";
        case 'completedTasks': return "Recently Completed Tasks";
        default: return "";
      }
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-main">Dashboard</h1>
          <p className="text-text-secondary">Your productivity at a glance.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-primary p-6 rounded-lg shadow-lg">
                <h3 className="text-text-secondary font-semibold">Total Time Tracked</h3>
                <p className="text-3xl font-bold text-accent">{formatTotalTime(totalTimeTracked)}</p>
            </div>
             <button onClick={() => setModalContent('projects')} className="bg-primary p-6 rounded-lg shadow-lg text-left hover:bg-secondary transition-colors">
                <h3 className="text-text-secondary font-semibold">Projects</h3>
                <p className="text-3xl font-bold text-accent">{projects.length}</p>
            </button>
             <button onClick={() => setModalContent('tasks')} className="bg-primary p-6 rounded-lg shadow-lg text-left hover:bg-secondary transition-colors">
                <h3 className="text-text-secondary font-semibold">Total Tasks</h3>
                 <p className="text-3xl font-bold text-accent">{totalTasks}</p>
            </button>
            <button onClick={() => setModalContent('completedTasks')} className="bg-primary p-6 rounded-lg shadow-lg text-left hover:bg-secondary transition-colors">
                <h3 className="text-text-secondary font-semibold">Completed Tasks</h3>
                 <p className="text-3xl font-bold text-accent">{completedTasksCount}</p>
            </button>
        </div>
        
        <div className="bg-primary p-6 rounded-lg shadow-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                <h2 className="text-2xl font-semibold text-text-main">Time per Project</h2>
                <button
                    onClick={handleGetInsights}
                    disabled={isLoadingInsights || timeEntries.length === 0}
                    className="mt-4 md:mt-0 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isLoadingInsights && modalContent === 'insights' ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                    )}
                    <span>{isLoadingInsights && modalContent === 'insights' ? 'Analyzing...' : 'Get AI Insights'}</span>
                </button>
            </div>
            {chartData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a4a6a" />
                        <XAxis dataKey="name" stroke="#a0a0a0" />
                        <YAxis stroke="#a0a0a0" tickFormatter={(tick) => `${(tick / 3600).toFixed(1)}h`}/>
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(147, 51, 234, 0.1)'}}/>
                        <Bar dataKey="time" name="Time Logged" fill="#9333ea" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-text-secondary">
                    <p>Track some time to see your project data here.</p>
                </div>
            )}
        </div>
      </div>
      <Modal isOpen={modalContent !== null} onClose={() => setModalContent(null)} title={getModalTitle()}>
        {modalContent === 'insights' && (
            isLoadingInsights ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-text-secondary">Analyzing your data...</p>
                </div>
            ) : (
                <div className="prose prose-invert max-w-none">{renderInsights()}</div>
            )
        )}
        {modalContent === 'projects' && (
             <ul className="space-y-2">
                {projectsByRecentActivity.map(p => <li key={p.id}><button onClick={() => handleNavigate(p.id)} className="w-full text-left p-3 rounded-lg transition-colors hover:bg-primary">{p.name}</button></li>)}
             </ul>
        )}
        {[ 'tasks', 'completedTasks'].includes(modalContent || '') && (
            <ul className="space-y-2">
                {(modalContent === 'tasks' ? recentTasks : recentCompletedTasks).map(t => {
                    const project = projects.find(p => p.id === t.projectId);
                    return (<li key={t.id}>
                        <button onClick={() => handleNavigate(t.projectId)} className="w-full text-left p-3 rounded-lg transition-colors hover:bg-primary">
                            <p className="font-medium text-text-main">[{t.category}] {t.description}</p>
                            <p className="text-sm text-text-secondary">Project: {project?.name}</p>
                        </button>
                    </li>)
                })}
            </ul>
        )}
      </Modal>
    </main>
  );
};

export default Dashboard;