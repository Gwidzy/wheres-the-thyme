
import React from 'react';

interface HeaderProps {
  currentView: 'dashboard' | 'project';
  onViewChange: (view: 'dashboard' | 'project') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-secondary/50 backdrop-blur-sm p-4 border-b border-border-color sticky top-0 z-20 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 className="text-xl md:text-2xl font-bold text-text-main">Where's the Thyme?</h1>
      </div>
      <nav className="flex items-center space-x-2 bg-primary p-1 rounded-lg">
          <button 
            onClick={() => onViewChange('dashboard')} 
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === 'dashboard' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-secondary'}`}>
            Dashboard
          </button>
          <button 
            onClick={() => onViewChange('project')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === 'project' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-secondary'}`}>
            Projects
          </button>
      </nav>
    </header>
  );
};

export default Header;