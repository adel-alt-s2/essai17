import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, Trash2 } from 'lucide-react';
import { format, parse, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';
import { useTimeSlots } from '../hooks/useTimeSlots';
import { useAppointments } from '../contexts/AppointmentContext';
import DraggableModal from './DraggableModal';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: any) => void;
  onDelete?: (id: string) => void;
  initialDate?: Date;
  initialTime?: string;
  existingAppointment?: any;
}

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  onDelete,
  initialDate,
  initialTime,
  existingAppointment
}: AppointmentModalProps) {
  const { patients } = useData();
  const { timeSlots } = useTimeSlots();
  const { isTimeSlotAvailable } = useAppointments();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [appointment, setAppointment] = useState({
    patient: '',
    contact: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    source: 'Téléphone',
    customSource: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    if (existingAppointment) {
      const appointmentDate = new Date(existingAppointment.time);
      setAppointment({
        ...existingAppointment,
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'HH:mm')
      });
      const patient = patients.find(p => 
        `${p.nom} ${p.prenom}` === existingAppointment.patient
      );
      if (patient) {
        setSelectedPatient(patient);
      }
    } else if (initialDate && initialTime) {
      setAppointment(prev => ({
        ...prev,
        date: format(initialDate, 'yyyy-MM-dd'),
        time: initialTime
      }));
    }
  }, [initialDate, initialTime, existingAppointment, patients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(appointment.contact)) {
      alert('Le numéro de téléphone doit contenir exactement 10 chiffres');
      return;
    }

    // Créer la date avec l'heure exacte
    const [hours, minutes] = appointment.time.split(':').map(Number);
    let appointmentDateTime = parse(appointment.date, 'yyyy-MM-dd', new Date());
    appointmentDateTime = setHours(appointmentDateTime, hours);
    appointmentDateTime = setMinutes(appointmentDateTime, minutes);

    // Vérifier la disponibilité du créneau
    if (!isTimeSlotAvailable(appointmentDateTime, appointment.time, existingAppointment?.id)) {
      alert('Ce créneau horaire est déjà occupé par un autre rendez-vous');
      return;
    }

    // Créer l'objet rendez-vous avec la bonne date/heure
    const appointmentData = {
      ...appointment,
      time: appointmentDateTime.toISOString(),
      source: appointment.customSource || appointment.source,
      patientId: selectedPatient?.id
    };

    onSubmit(appointmentData);

    // Réinitialiser le formulaire
    setAppointment({
      patient: '',
      contact: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      source: 'Téléphone',
      customSource: ''
    });
    setSelectedPatient(null);
    onClose();
  };

  const handleDelete = () => {
    if (existingAppointment && onDelete) {
      onDelete(existingAppointment.id);
      onClose();
    }
  };

  const handlePatientSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setShowPatientSearch(searchValue.length > 0);
    setAppointment({ ...appointment, patient: searchValue });
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.nom} ${patient.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telephone.includes(searchTerm)
  );

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setAppointment({
      ...appointment,
      patient: `${patient.nom} ${patient.prenom}`,
      contact: patient.telephone
    });
    setShowPatientSearch(false);
    setSearchTerm('');
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={existingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
      className="w-full max-w-md"
    >
      {showDeleteConfirm ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Êtes-vous sûr de vouloir supprimer ce rendez-vous ?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient
              </div>
            </label>
            <input
              type="text"
              value={searchTerm || appointment.patient}
              onChange={(e) => handlePatientSearch(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Rechercher un patient..."
              required
            />
            {showPatientSearch && filteredPatients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => selectPatient(patient)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    <div className="font-medium">{patient.nom} {patient.prenom}</div>
                    <div className="text-sm text-gray-500">{patient.telephone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Contact (téléphone)
              </div>
            </label>
            <input
              type="tel"
              value={appointment.contact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setAppointment({ ...appointment, contact: value });
                }
              }}
              placeholder="0612345678"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                </div>
              </label>
              <input
                type="date"
                value={appointment.date}
                onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Heure
                </div>
              </label>
              <select
                value={appointment.time}
                onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <select
              value={appointment.source}
              onChange={(e) => setAppointment({ ...appointment, source: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Téléphone">Téléphone</option>
              <option value="Site-Satli">Site-Satli</option>
              <option value="Email">Email</option>
              <option value="Visite directe">Visite directe</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {existingAppointment && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {existingAppointment ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </DraggableModal>
  );
}