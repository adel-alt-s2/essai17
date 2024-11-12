import { useMemo } from 'react';

export const useAppointmentColors = () => {
  const typeColors = useMemo(() => ({
    'thérapie': 'bg-purple-100 text-purple-800',
    'urgence': 'bg-red-100 text-red-800',
    'gratuit': 'bg-gray-100 text-gray-800',
    'délégué': 'bg-yellow-100 text-yellow-800',
    'nouvelle consultation': 'bg-green-100 text-green-800',
    'suivi': 'bg-blue-100 text-blue-800'
  }), []);

  const sourceColors = useMemo(() => ({
    'téléphone': 'bg-indigo-100 text-indigo-800',
    'recommandation': 'bg-emerald-100 text-emerald-800',
    'site-satli': 'bg-cyan-100 text-cyan-800',
    'email': 'bg-amber-100 text-amber-800',
    'réseaux sociaux': 'bg-rose-100 text-rose-800',
    'visite directe': 'bg-violet-100 text-violet-800',
    'site web': 'bg-teal-100 text-teal-800',
    'référé': 'bg-lime-100 text-lime-800',
    'publicité': 'bg-orange-100 text-orange-800',
    'sms': 'bg-sky-100 text-sky-800'
  }), []);

  const getAppointmentColor = (type: string | undefined, source: string | undefined, isPastDate: boolean) => {
    if (!type && !source) return 'bg-gray-100 text-gray-800';

    if (isPastDate) {
      const normalizedSource = source?.toLowerCase();
      return sourceColors[normalizedSource as keyof typeof sourceColors] || 'bg-gray-100 text-gray-800';
    } else {
      const normalizedType = type?.toLowerCase();
      return typeColors[normalizedType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
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

  return {
    typeColors,
    sourceColors,
    getAppointmentColor,
    getStatusColor
  };
};