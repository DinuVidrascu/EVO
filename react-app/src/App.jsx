import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Stats from './pages/Stats';
import { useTasks } from './hooks/useTasks';
import { useTimer } from './hooks/useTimer';

function App() {
  const [activeView, setActiveView] = useState('tasks');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const { tasks, addTask, updateTask, toggleTaskStatus, deleteTask } = useTasks();
  
  // Custom update function for timer hook to only update timeSpent
  const updateTaskTime = (id, newTime) => {
    updateTask(id, { timeSpent: newTime });
  };
  
  const timerProps = useTimer(updateTaskTime);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderView = () => {
    switch (activeView) {
      case 'tasks':
        return <Dashboard 
                  tasks={tasks} 
                  addTask={addTask} 
                  updateTask={updateTask}
                  toggleTaskStatus={toggleTaskStatus} 
                  deleteTask={deleteTask} 
                  timerProps={timerProps} 
               />;
      case 'calendar':
        return <Calendar tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} />;
      case 'stats':
        return <Stats tasks={tasks} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Sidebar setView={setActiveView} activeView={activeView} toggleTheme={toggleTheme} theme={theme} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <MobileHeader setView={setActiveView} activeView={activeView} toggleTheme={toggleTheme} theme={theme} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-12">
          {renderView()}
        </main>
      </div>
    </>
  );
}

export default App;
