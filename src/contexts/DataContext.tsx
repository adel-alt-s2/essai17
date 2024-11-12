import React, { createContext, useContext, useState, useEffect } from 'react';
import { sharedAppointments } from '../data/appointments';
import { todayVisits } from '../data/visits';

// Types pour la gestion des données
interface Patient {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  ville: string;
  cin: string;
  dateNaissance: string;
  age: string;
  mutuelle: {
    active: boolean;
    nom: string;
  };
  antecedents: string[];
  derniereConsultation: string;
  prochainRendezVous: string;
  nombreConsultations: number;
}

interface Paiement {
  id: string;
  numeroPatient: string;
  patient: string;
  date: string;
  montant: string;
  statut: 'Payé' | 'En attente' | 'Annulé' | 'Gratuit';
  statutCouleur: string;
  typePaiement: string;
  mutuelle: {
    active: boolean;
    nom: string;
  };
  dernierMontant: string;
}

interface RendezVous {
  id: string;
  patient: string;
  contact?: string;
  heure: string;
  duree: string;
  type: string;
  source: string;
  statut: 'confirmé' | 'en-attente' | 'annulé';
  montant: string;
  mutuelle: {
    active: boolean;
    nom: string;
  };
}

interface Document {
  id: string;
  numeroPatient: string;
  patient: string;
  type: string;
  nom: string;
  dateCreation: string;
  contenu: string;
}

