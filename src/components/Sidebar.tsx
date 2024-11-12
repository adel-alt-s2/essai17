import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, CreditCard, Package, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const menuItems = [
    ...(hasPermission('view_dashboard') ? [{
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      path: '/',
      permissions: ['view_dashboard']
    }] : []),
    { 
      icon: Calendar, 
      label: 'Agenda',
      path: '/appointments', 
      permissions: ['view_appointments']
    },
    { 
      icon: Users, 
      label: 'Patients', 
      path: '/patients', 
      permissions: ['view_patients']
    },
    ...(hasPermission('view_treatments') ? [{
      icon: FileText,
      label: 'Documents médicaux',
      path: '/treatments',
      permissions: ['view_treatments']
    }] : []),
    { 
      icon: CreditCard, 
      label: 'Gestion des paiements', 
      path: '/billing', 
      permissions: ['view_billing']
    },
    ...(hasPermission('view_supplies') ? [{
      icon: Package,
      label: 'Gestion Cabinet',
      path: '/cabinet',
      permissions: ['view_supplies']
    }] : []),
    ...(hasPermission('manage_users') ? [{
      icon: UserPlus,
      label: 'Gestion Utilisateurs',
      path: '/admin',
      permissions: ['manage_users']
    }] : [])
  ].filter(item => item.permissions.some(permission => hasPermission(permission)));

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}