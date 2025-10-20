import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Clock, Home, User, Edit2, ChevronDown, ChevronUp, Save, Filter, X, Download, Upload } from 'lucide-react';

const GebietsLaufliste = () => {
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [expandedAddresses, setExpandedAddresses] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('ALL');
  
  // Neue Straße und Hausnummer
  const [newStreet, setNewStreet] = useState('');
  const [newHouseNumber, setNewHouseNumber] = useState({
    street: '',
    number: '',
    name: '',
    currentContract: '',
    customerType: 'KIP möglich'
  });

  // Lauflisten aus localStorage laden
  useEffect(() => {
    const savedLists = localStorage.getItem('gebietsLauflisten');
    if (savedLists) {
      const parsed = JSON.parse(savedLists);
      setLists(parsed);
      if (parsed.length > 0 && !currentList) {
        setCurrentList(parsed[0].id);
      }
    }
  }, []);

  // Lauflisten in localStorage speichern
  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem('gebietsLauflisten', JSON.stringify(lists));
    }
  }, [lists]);

  const createNewList = () => {
    if (!newListTitle.trim()) return;
    
    const newList = {
      id: Date.now(),
      title: newListTitle,
      createdAt: new Date().toISOString(),
      streets: []
    };
    
    setLists([newList, ...lists]);
    setCurrentList(newList.id);
    setNewListTitle('');
    setShowNewListForm(false);
  };

  const deleteList = (listId) => {
    if (window.confirm('Liste wirklich löschen?')) {
      setLists(lists.filter(l => l.id !== listId));
      if (currentList === listId) {
        setCurrentList(lists.length > 1 ? lists[0].id : null);
      }
    }
  };

  const addStreet = () => {
    if (!newStreet.trim()) return;
    
    const street = {
      id: Date.now(),
      name: newStreet,
      addresses: [],
      createdAt: new Date().toISOString()
    };
    
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: [...list.streets, street]
        };
      }
      return list;
    }));
    
    setNewStreet('');
  };

  const deleteStreet = (streetId) => {
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: list.streets.filter(s => s.id !== streetId)
        };
      }
      return list;
    }));
  };

  const addHouseNumber = (streetId) => {
    if (!newHouseNumber.number.trim()) return;
    
    const address = {
      id: Date.now(),
      number: newHouseNumber.number,
      name: newHouseNumber.name,
      currentContract: newHouseNumber.currentContract,
      customerType: newHouseNumber.customerType,
      status: null,
      statusHistory: [],
      contract: '',
      createdAt: new Date().toISOString()
    };
    
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: list.streets.map(street => {
            if (street.id === streetId) {
              return {
                ...street,
                addresses: [...street.addresses, address]
              };
            }
            return street;
          })
        };
      }
      return list;
    }));
    
    setNewHouseNumber({ street: '', number: '', name: '', currentContract: '', customerType: 'KIP möglich' });
  };

  const deleteAddress = (streetId, addressId) => {
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: list.streets.map(street => {
            if (street.id === streetId) {
              return {
                ...street,
                addresses: street.addresses.filter(a => a.id !== addressId)
              };
            }
            return street;
          })
        };
      }
      return list;
    }));
  };

  const updateAddressStatus = (streetId, addressId, status) => {
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: list.streets.map(street => {
            if (street.id === streetId) {
              return {
                ...street,
                addresses: street.addresses.map(addr => {
                  if (addr.id === addressId) {
                    const statusEntry = {
                      status: status,
                      timestamp: new Date().toISOString()
                    };
                    return {
                      ...addr,
                      status: status,
                      statusHistory: [...addr.statusHistory, statusEntry]
                    };
                  }
                  return addr;
                })
              };
            }
            return street;
          })
        };
      }
      return list;
    }));
  };

  const updateAddressContract = (streetId, addressId, contract) => {
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: list.streets.map(street => {
            if (street.id === streetId) {
              return {
                ...street,
                addresses: street.addresses.map(addr => {
                  if (addr.id === addressId) {
                    const statusEntry = {
                      status: 'VERTRAG',
                      contract: contract,
                      timestamp: new Date().toISOString()
                    };
                    return {
                      ...addr,
                      status: 'VERTRAG',
                      contract: contract,
                      statusHistory: [...addr.statusHistory, statusEntry]
                    };
                  }
                  return addr;
                })
              };
            }
            return street;
          })
        };
      }
      return list;
    }));
  };

  const deleteStatusHistoryEntry = (streetId, addressId, historyIndex) => {
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: list.streets.map(street => {
            if (street.id === streetId) {
              return {
                ...street,
                addresses: street.addresses.map(addr => {
                  if (addr.id === addressId) {
                    const newHistory = addr.statusHistory.filter((_, idx) => idx !== historyIndex);
                    const lastEntry = newHistory[newHistory.length - 1];
                    return {
                      ...addr,
                      statusHistory: newHistory,
                      status: lastEntry ? lastEntry.status : null,
                      contract: lastEntry && lastEntry.contract ? lastEntry.contract : ''
                    };
                  }
                  return addr;
                })
              };
            }
            return street;
          })
        };
      }
      return list;
    }));
  };

  // Export Funktion
  const exportData = () => {
    const dataStr = JSON.stringify(lists, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `laufliste-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Funktion
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (window.confirm('Backup importieren? Aktuelle Daten werden überschrieben!')) {
          setLists(importedData);
          localStorage.setItem('gebietsLauflisten', JSON.stringify(importedData));
          if (importedData.length > 0) {
            setCurrentList(importedData[0].id);
          }
          alert('Backup erfolgreich importiert!');
        }
      } catch (error) {
        alert('Fehler beim Importieren: Ungültige Backup-Datei');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const toggleExpanded = (addressId) => {
    setExpandedAddresses(prev => ({
      ...prev,
      [addressId]: !prev[addressId]
    }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentListData = () => {
    return lists.find(l => l.id === currentList);
  };

  const currentListData = getCurrentListData();

  const getStatusColor = (status) => {
    switch(status) {
      case 'KI': return 'bg-red-100 text-red-700 border-red-300';
      case 'NM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'NA': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'VERTRAG': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCustomerTypeBadge = (customerType) => {
    // Fallback für alte Daten
    if (customerType === 'Neukunde') customerType = 'KIP möglich';
    if (customerType === 'Upsell') customerType = 'Upsell möglich';
    if (customerType === 'nur KAS') customerType = 'Nur KAS';
    
    switch(customerType) {
      case 'KIP möglich': return { icon: '🆕', color: 'bg-blue-100 text-blue-800', label: 'KIP möglich' };
      case 'Upsell möglich': return { icon: '📈', color: 'bg-purple-100 text-purple-800', label: 'Upsell möglich' };
      case 'Nur KAS': return { icon: '📡', color: 'bg-orange-100 text-orange-800', label: 'Nur KAS' };
      default: return { icon: '🆕', color: 'bg-blue-100 text-blue-800', label: 'KIP möglich' };
    }
  };

  const getStatusStats = () => {
    if (!currentListData || !currentListData.streets) return { 
      total: 0, ki: 0, nm: 0, na: 0, vertrag: 0, offen: 0,
      kipMoeglich: 0, upsellMoeglich: 0, nurKAS: 0
    };
    
    const stats = {
      total: 0,
      ki: 0,
      nm: 0,
      na: 0,
      vertrag: 0,
      offen: 0,
      kipMoeglich: 0,
      upsellMoeglich: 0,
      nurKAS: 0
    };
    
    currentListData.streets.forEach(street => {
      street.addresses.forEach(addr => {
        stats.total++;
        if (addr.status === 'KI') stats.ki++;
        else if (addr.status === 'NM') stats.nm++;
        else if (addr.status === 'NA') stats.na++;
        else if (addr.status === 'VERTRAG') stats.vertrag++;
        else stats.offen++;

        // Fallback für alte Daten
        let type = addr.customerType;
        if (type === 'Neukunde') type = 'KIP möglich';
        if (type === 'Upsell') type = 'Upsell möglich';
        if (type === 'nur KAS') type = 'Nur KAS';

        if (type === 'KIP möglich') stats.kipMoeglich++;
        else if (type === 'Upsell möglich') stats.upsellMoeglich++;
        else if (type === 'Nur KAS') stats.nurKAS++;
      });
    });
    
    return stats;
  };

  const filterAddress = (address) => {
    // Status Filter
    let statusMatch = true;
    if (statusFilter === 'OFFEN') {
      statusMatch = !address.status;
    } else if (statusFilter !== 'ALL') {
      statusMatch = address.status === statusFilter;
    }

    // Customer Type Filter mit Fallback für alte Daten
    let customerTypeMatch = true;
    if (customerTypeFilter !== 'ALL') {
      let type = address.customerType;
      if (type === 'Neukunde') type = 'KIP möglich';
      if (type === 'Upsell') type = 'Upsell möglich';
      if (type === 'nur KAS') type = 'Nur KAS';
      
      customerTypeMatch = type === customerTypeFilter;
    }

    return statusMatch && customerTypeMatch;
  };

  const getFilteredStreets = () => {
    if (!currentListData || !currentListData.streets) return [];
    
    if (statusFilter === 'ALL' && customerTypeFilter === 'ALL') {
      return currentListData.streets;
    }
    
    return currentListData.streets
      .map(street => ({
        ...street,
        addresses: street.addresses.filter(filterAddress)
      }))
      .filter(street => street.addresses.length > 0);
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <MapPin className="text-blue-600" />
            Gebiets-Laufliste Manager
          </h1>
          <p className="text-gray-600 mt-2">Organisiere deine Außendiensttouren effizient</p>
        </div>

        {/* Listenauswahl und Neue Liste */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <select
              value={currentList || ''}
              onChange={(e) => setCurrentList(Number(e.target.value))}
              className="flex-1 min-w-[200px] p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Liste auswählen...</option>
              {lists.map(list => {
                const totalAddresses = list.streets ? list.streets.reduce((sum, street) => sum + street.addresses.length, 0) : 0;
                const streetCount = list.streets ? list.streets.length : 0;
                return (
                  <option key={list.id} value={list.id}>
                    {list.title} ({streetCount} Straßen, {totalAddresses} Adressen)
                  </option>
                );
              })}
            </select>
            
            {currentList && (
              <button
                onClick={() => deleteList(currentList)}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Liste löschen
              </button>
            )}
            
            <button
              onClick={() => setShowNewListForm(!showNewListForm)}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Neue Liste
            </button>
          </div>

          {showNewListForm && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Listentitel (z.B. 'Gebiet Mainz Nord - KW 40')"
                className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && createNewList()}
              />
              <div className="flex gap-2">
                <button
                  onClick={createNewList}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Erstellen
                </button>
                <button
                  onClick={() => setShowNewListForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Backup Buttons */}
          <div className="mt-4 pt-4 border-t flex gap-3 flex-wrap">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={18} />
              Backup erstellen
            </button>
            <label className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 cursor-pointer">
              <Upload size={18} />
              Backup wiederherstellen
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            <div className="flex items-center text-sm text-gray-600 ml-2">
              💾 Backup regelmäßig erstellen und sicher speichern!
            </div>
          </div>
        </div>

        {currentListData && (
          <>
            {/* Statistiken */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Statistik</h2>
              
              {/* Status Statistik */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                    <div className="text-xs text-gray-600">Gesamt</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-gray-700">{stats.offen}</div>
                    <div className="text-xs text-gray-600">Offen</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border-red-200 border text-center">
                    <div className="text-2xl font-bold text-red-700">{stats.ki}</div>
                    <div className="text-xs text-red-600">KI</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border-yellow-200 border text-center">
                    <div className="text-2xl font-bold text-yellow-700">{stats.nm}</div>
                    <div className="text-xs text-yellow-600">NM</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-blue-200 border text-center">
                    <div className="text-2xl font-bold text-blue-700">{stats.na}</div>
                    <div className="text-xs text-blue-600">NA</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border-green-200 border text-center">
                    <div className="text-2xl font-bold text-green-700">{stats.vertrag}</div>
                    <div className="text-xs text-green-600">Vertrag</div>
                  </div>
                </div>
              </div>

              {/* Potenzial Statistik */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Potenzial</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border-blue-200 border text-center">
                    <div className="text-2xl font-bold text-blue-700">{stats.kipMoeglich}</div>
                    <div className="text-xs text-blue-600">🆕 KIP möglich</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border-purple-200 border text-center">
                    <div className="text-2xl font-bold text-purple-700">{stats.upsellMoeglich}</div>
                    <div className="text-xs text-purple-600">📈 Upsell möglich</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border-orange-200 border text-center">
                    <div className="text-2xl font-bold text-orange-700">{stats.nurKAS}</div>
                    <div className="text-xs text-orange-600">📡 Nur KAS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="space-y-3">
                {/* Status Filter */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Filter size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-800">Status:</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        statusFilter === 'ALL' 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      onClick={() => setStatusFilter('OFFEN')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        statusFilter === 'OFFEN' 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Offen
                    </button>
                    <button
                      onClick={() => setStatusFilter('KI')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        statusFilter === 'KI' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      KI
                    </button>
                    <button
                      onClick={() => setStatusFilter('NM')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        statusFilter === 'NM' 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      NM
                    </button>
                    <button
                      onClick={() => setStatusFilter('NA')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        statusFilter === 'NA' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      NA
                    </button>
                    <button
                      onClick={() => setStatusFilter('VERTRAG')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        statusFilter === 'VERTRAG' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Vertrag
                    </button>
                  </div>
                </div>

                {/* Potenzial Filter */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Filter size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-800">Potenzial:</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setCustomerTypeFilter('ALL')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        customerTypeFilter === 'ALL' 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      onClick={() => setCustomerTypeFilter('KIP möglich')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        customerTypeFilter === 'KIP möglich' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      🆕 KIP möglich
                    </button>
                    <button
                      onClick={() => setCustomerTypeFilter('Upsell möglich')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        customerTypeFilter === 'Upsell möglich' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      📈 Upsell möglich
                    </button>
                    <button
                      onClick={() => setCustomerTypeFilter('Nur KAS')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        customerTypeFilter === 'Nur KAS' 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      📡 Nur KAS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Neue Straße hinzufügen */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Neue Straße hinzufügen</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="Straßenname eingeben..."
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addStreet()}
                />
                <button
                  onClick={addStreet}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Straße anlegen
                </button>
              </div>
            </div>

            {/* Straßenliste */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Straßen ({getFilteredStreets().length})
                {(statusFilter !== 'ALL' || customerTypeFilter !== 'ALL') && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (gefiltert)
                  </span>
                )}
              </h2>
              
              {currentListData.streets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Noch keine Straßen angelegt. Füge oben eine neue Straße hinzu.
                </div>
              ) : getFilteredStreets().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Keine Adressen mit den ausgewählten Filtern gefunden.
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredStreets().map(street => (
                    <div key={street.id} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                      {/* Straßenkopf */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={22} className="text-blue-600" />
                          <h3 className="text-xl font-bold text-blue-900">{street.name}</h3>
                          <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            {street.addresses.length} {street.addresses.length === 1 ? 'Adresse' : 'Adressen'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteStreet(street.id)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Hausnummer hinzufügen */}
                      {statusFilter === 'ALL' && customerTypeFilter === 'ALL' && (
                        <div className="bg-white p-3 rounded-lg mb-3 border border-blue-200">
                          <div className="grid md:grid-cols-4 gap-2 mb-2">
                            <input
                              type="text"
                              value={newHouseNumber.number}
                              onChange={(e) => setNewHouseNumber({...newHouseNumber, number: e.target.value})}
                              placeholder="Hausnummer *"
                              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              onKeyPress={(e) => e.key === 'Enter' && addHouseNumber(street.id)}
                            />
                            <select
                              value={newHouseNumber.customerType}
                              onChange={(e) => setNewHouseNumber({...newHouseNumber, customerType: e.target.value})}
                              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="KIP möglich">🆕 KIP möglich</option>
                              <option value="Upsell möglich">📈 Upsell möglich</option>
                              <option value="Nur KAS">📡 Nur KAS</option>
                            </select>
                            <input
                              type="text"
                              value={newHouseNumber.name}
                              onChange={(e) => setNewHouseNumber({...newHouseNumber, name: e.target.value})}
                              placeholder="Name (optional)"
                              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <input
                              type="text"
                              value={newHouseNumber.currentContract}
                              onChange={(e) => setNewHouseNumber({...newHouseNumber, currentContract: e.target.value})}
                              placeholder="Aktueller Vertrag (optional)"
                              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <button
                            onClick={() => addHouseNumber(street.id)}
                            className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus size={16} />
                            Hausnummer hinzufügen
                          </button>
                        </div>
                      )}

                      {/* Adressen in dieser Straße */}
                      {street.addresses.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg">
                          Noch keine Hausnummern. Füge oben die erste Hausnummer hinzu.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {street.addresses.map(address => {
                            const customerTypeBadge = getCustomerTypeBadge(address.customerType);
                            return (
                              <div key={address.id} className="border rounded-lg overflow-hidden bg-white">
                                {/* Adresskopf */}
                                <div className={`p-3 ${address.status ? getStatusColor(address.status) : 'bg-white border'}`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Home size={16} className="text-gray-600" />
                                        <span className="font-semibold">
                                          Nr. {address.number}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${customerTypeBadge.color}`}>
                                          {customerTypeBadge.icon} {customerTypeBadge.label}
                                        </span>
                                      </div>
                                      {address.name && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 ml-5">
                                          <User size={12} />
                                          {address.name}
                                        </div>
                                      )}
                                      {address.currentContract && (
                                        <div className="text-sm text-gray-600 ml-5 mt-1">
                                          📋 {address.currentContract}
                                        </div>
                                      )}
                                      {address.status && (
                                        <div className="flex items-center gap-2 mt-2 ml-5">
                                          <Clock size={12} />
                                          <span className="text-sm font-medium">
                                            {address.status}
                                            {address.status === 'VERTRAG' && address.contract && ` (${address.contract})`}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => toggleExpanded(address.id)}
                                        className="p-1 hover:bg-white/50 rounded"
                                      >
                                        {expandedAddresses[address.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                      </button>
                                      <button
                                        onClick={() => deleteAddress(street.id, address.id)}
                                        className="p-1 hover:bg-red-100 rounded text-red-600"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Status-Buttons */}
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <button
                                      onClick={() => updateAddressStatus(street.id, address.id, 'KI')}
                                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium"
                                    >
                                      KI
                                    </button>
                                    <button
                                      onClick={() => updateAddressStatus(street.id, address.id, 'NM')}
                                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs font-medium"
                                    >
                                      NM
                                    </button>
                                    <button
                                      onClick={() => updateAddressStatus(street.id, address.id, 'NA')}
                                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-medium"
                                    >
                                      NA
                                    </button>
                                  </div>

                                  {/* Vertragsfeld */}
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      placeholder="Vertrag abgeschlossen - Details + Enter"
                                      className="w-full p-2 border rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                          updateAddressContract(street.id, address.id, e.target.value);
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Verlauf (erweitert) */}
                                {expandedAddresses[address.id] && address.statusHistory.length > 0 && (
                                  <div className="bg-gray-50 p-3 border-t">
                                    <h4 className="font-semibold text-xs text-gray-700 mb-2">Statusverlauf:</h4>
                                    <div className="space-y-1">
                                      {address.statusHistory.map((history, idx) => (
                                        <div key={idx} className="text-xs flex items-center justify-between gap-2 text-gray-600 bg-white p-2 rounded">
                                          <div className="flex items-center gap-2">
                                            <Clock size={12} />
                                            <span className="font-medium">{formatTimestamp(history.timestamp)}</span>
                                            <span>→</span>
                                            <span className="font-semibold">{history.status}</span>
                                            {history.contract && <span className="text-green-600">({history.contract})</span>}
                                          </div>
                                          <button
                                            onClick={() => deleteStatusHistoryEntry(street.id, address.id, idx)}
                                            className="p-1 hover:bg-red-100 rounded text-red-600"
                                            title="Eintrag löschen"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!currentListData && lists.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Noch keine Lauflisten</h3>
            <p className="text-gray-600 mb-4">Erstelle deine erste Laufliste, um loszulegen!</p>
            <button
              onClick={() => setShowNewListForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Erste Liste erstellen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GebietsLaufliste;