interface DataContextType {
  patients: Patient[];
  paiements: Paiement[];
  rendezVous: RendezVous[];
  documents: Document[];
  ajouterPatient: (patient: Omit<Patient, 'id' | 'numeroPatient'>) => void;
  modifierPatient: (id: string, patient: Partial<Patient>) => void;
  supprimerPatient: (id: string) => void;
  ajouterPaiement: (paiement: Omit<Paiement, 'id'>) => void;
  modifierPaiement: (id: string, paiement: Partial<Paiement>) => void;
  supprimerPaiement: (id: string) => void;
  ajouterRendezVous: (rdv: Omit<RendezVous, 'id'>) => void;
  modifierRendezVous: (id: string, rdv: Partial<RendezVous>) => void;
  supprimerRendezVous: (id: string) => void;
  ajouterDocument: (document: Omit<Document, 'id'>) => void;
  modifierDocument: (id: string, document: Partial<Document>) => void;
  supprimerDocument: (id: string) => void;
  getPatientParId: (id: string) => Patient | undefined;
  getPaiementsPatient: (numeroPatient: string) => Paiement[];
  getRendezVousPatient: (numeroPatient: string) => RendezVous[];
  getDocumentsPatient: (numeroPatient: string) => Document[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // États
  const [patients, setPatients] = useState<Patient[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Initialisation des données
  useEffect(() => {
    // Convertir les visites du jour en patients et paiements
    const patientsInitiaux: Patient[] = todayVisits.map(visite => ({
      id: visite.patientNumber,
      numeroPatient: visite.patientNumber,
      nom: visite.patient.split(' ')[0],
      prenom: visite.patient.split(' ')[1],
      telephone: '',
      email: '',
      ville: '',
      cin: '',
      dateNaissance: '',
      age: '',
      mutuelle: {
        active: false,
        nom: ''
      },
      antecedents: [],
      derniereConsultation: visite.time,
      prochainRendezVous: '',
      nombreConsultations: 1
    }));

    const paiementsInitiaux: Paiement[] = todayVisits.map(visite => ({
      id: visite.patientNumber,
      numeroPatient: visite.patientNumber,
      patient: visite.patient,
      date: visite.time,
      montant: visite.amount,
      statut: visite.isCanceled ? 'Annulé' : 
              visite.paid ? 'Payé' : 
              visite.isGratuite ? 'Gratuit' : 'En attente',
      statutCouleur: visite.isCanceled ? 'bg-red-100 text-red-800' : 
                    visite.paid ? 'bg-green-100 text-green-800' : 
                    'bg-yellow-100 text-yellow-800',
      typePaiement: visite.paymentMethod,
      mutuelle: {
        active: false,
        nom: ''
      },
      dernierMontant: visite.lastConsultAmount
    }));

    // Convertir les rendez-vous partagés
    const rendezVousInitiaux: RendezVous[] = sharedAppointments.map(rdv => ({
      id: rdv.id,
      patient: rdv.patient,
      contact: rdv.contact,
      heure: rdv.time,
      duree: rdv.duration,
      type: rdv.type,
      source: rdv.source,
      statut: rdv.status,
      montant: '',
      mutuelle: {
        active: false,
        nom: ''
      }
    }));

    setPatients(patientsInitiaux);
    setPaiements(paiementsInitiaux);
    setRendezVous(rendezVousInitiaux);
  }, []);

  // Fonctions CRUD pour les patients
  const ajouterPatient = (patient: Omit<Patient, 'id' | 'numeroPatient'>) => {
    const nouveauPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      numeroPatient: `P${(patients.length + 1).toString().padStart(3, '0')}`
    };
    setPatients([...patients, nouveauPatient]);
  };

  const modifierPatient = (id: string, patientModifie: Partial<Patient>) => {
    setPatients(patients.map(patient => 
      patient.id === id ? { ...patient, ...patientModifie } : patient
    ));
  };

  const supprimerPatient = (id: string) => {
    setPatients(patients.filter(patient => patient.id !== id));
  };

  // Fonctions pour les paiements
  const ajouterPaiement = (paiement: Omit<Paiement, 'id'>) => {
    const nouveauPaiement: Paiement = {
      ...paiement,
      id: Date.now().toString()
    };
    setPaiements([...paiements, nouveauPaiement]);

    // Mise à jour du patient
    const patient = patients.find(p => p.numeroPatient === paiement.numeroPatient);
    if (patient) {
      modifierPatient(patient.id, {
        derniereConsultation: paiement.date,
        nombreConsultations: patient.nombreConsultations + 1
      });
    }
  };

  const modifierPaiement = (id: string, paiementModifie: Partial<Paiement>) => {
    setPaiements(paiements.map(paiement =>
      paiement.id === id ? { ...paiement, ...paiementModifie } : paiement
    ));
  };

  const supprimerPaiement = (id: string) => {
    setPaiements(paiements.filter(paiement => paiement.id !== id));
  };

  // Fonctions pour les rendez-vous
  const ajouterRendezVous = (rdv: Omit<RendezVous, 'id'>) => {
    const nouveauRdv: RendezVous = {
      ...rdv,
      id: Date.now().toString()
    };
    setRendezVous([...rendezVous, nouveauRdv]);

    // Mise à jour du patient
    const patient = patients.find(p => 
      `${p.nom} ${p.prenom}` === rdv.patient ||
      p.numeroPatient === rdv.patient
    );
    if (patient) {
      modifierPatient(patient.id, {
        prochainRendezVous: rdv.heure
      });
    }
  };

  const modifierRendezVous = (id: string, rdvModifie: Partial<RendezVous>) => {
    setRendezVous(rendezVous.map(rdv =>
      rdv.id === id ? { ...rdv, ...rdvModifie } : rdv
    ));
  };

  const supprimerRendezVous = (id: string) => {
    setRendezVous(rendezVous.filter(rdv => rdv.id !== id));
  };

  // Fonctions pour les documents
  const ajouterDocument = (document: Omit<Document, 'id'>) => {
    const nouveauDocument: Document = {
      ...document,
      id: Date.now().toString()
    };
    setDocuments([...documents, nouveauDocument]);
  };

  const modifierDocument = (id: string, documentModifie: Partial<Document>) => {
    setDocuments(documents.map(document =>
      document.id === id ? { ...document, ...documentModifie } : document
    ));
  };

  const supprimerDocument = (id: string) => {
    setDocuments(documents.filter(document => document.id !== id));
  };

  // Fonctions utilitaires
  const getPatientParId = (id: string) => patients.find(p => p.id === id);
  const getPaiementsPatient = (numeroPatient: string) => 
    paiements.filter(p => p.numeroPatient === numeroPatient);
  const getRendezVousPatient = (numeroPatient: string) =>
    rendezVous.filter(r => r.patient.includes(numeroPatient));
  const getDocumentsPatient = (numeroPatient: string) =>
    documents.filter(d => d.numeroPatient === numeroPatient);

  return (
    <DataContext.Provider value={{
      patients,
      paiements,
      rendezVous,
      documents,
      ajouterPatient,
      modifierPatient,
      supprimerPatient,
      ajouterPaiement,
      modifierPaiement,
      supprimerPaiement,
      ajouterRendezVous,
      modifierRendezVous,
      supprimerRendezVous,
      ajouterDocument,
      modifierDocument,
      supprimerDocument,
      getPatientParId,
      getPaiementsPatient,
      getRendezVousPatient,
      getDocumentsPatient
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit être utilisé à l\'intérieur d\'un DataProvider');
  }
  return context;
}