import React, { useState } from 'react';
import { Package, Search, Plus, Download, Calendar, UserMinus } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import { useAuth } from '../contexts/AuthContext';
import AbsenceModal from '../components/AbsenceModal';
import AbsenceList from '../components/AbsenceList';
import SupplyModal from '../components/SupplyModal';

export default function CabinetManagement() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'supplies' | 'absences'>('supplies');
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumns, setSelectedColumns] = useState({
    item: true,
    dateAchat: true,
    facture: true,
    prix: true,
    typePaiement: true,
    taxe: true
  });
  
  const [supplies, setSupplies] = useState([
    {
      id: '1',
      item: 'Papier d\'impression',
      dateAchat: '15/03/2024',
      facture: true,
      prix: '45,00',
      typePaiement: 'Carte Bancaire',
      taxe: 'TTC'
    },
    {
      id: '2',
      item: 'Stylos',
      dateAchat: '16/03/2024',
      facture: false,
      prix: '12,50',
      typePaiement: 'Espèces',
      taxe: 'HT'
    }
  ]);

  const [absences, setAbsences] = useState([
    {
      id: '1',
      employee: 'Marie Secrétaire',
      startDate: '20/03/2024',
      endDate: '22/03/2024',
      reason: 'Congé',
      status: 'En attente'
    }
  ]);

  const handleAbsenceSubmit = (absence: any) => {
    setAbsences([...absences, absence]);
    setIsAbsenceModalOpen(false);
  };

  const handleSupplySubmit = (supply: any) => {
    setSupplies([...supplies, supply]);
    setIsSupplyModalOpen(false);
  };

  const handleAbsenceStatusChange = (id: string, status: string) => {
    setAbsences(absences.map(absence => 
      absence.id === id ? { ...absence, status } : absence
    ));
  };

  const isDateInRange = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return date >= start && date <= end;
  };

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = isDateInRange(supply.dateAchat);
    return matchesSearch && matchesDate;
  });

  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = () => {
    if (activeTab === 'supplies') {
      const columns = [
        { id: 'item', label: 'Article' },
        { id: 'dateAchat', label: 'Date d\'achat' },
        { id: 'facture', label: 'Facture' },
        { id: 'prix', label: 'Prix (Dhs)' },
        { id: 'typePaiement', label: 'Type de paiement' },
        { id: 'taxe', label: 'Taxe' }
      ].filter(col => selectedColumns[col.id as keyof typeof selectedColumns]);

      exportToExcel(
        filteredSupplies,
        `fournitures_${dateRange.startDate}_${dateRange.endDate}`,
        columns
      );
    } else {
      const columns = [
        { id: 'employee', label: 'Employé' },
        { id: 'startDate', label: 'Date de début' },
        { id: 'endDate', label: 'Date de fin' },
        { id: 'reason', label: 'Motif' },
        { id: 'status', label: 'Statut' }
      ];

      exportToExcel(
        absences,
        `absences_${dateRange.startDate}_${dateRange.endDate}`,
        columns
      );
    }
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion du Cabinet</h2>
        <div className="flex space-x-2">
          {hasPermission('export_data') && (
            <button 
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Exporter Excel
            </button>
          )}
          {activeTab === 'supplies' ? (
            <button 
              onClick={() => setIsSupplyModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle fourniture
            </button>
          ) : (
            <button 
              onClick={() => setIsAbsenceModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle absence
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('supplies')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'supplies'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-5 w-5 inline-block mr-2" />
              Fournitures
            </button>
            <button
              onClick={() => setActiveTab('absences')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'absences'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserMinus className="h-5 w-5 inline-block mr-2" />
              Absences
            </button>
          </nav>
        </div>

        {activeTab === 'supplies' ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Rechercher une fourniture..."
                  />
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    />
                    <span className="text-gray-500">à</span>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'achat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix (Dhs)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxe
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSupplies.map((supply) => (
                    <tr key={supply.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {supply.item}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supply. dateAchat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          supply.facture
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {supply.facture ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supply.prix}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supply.typePaiement}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          supply.taxe === 'TTC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {supply.taxe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-4">
            <AbsenceList
              absences={absences}
              onStatusChange={handleAbsenceStatusChange}
            />
          </div>
        )}
      </div>

      {/* Modal d'exportation */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Options d'exportation</h3>
            <div className="space-y-4">
              {activeTab === 'supplies' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Sélectionnez les colonnes à exporter :</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColumns.item}
                        onChange={(e) => setSelectedColumns({...selectedColumns, item: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Article</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColumns.dateAchat}
                        onChange={(e) => setSelectedColumns({...selectedColumns, dateAchat: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Date d'achat</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColumns.facture}
                        onChange={(e) => setSelectedColumns({...selectedColumns, facture: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Facture</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColumns.prix}
                        onChange={(e) => setSelectedColumns({...selectedColumns, prix: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Prix</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColumns.typePaiement}
                        onChange={(e) => setSelectedColumns({...selectedColumns, typePaiement: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Type de paiement</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColumns.taxe}
                        onChange={(e) => setSelectedColumns({...selectedColumns, taxe: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Taxe</span>
                    </label>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
        onSubmit={handleAbsenceSubmit}
      />

      <SupplyModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
        onSubmit={handleSupplySubmit}
      />
    </div>
  );
}