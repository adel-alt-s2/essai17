import React from 'react';
import { Phone, Globe, User } from 'lucide-react';
import { isSunday, isSaturday, isAfter } from 'date-fns';

const typeColors = {
  'thérapie': 'bg-purple-100 text-purple-800',
  'urgence': 'bg-red-100 text-red-800',
  'gratuit': 'bg-gray-100 text-gray-800',
  'délégué': 'bg-yellow-100 text-yellow-800',
  'nouvelle consultation': 'bg-green-100 text-green-800',
  'suivi': 'bg-blue-100 text-blue-800'
};

const sourceColors = {
  'téléphone': 'bg-indigo-100 text-indigo-800',
  'site-satli': 'bg-emerald-100 text-emerald-800',
  'doctolib': 'bg-cyan-100 text-cyan-800',
  'visite directe': 'bg-amber-100 text-amber-800',
  'autres sites': 'bg-slate-100 text-slate-800'
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmé':
      return 'bg-green-100 text-green-800';
    case 'en-attente':
      return 'bg-yellow-100 text-yellow-800';
    case 'annulé':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getSourceIcon = (source: string) => {
  switch (source?.toLowerCase()) {
    case 'téléphone':
      return <Phone className="h-4 w-4" />;
    case 'site-satli':
    case 'doctolib':
    case 'autres sites':
      return <Globe className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

export const isBreakSlot = (time: string, date: Date) => {
  const [hours, minutes] = time.split(':').map(Number);
  
  if ((hours === 14 && minutes === 0) || 
      ((hours === 17 && minutes === 30) || hours === 18) || 
      hours >= 19) {
    return true;
  }

  if (isSunday(date)) {
    return true;
  }

  if (isSaturday(date) && hours >= 13) {
    return true;
  }

  return false;
};

export const isClickableBreakSlot = (time: string, date: Date) => {
  return true;
};

export const getAppointmentColor = (type: string | undefined, source: string | undefined, date: Date) => {
  if (!type && !source) return 'bg-gray-100 text-gray-800';

  const isPastDate = isAfter(new Date(), date);
  
  if (isPastDate) {
    const normalizedSource = source?.toLowerCase();
    return sourceColors[normalizedSource as keyof typeof sourceColors] || 'bg-gray-100 text-gray-800';
  } else {
    const normalizedType = type?.toLowerCase();
    return typeColors[normalizedType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  }
};

export const getAppointmentSummary = (appointments: any[]) => {
  return {
    total: appointments.length,
    types: appointments.reduce((acc, apt) => {
      const type = apt.type?.toLowerCase() || 'autre';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    statuses: appointments.reduce((acc, apt) => {
      const status = apt.status || 'inconnu';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  };
};