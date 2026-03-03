import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  BellIcon as BellIconSolid,
  PlusCircleIcon as PlusCircleIconSolid
} from '@heroicons/react/24/solid';

const MobileNav = () => {
  const navItems = [
    { 
      path: '/', 
      name: 'الرئيسية',
      icon: HomeIcon,
      activeIcon: HomeIconSolid
    },
    { 
      path: '/artisans', 
      name: 'الحرفيون',
      icon: UserGroupIcon,
      activeIcon: UserGroupIconSolid
    },
    { 
      path: '/posts/create', 
      name: 'إضافة',
      icon: PlusCircleIcon,
      activeIcon: PlusCircleIconSolid,
      highlight: true
    },
    { 
      path: '/chat', 
      name: 'المحادثات',
      icon: ChatBubbleLeftIcon,
      activeIcon: ChatBubbleLeftIconSolid,
      badge: 3
    },
    { 
      path: '/notifications', 
      name: 'الإشعارات',
      icon: BellIcon,
      activeIcon: BellIconSolid,
      badge: 5
    },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive
                  ? item.highlight
                    ? 'text-white'
                    : 'text-primary-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.highlight ? (
                  <div className={`absolute -top-4 bg-primary-600 rounded-full p-3 shadow-lg ${
                    isActive ? 'bg-primary-700' : ''
                  }`}>
                    {isActive ? (
                      <item.activeIcon className="w-6 h-6 text-white" />
                    ) : (
                      <item.icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                ) : (
                  <>
                    {isActive ? (
                      <item.activeIcon className="w-6 h-6" />
                    ) : (
                      <item.icon className="w-6 h-6" />
                    )}
                    <span className="text-xs mt-1">{item.name}</span>
                  </>
                )}
                
                {item.badge && !item.highlight && (
                  <span className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;