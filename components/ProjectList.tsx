
import React from 'react';
import type { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, selectedProjectId, onSelectProject, onAddProject }) => {
  return (
    <aside className="w-full md:w-1/4 bg-primary p-4 border-r border-border-color h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-text-main">Projects</h2>
        <button
          onClick={onAddProject}
          className="bg-accent hover:bg-accent-hover text-white font-bold p-2 rounded-full transition-colors"
          title="Add new project"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="text-center text-text-secondary mt-8">
            <p>No projects yet.</p>
            <p>Click the '+' button to add your first project!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {projects.map(project => (
            <li key={project.id}>
              <button
                onClick={() => onSelectProject(project.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedProjectId === project.id
                    ? 'bg-accent text-white'
                    : 'hover:bg-secondary text-text-main'
                }`}
              >
                {project.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default ProjectList;
