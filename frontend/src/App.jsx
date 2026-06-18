import React, { useState, useEffect } from 'react';
import IssueBoard from './features/issues/IssueBoard';
import AuthPage from './features/auth/AuthPage';
import CreateIssueModal from './features/issues/CreateIssueModal';

function App() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if we are already logged in when the app loads
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // If no user is logged in, show the Auth Screen
  if (!user) {
    return <AuthPage onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // If logged in, show the actual App!
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded font-black text-xl tracking-wider">MJ</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mini Jira <span className="text-sm font-normal text-gray-500">Workspace</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            {user.name}
          </span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline font-medium">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* ADDED: Flexbox layout to put the title and button side-by-side */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Active Sprint Board</h2>
            <p className="text-gray-500 text-sm">Manage, track, and complete team items.</p>
          </div>
          
          {/* ADDED: The button that triggers the modal */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            + Create Issue
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800">
          <IssueBoard />
        </div>

        {/* ADDED: The Modal Component itself */}
        <CreateIssueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
    </div>
  );
}

export default App;