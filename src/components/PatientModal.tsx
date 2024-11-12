import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: any) => void;
  initialData?: any;
}

export default function PatientModal({ isOpen, onClose, onSubmit, initialData }: PatientModalProps) {
  const [patient, setPatient] = useState({
    nom: initialData?.nom || '',
    prenom: initialData?.prenom || '',
    telephone: initialData?.telephone || '',
    email: initialData?.email || '',
    ville: initialData?.ville || '',
    secteur: initialData?.secteur || '',
    cin: initialData?.cin || '',
    dateNaissance: initialData?.dateNaissance || '',
    typeConsultation: initialData?.typeConsultation || '',
    customTypeConsultation: '',
    mutuelle: {
      active: initialData?.mutuelle?.active || false,
      nom: initialData?.mutuelle?.nom || ''
    },
    antecedents: initialData?.antecedents || [],
    newAntecedent: '',
    customAntecedent: ''
  });

  const [savedMutuelles] = useState<string[]>([
    'CNOPS',
    'CNSS',
    'RMA',
    'SAHAM',
    'AXA'
  ]);

  const [savedSecteurs] = useState<string[]>([
    'Guéliz',
    'Hivernage',
    'Médina',
    'Targa',
    'Semlalia',
    'Amerchich'
  ]);

  const [savedAntecedents] = useState<string[]>([
    'Diabète',
    'Hypertension',
    'Asthme',
    'Allergie',
    'Dépression',
    'Anxiété'
  ]);

  const [savedTypesConsultation] = useState<string[]>([
    'Thérapie',
    'Urgence',
    'Gratuit',
    'Délégué',
    'Nouvelle consultation',
    'Suivi'
  ]);

  useEffect(() => {
    if (initialData) {
      setPatient({
        ...patient,
        ...initialData,
        mutuelle: {
          active: initialData.mutuelle?.active || false,
          nom: initialData.mutuelle?.nom || ''
        },
        antecedents: initialData.antecedents || []
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation du CIN (lettres et chiffres)
    const cinRegex = /^[A-Za-z0-9]+$/;
    if (!cinRegex.test(patient.cin)) {
      alert('Le CIN doit contenir uniquement des lettres et des chiffres');
      return;
    }

    // Validation du numéro de téléphone (10 chiffres)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(patient.telephone)) {
      alert('Le numéro de téléphone doit contenir exactement 10 chiffres');
      return;
    }

    // Validation de l'email si fourni
    if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      alert('Format d\'email invalide');
      return;
    }

    const patientData = {
      ...patient,
      ville: patient.ville.trim(),
      secteur: patient.ville.toLowerCase() === 'marrakech' ? patient.secteur : '',
      typeConsultation: patient.customTypeConsultation || patient.typeConsultation,
      antecedents: patient.antecedents
    };

    onSubmit(patientData);
    setPatient({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      ville: '',
      secteur: '',
      cin: '',
      dateNaissance: '',
      typeConsultation: '',
      customTypeConsultation: '',
      mutuelle: {
        active: false,
        nom: ''
      },
      antecedents: [],
      newAntecedent: '',
      customAntecedent: ''
    });
  };

  const addAntecedent = () => {
    const antecedentToAdd = patient.customAntecedent || patient.newAntecedent;
    if (antecedentToAdd.trim()) {
      setPatient({
        ...patient,
        antecedents: [...patient.antecedents, antecedentToAdd.trim()],
        newAntecedent: '',
        customAntecedent: ''
      });
    }
  };

  const removeAntecedent = (index: number) => {
    setPatient({
      ...patient,
      antecedents: patient.antecedents.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Modifier le patient' : 'Nouveau patient'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Nom
                </div>
              </label>
              <input
                type="text"
                value={patient.nom}
                onChange={(e) => setPatient({...patient, nom: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                type="text"
                value={patient.prenom}
                onChange={(e) => setPatient({...patient, prenom: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Téléphone
                </div>
              </label>
              <input
                type="tel"
                value={patient.telephone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setPatient({...patient, telephone: value});
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0612345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={patient.email}
                onChange={(e) => setPatient({...patient, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Ville
                </div>
              </label>
              <input
                type="text"
                value={patient.ville}
                onChange={(e) => setPatient({...patient, ville: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            {patient.ville.toLowerCase() === 'marrakech' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Secteur</label>
                <select
                  value={patient.secteur}
                  onChange={(e) => setPatient({...patient, secteur: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Sélectionner un secteur</option>
                  {savedSecteurs.map((secteur) => (
                    <option key={secteur} value={secteur}>{secteur}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  CIN
                </div>
              </label>
              <input
                type="text"
                value={patient.cin}
                onChange={(e) => setPatient({...patient, cin: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date de naissance
                </div>
              </label>
              <input
                type="date"
                value={patient.dateNaissance}
                onChange={(e) => setPatient({...patient, dateNaissance: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de consultation</label>
              <div className="flex space-x-2 mb-2">
                <select
                  value={patient.typeConsultation}
                  onChange={(e) => setPatient({...patient, typeConsultation: e.target.value})}
                  className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Sélectionner un type</option>
                  {savedTypesConsultation.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={patient.customTypeConsultation}
                  onChange={(e) => setPatient({...patient, customTypeConsultation: e.target.value})}
                  className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ou saisir un nouveau type..."
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={patient.mutuelle.active}
                  onChange={(e) => setPatient({
                    ...patient,
                    mutuelle: {
                      ...patient.mutuelle,
                      active: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Mutuelle</span>
              </label>
              {patient.mutuelle.active && (
                <div className="mt-2">
                  <select
                    value={patient.mutuelle.nom}
                    onChange={(e) => setPatient({
                      ...patient,
                      mutuelle: {
                        ...patient.mutuelle,
                        nom: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Sélectionner une mutuelle</option>
                    {savedMutuelles.map((mutuelle) => (
                      <option key={mutuelle} value={mutuelle}>{mutuelle}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Antécédents médicaux</label>
              <div className="flex space-x-2 mb-2">
                <select
                  value={patient.newAntecedent}
                  onChange={(e) => setPatient({...patient, newAntecedent: e.target.value})}
                  className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Sélectionner un antécédent</option>
                  {savedAntecedents.map((antecedent) => (
                    <option key={antecedent} value={antecedent}>{antecedent}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={patient.customAntecedent}
                  onChange={(e) => setPatient({...patient, customAntecedent: e.target.value})}
                  className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ou saisir un nouvel antécédent..."
                />
                <button
                  type="button"
                  onClick={addAntecedent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {patient.antecedents.map((antecedent: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{antecedent}</span>
                    <button
                      type="button"
                      onClick={() => removeAntecedent(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              {initialData ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}