import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Clock, Home, User, ChevronDown, ChevronUp, Filter, X, Download, Upload, Search, Check } from 'lucide-react';

const GebietsLaufliste = () => {
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [expandedAddresses, setExpandedAddresses] = useState({});
  const [expandedStreets, setExpandedStreets] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});
  
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
      products: [],
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

const toggleProductSelection = (addressId, product) => {
  setSelectedProducts(prev => {
    const currentProducts = prev[addressId] || [];
    const count = currentProducts.filter(p => p === product).length;
    
    // Limits prüfen
    if (product === 'MOBILE' && count >= 5) return prev;
    if (product === 'NET' && count >= 2) return prev;
    
    // Andere Produkte: nur 1x
    if (!['MOBILE', 'NET'].includes(product)) {
      const isSelected = currentProducts.includes(product);
      return {
        ...prev,
        [addressId]: isSelected 
          ? currentProducts.filter(p => p !== product)
          : [...currentProducts, product]
      };
    }
    
    // MOBILE/NET: Hinzufügen
    return {
      ...prev,
      [addressId]: [...currentProducts, product]
    };
  });
};

const removeProduct = (addressId, product) => {
  setSelectedProducts(prev => {
    const currentProducts = prev[addressId] || [];
    const index = currentProducts.indexOf(product);
    if (index === -1) return prev;
    
    const newProducts = [...currentProducts];
    newProducts.splice(index, 1);
    
    return {
      ...prev,
      [addressId]: newProducts
    };
  });
};

  const submitContract = (streetId, addressId) => {
    const products = selectedProducts[addressId] || [];
    if (products.length === 0) return;

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
                      products: products,
                      timestamp: new Date().toISOString()
                    };
                    return {
                      ...addr,
                      status: 'VERTRAG',
                      products: products,
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

    // Reset selection
    setSelectedProducts(prev => ({
      ...prev,
      [addressId]: []
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
                      products: lastEntry && lastEntry.products ? lastEntry.products : []
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

  const toggleStreetExpanded = (streetId) => {
    setExpandedStreets(prev => ({
      ...prev,
      [streetId]: !prev[streetId]
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
    if (customerType === 'Neukunde') customerType = 'KIP möglich';
    if (customerType === 'Upsell') customerType = 'Upsell möglich';
    if (customerType === 'nur KAS') customerType = 'Nur KAS';
    
    switch(customerType) {
      case 'KIP möglich': return { icon: '🆕', color: 'bg-blue-100 text-blue-800', label: 'KIP' };
      case 'Upsell möglich': return { icon: '📈', color: 'bg-purple-100 text-purple-800', label: 'Upsell' };
      case 'Nur KAS': return { icon: '📡', color: 'bg-orange-100 text-orange-800', label: 'KAS' };
      default: return { icon: '🆕', color: 'bg-blue-100 text-blue-800', label: 'KIP' };
    }
  };

  const getStreetStats = (street) => {
    const stats = {
      total: street.addresses.length,
      offen: 0,
      ki: 0,
      nm: 0,
      na: 0,
      vertrag: 0
    };

    street.addresses.forEach(addr => {
      if (!addr.status) stats.offen++;
      else if (addr.status === 'KI') stats.ki++;
      else if (addr.status === 'NM') stats.nm++;
      else if (addr.status === 'NA') stats.na++;
      else if (addr.status === 'VERTRAG') stats.vertrag++;
    });

    return stats;
  };

  const getStatusStats = () => {
    if (!currentListData || !currentListData.streets) return { 
      total: 0, ki: 0, nm: 0, na: 0, vertrag: 0, offen: 0,
      kipMoeglich: 0, upsellMoeglich: 0, nurKAS: 0,
      productKIP: 0, productKAS: 0, productDIGI: 0, productNET: 0, productMOBILE: 0, productUPSELL: 0
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
      nurKAS: 0,
      productKIP: 0,
      productKAS: 0,
      productDIGI: 0,
      productNET: 0,
      productMOBILE: 0,
      productUPSELL: 0
    };
    
    currentListData.streets.forEach(street => {
      street.addresses.forEach(addr => {
        stats.total++;
        if (addr.status === 'KI') stats.ki++;
        else if (addr.status === 'NM') stats.nm++;
        else if (addr.status === 'NA') stats.na++;
        else if (addr.status === 'VERTRAG') stats.vertrag++;
        else stats.offen++;

        let type = addr.customerType;
        if (type === 'Neukunde') type = 'KIP möglich';
        if (type === 'Upsell') type = 'Upsell möglich';
        if (type === 'nur KAS') type = 'Nur KAS';

        if (type === 'KIP möglich') stats.kipMoeglich++;
        else if (type === 'Upsell möglich') stats.upsellMoeglich++;
        else if (type === 'Nur KAS') stats.nurKAS++;

        // Produkt-Statistik
        if (addr.products && Array.isArray(addr.products)) {
          addr.products.forEach(product => {
            if (product === 'KIP') stats.productKIP++;
            else if (product === 'KAS') stats.productKAS++;
            else if (product === 'DIGI') stats.productDIGI++;
            else if (product === 'NET') stats.productNET++;
            else if (product === 'MOBILE') stats.productMOBILE++;
            else if (product === 'UPSELL') stats.productUPSELL++;
          });
        }
      });
    });
    
    return stats;
  };

  const filterAddress = (address) => {
    let statusMatch = true;
    if (statusFilter === 'OFFEN') {
      statusMatch = !address.status;
    } else if (statusFilter !== 'ALL') {
      statusMatch = address.status === statusFilter;
    }

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
    
    let streets = currentListData.streets;

    if (searchQuery.trim()) {
      streets = streets.filter(street => 
        street.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter === 'ALL' && customerTypeFilter === 'ALL') {
      return streets;
    }
    
    return streets
      .map(street => ({
        ...street,
        addresses: street.addresses.filter(filterAddress)
      }))
      .filter(street => street.addresses.length > 0);
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-2 px-2 md:py-4 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <MapPin className="text-blue-600" size={24} />
            Laufliste Manager
          </h1>
          <p className="text-sm text-gray-600 mt-1">Außendiensttouren</p>
        </div>

        {/* Listenauswahl */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4">
          <div className="flex gap-2 md:gap-4 items-center flex-wrap">
            <select
              value={currentList || ''}
              onChange={(e) => setCurrentList(Number(e.target.value))}
              className="flex-1 min-w-[200px] p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="">Liste auswählen...</option>
              {lists.map(list => {
                const totalAddresses = list.streets ? list.streets.reduce((sum, street) => sum + street.addresses.length, 0) : 0;
                const streetCount = list.streets ? list.streets.length : 0;
                return (
                  <option key={list.id} value={list.id}>
                    {list.title} ({streetCount} Str., {totalAddresses} Adr.)
                  </option>
                );
              })}
            </select>
            
            {currentList && (
              <button
                onClick={() => deleteList(currentList)}
                className="px-3 py-2 md:px-4 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Löschen</span>
              </button>
            )}
            
            <button
              onClick={() => setShowNewListForm(!showNewListForm)}
              className="px-3 py-2 md:px-4 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 md:gap-2 text-sm md:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Neue Liste</span>
            </button>
          </div>

          {showNewListForm && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Listentitel (z.B. 'Gebiet Mainz Nord - KW 40')"
                className="w-full p-2 md:p-3 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                onKeyPress={(e) => e.key === 'Enter' && createNewList()}
              />
              <div className="flex gap-2">
                <button
                  onClick={createNewList}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Erstellen
                </button>
                <button
                  onClick={() => setShowNewListForm(false)}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Backup Buttons */}
          <div className="mt-3 pt-3 border-t flex gap-2 flex-wrap">
            <button
              onClick={exportData}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
            >
              <Download size={14} />
              Backup
            </button>
            <label className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1 cursor-pointer text-sm">
              <Upload size={14} />
              Restore
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {currentListData && (
          <>
            {/* Statistiken - Kompakt */}
            <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4">
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">Statistik</h2>
              
              {/* Status */}
              <div className="mb-3">
                <h3 className="text-xs font-medium text-gray-600 mb-1">Status</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg border text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-700">{stats.total}</div>
                    <div className="text-xs text-gray-600">Gesamt</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg border text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-700">{stats.offen}</div>
                    <div className="text-xs text-gray-600">Offen</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg border-red-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-red-700">{stats.ki}</div>
                    <div className="text-xs text-red-600">KI</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded-lg border-yellow-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-yellow-700">{stats.nm}</div>
                    <div className="text-xs text-yellow-600">NM</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg border-blue-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-blue-700">{stats.na}</div>
                    <div className="text-xs text-blue-600">NA</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg border-green-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-green-700">{stats.vertrag}</div>
                    <div className="text-xs text-green-600">Vertrag</div>
                  </div>
                </div>
              </div>

              {/* Potenzial */}
              <div className="mb-3">
                <h3 className="text-xs font-medium text-gray-600 mb-1">Potenzial</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg border-blue-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-blue-700">{stats.kipMoeglich}</div>
                    <div className="text-xs text-blue-600">KIP</div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg border-purple-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-purple-700">{stats.upsellMoeglich}</div>
                    <div className="text-xs text-purple-600">Upsell</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg border-orange-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-orange-700">{stats.nurKAS}</div>
                    <div className="text-xs text-orange-600">KAS</div>
                  </div>
                </div>
              </div>

              {/* Verkaufte Produkte */}
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-1">Verkaufte Produkte</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="bg-indigo-50 p-2 rounded-lg border-indigo-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-indigo-700">{stats.productKIP}</div>
                    <div className="text-xs text-indigo-600">KIP</div>
                  </div>
                  <div className="bg-pink-50 p-2 rounded-lg border-pink-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-pink-700">{stats.productKAS}</div>
                    <div className="text-xs text-pink-600">KAS</div>
                  </div>
                  <div className="bg-cyan-50 p-2 rounded-lg border-cyan-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-cyan-700">{stats.productDIGI}</div>
                    <div className="text-xs text-cyan-600">DIGI</div>
                  </div>
                  <div className="bg-teal-50 p-2 rounded-lg border-teal-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-teal-700">{stats.productNET}</div>
                    <div className="text-xs text-teal-600">NET</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border-amber-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-amber-700">{stats.productMOBILE}</div>
                    <div className="text-xs text-amber-600">MOBILE</div>
                  </div>
                  <div className="bg-violet-50 p-2 rounded-lg border-violet-200 border text-center">
                    <div className="text-lg md:text-xl font-bold text-violet-700">{stats.productUPSELL}</div>
                    <div className="text-xs text-violet-600">UPSELL</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suchfeld */}
            <div className="bg-white p-3 rounded-lg shadow mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Straße suchen..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter - Kompakt */}
            <div className="bg-white p-3 rounded-lg shadow mb-4">
              <div className="space-y-2">
                {/* Status Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-700">Status:</span>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusFilter === 'ALL' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      onClick={() => setStatusFilter('OFFEN')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusFilter === 'OFFEN' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Offen
                    </button>
                    <button
                      onClick={() => setStatusFilter('NA')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusFilter === 'NA' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      NA
                    </button>
                    <button
                      onClick={() => setStatusFilter('VERTRAG')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusFilter === 'VERTRAG' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      Vertrag
                    </button>
                  </div>
                </div>

                {/* Potenzial Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-700">Potenzial:</span>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setCustomerTypeFilter('ALL')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        customerTypeFilter === 'ALL' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      onClick={() => setCustomerTypeFilter('KIP möglich')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        customerTypeFilter === 'KIP möglich' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      🆕 KIP
                    </button>
                    <button
                      onClick={() => setCustomerTypeFilter('Upsell möglich')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        customerTypeFilter === 'Upsell möglich' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      📈 Upsell
                    </button>
                    <button
                      onClick={() => setCustomerTypeFilter('Nur KAS')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        customerTypeFilter === 'Nur KAS' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      📡 KAS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Neue Straße hinzufügen */}
            <div className="bg-white p-3 rounded-lg shadow mb-4">
              <h2 className="text-base font-semibold mb-2 text-gray-800">Neue Straße</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="Straßenname..."
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && addStreet()}
                />
                <button
                  onClick={addStreet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline text-sm">Anlegen</span>
                </button>
              </div>
            </div>

            {/* Straßenliste */}
            <div className="bg-white p-3 rounded-lg shadow">
              <h2 className="text-base md:text-lg font-semibold mb-3 text-gray-800">
                Straßen ({getFilteredStreets().length})
              </h2>
              
              {currentListData.streets.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Noch keine Straßen. Füge oben eine Straße hinzu.
                </div>
              ) : getFilteredStreets().length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Keine Straßen gefunden.
                </div>
              ) : (
                <div className="space-y-2">
                  {getFilteredStreets().map(street => {
                    const streetStats = getStreetStats(street);
                    const isExpanded = expandedStreets[street.id];
                    const completed = streetStats.total - streetStats.offen;
                    const progressPercent = streetStats.total > 0 ? (completed / streetStats.total) * 100 : 0;

                    return (
                      <div key={street.id} className="border-2 border-blue-200 rounded-lg bg-blue-50">
                        {/* Straßenkopf - Klickbar */}
                        <div 
                          className="p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleStreetExpanded(street.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              {isExpanded ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-blue-600" />}
                              <MapPin size={18} className="text-blue-600" />
                              <h3 className="text-base md:text-lg font-bold text-blue-900">{street.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs md:text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-semibold">
                                {completed}/{streetStats.total}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStreet(street.id);
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Fortschrittsbalken */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {/* Schnellstatistik */}
                          <div className="flex gap-2 text-xs flex-wrap">
                            {streetStats.offen > 0 && <span className="bg-gray-100 px-2 py-0.5 rounded">⚪ {streetStats.offen} Offen</span>}
                            {streetStats.na > 0 && <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">🔵 {streetStats.na} NA</span>}
                            {streetStats.vertrag > 0 && <span className="bg-green-100 px-2 py-0.5 rounded text-green-700">✅ {streetStats.vertrag} Vertrag</span>}
                            {streetStats.ki > 0 && <span className="bg-red-100 px-2 py-0.5 rounded text-red-700">❌ {streetStats.ki} KI</span>}
                            {streetStats.nm > 0 && <span className="bg-yellow-100 px-2 py-0.5 rounded text-yellow-700">⚠️ {streetStats.nm} NM</span>}
                          </div>
                        </div>

                        {/* Erweiterte Ansicht */}
                        {isExpanded && (
                          <div className="border-t border-blue-200 p-3 bg-white">
                            {/* Hausnummer hinzufügen */}
                            {statusFilter === 'ALL' && customerTypeFilter === 'ALL' && (
                              <div className="bg-blue-50 p-2 rounded-lg mb-3 border border-blue-200">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={newHouseNumber.number}
                                    onChange={(e) => setNewHouseNumber({...newHouseNumber, number: e.target.value})}
                                    placeholder="Nr. *"
                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    onKeyPress={(e) => e.key === 'Enter' && addHouseNumber(street.id)}
                                  />
                                  <select
                                    value={newHouseNumber.customerType}
                                    onChange={(e) => setNewHouseNumber({...newHouseNumber, customerType: e.target.value})}
                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                                  >
                                    <option value="KIP möglich">🆕 KIP</option>
                                    <option value="Upsell möglich">📈 Upsell</option>
                                    <option value="Nur KAS">📡 KAS</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={newHouseNumber.name}
                                    onChange={(e) => setNewHouseNumber({...newHouseNumber, name: e.target.value})}
                                    placeholder="Name"
                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  <input
                                    type="text"
                                    value={newHouseNumber.currentContract}
                                    onChange={(e) => setNewHouseNumber({...newHouseNumber, currentContract: e.target.value})}
                                    placeholder="Vertrag"
                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                </div>
                                <button
                                  onClick={() => addHouseNumber(street.id)}
                                  className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                                >
                                  <Plus size={14} />
                                  Hausnummer
                                </button>
                              </div>
                            )}

                            {/* Adressen */}
                            {street.addresses.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                Noch keine Hausnummern.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {street.addresses.map(address => {
                                  const customerTypeBadge = getCustomerTypeBadge(address.customerType);
                                  const addressProducts = selectedProducts[address.id] || [];
                                  
                                  return (
                                    <div key={address.id} className="border rounded-lg overflow-hidden">
                                      <div className={`p-2 md:p-3 ${address.status ? getStatusColor(address.status) : 'bg-white border'}`}>
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                              <Home size={14} />
                                              <span className="font-semibold text-sm md:text-base">Nr. {address.number}</span>
                                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${customerTypeBadge.color}`}>
                                                {customerTypeBadge.icon} {customerTypeBadge.label}
                                              </span>
                                            </div>
                                            {address.name && (
                                              <div className="flex items-center gap-1 text-xs text-gray-600 ml-4">
                                                <User size={10} />
                                                {address.name}
                                              </div>
                                            )}
                                            {address.currentContract && (
                                              <div className="text-xs text-gray-600 ml-4 mt-1">
                                                📋 {address.currentContract}
                                              </div>
                                            )}
                                            {address.status && (
                                              <div className="flex items-center gap-1 mt-1 ml-4 flex-wrap">
                                                <Clock size={10} />
                                                <span className="text-xs font-medium">
                                                  {address.status}
                                                  {address.status === 'VERTRAG' && address.products && address.products.length > 0 && (
                                                    <span className="ml-1">({address.products.join(', ')})</span>
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => toggleExpanded(address.id)}
                                              className="p-1 hover:bg-white/50 rounded"
                                            >
                                              {expandedAddresses[address.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                            <button
                                              onClick={() => deleteAddress(street.id, address.id)}
                                              className="p-1 hover:bg-red-100 rounded text-red-600"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Status-Buttons - Kompakt */}
                                        <div className="flex gap-1 mb-2">
                                          <button
                                            onClick={() => updateAddressStatus(street.id, address.id, 'KI')}
                                            className="flex-1 px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium active:scale-95 transition-transform"
                                          >
                                            KI
                                          </button>
                                          <button
                                            onClick={() => updateAddressStatus(street.id, address.id, 'NM')}
                                            className="flex-1 px-2 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs font-medium active:scale-95 transition-transform"
                                          >
                                            NM
                                          </button>
                                          <button
                                            onClick={() => updateAddressStatus(street.id, address.id, 'NA')}
                                            className="flex-1 px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-medium active:scale-95 transition-transform"
                                          >
                                            NA
                                          </button>
                                        </div>

{/* Produkt-Auswahl Buttons */}
                                        <div className="mb-2">
                                          <div className="text-xs font-medium text-gray-700 mb-1">Vertrag - Produkte wählen:</div>
                                          <div className="grid grid-cols-3 gap-1 mb-2">
                                            {['KIP', 'KAS', 'DIGI', 'NET', 'MOBILE', 'UPSELL'].map(product => {
                                              const count = addressProducts.filter(p => p === product).length;
                                              const isMulti = ['MOBILE', 'NET'].includes(product);
                                              const maxCount = product === 'MOBILE' ? 5 : product === 'NET' ? 2 : 1;
                                              
                                              return (
                                                <div key={product} className="flex gap-1">
                                                  <button
                                                    onClick={() => toggleProductSelection(address.id, product)}
                                                    className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                                                      count > 0
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                                  >
                                                    {count > 0 && <Check size={12} />}
                                                    {product} {count > 0 && isMulti && `(${count})`}
                                                  </button>
                                                  {isMulti && count > 0 && (
                                                    <button
                                                      onClick={() => removeProduct(address.id, product)}
                                                      className="px-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                                                    >
                                                      -
                                                    </button>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                          <button
                                            onClick={() => submitContract(street.id, address.id)}
                                            disabled={addressProducts.length === 0}
                                            className={`w-full p-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                                              addressProducts.length === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                          >
                                            ✅ Vertrag senden ({addressProducts.length})
                                          </button>
                                        </div>
                                        </div>
                                        

                                      {/* Verlauf */}
                                      {expandedAddresses[address.id] && address.statusHistory.length > 0 && (
                                        <div className="bg-gray-50 p-2 border-t">
                                          <h4 className="font-semibold text-xs text-gray-700 mb-1">Verlauf:</h4>
                                          <div className="space-y-1">
                                            {address.statusHistory.map((history, idx) => (
                                              <div key={idx} className="text-xs flex items-center justify-between gap-2 text-gray-600 bg-white p-1.5 rounded">
                                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                                  <Clock size={10} />
                                                  <span className="font-medium text-xs truncate">{formatTimestamp(history.timestamp)}</span>
                                                  <span>→</span>
                                                  <span className="font-semibold">{history.status}</span>
                                                  {history.products && history.products.length > 0 && (
                                                    <span className="text-green-600 truncate">({history.products.join(', ')})</span>
                                                  )}
                                                </div>
                                                <button
                                                  onClick={() => deleteStatusHistoryEntry(street.id, address.id, idx)}
                                                  className="p-1 hover:bg-red-100 rounded text-red-600 flex-shrink-0"
                                                >
                                                  <X size={12} />
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {!currentListData && lists.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Noch keine Lauflisten</h3>
            <p className="text-gray-600 mb-4">Erstelle deine erste Laufliste!</p>
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