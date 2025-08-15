// src/components/layout/Sidebar.jsx
import React from 'react';
import { 
  Store, 
  Home,
  Briefcase, 
  PlusCircle, 
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar, activeView, setActiveView }) => {
  const navItems = [
    { 
      id: 'marketplace', 
      icon: Store, 
      label: 'Marketplace',
      description: 'Browse assets'
    },
    { 
      id: 'property', 
      icon: Home, 
      label: 'Properties',
      description: 'Real estate'
    },
    { 
      id: 'portfolio', 
      icon: Briefcase, 
      label: 'Portfolio',
      description: 'Your assets'
    },
    { 
      id: 'create', 
      icon: PlusCircle, 
      label: 'Create Asset',
      description: 'List new RWA'
    },
    
  ];

  const isActive = (viewId) => activeView === viewId;

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full bg-black border-r border-neutral-900
        transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-neutral-900">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setActiveView('marketplace')}
        >
          <img 
            src="https://i.ibb.co/dN1sMhw/logo.jpg" 
            alt="IOPn" 
            className="w-10 h-10 rounded-lg"
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-light text-white">IOPn RWA</h1>
              <p className="text-xs text-neutral-500">Fractionalization</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`
                    w-full flex items-center px-3 py-3 rounded-lg
                    transition-all duration-200
                    ${active 
                      ? 'bg-gradient-to-r from-[#2280cd]/20 to-[#4105b6]/20 text-[#b0efff] border border-[#2280cd]/30' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs opacity-60">{item.description}</p>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Wallet Connect Section */}
      <div className={`absolute bottom-20 left-0 right-0 px-4 ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`
          bg-neutral-900 rounded-lg p-3 border border-neutral-800
          ${isCollapsed ? 'flex justify-center' : ''}
        `}>
          <w3m-button />
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute bottom-6 bg-neutral-900 border border-neutral-800
          p-2 rounded-lg transition-all duration-200
          hover:bg-neutral-800 hover:border-neutral-700
          ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'}
        `}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-neutral-400" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;