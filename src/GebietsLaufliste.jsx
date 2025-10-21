import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Clock, Home, User, ChevronDown, ChevronUp, Filter, X, Download, Upload, Search, Check, Edit2, FileText } from 'lucide-react';

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
  const [editingAddress, setEditingAddress] = useState(null);
  const [editForm, setEditForm] = useState({ number: '', name: '', currentContract: '', customerType: '' });
  const [userName, setUserName] = useState('');
  
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

  // Benutzername laden
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // Benutzername speichern
  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);


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
    if (window.confirm('⚠️ Liste wirklich löschen? Alle Daten gehen verloren!')) {
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
    const street = currentListData?.streets.find(s => s.id === streetId);
    const addressCount = street?.addresses.length || 0;
    
    if (window.confirm(`⚠️ Straße "${street?.name}" mit ${addressCount} Hausnummer(n) wirklich löschen?`)) {
      setLists(lists.map(list => {
        if (list.id === currentList) {
          return {
            ...list,
            streets: list.streets.filter(s => s.id !== streetId)
          };
        }
        return list;
      }));
    }
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
    if (window.confirm('⚠️ Hausnummer wirklich löschen?')) {
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
    }
  };

  const startEditAddress = (streetId, address) => {
    setEditingAddress({ streetId, addressId: address.id });
    setEditForm({
      number: address.number,
      name: address.name || '',
      currentContract: address.currentContract || '',
      customerType: address.customerType
    });
  };

  const cancelEdit = () => {
    setEditingAddress(null);
    setEditForm({ number: '', name: '', currentContract: '', customerType: '' });
  };

  const saveEdit = () => {
    if (!editForm.number.trim()) return;
    
    setLists(lists.map(list => {
      if (list.id === currentList) {
        return {
          ...list,
          streets: list.streets.map(street => {
            if (street.id === editingAddress.streetId) {
              return {
                ...street,
                addresses: street.addresses.map(addr => {
                  if (addr.id === editingAddress.addressId) {
                    return {
                      ...addr,
                      number: editForm.number,
                      name: editForm.name,
                      currentContract: editForm.currentContract,
                      customerType: editForm.customerType
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
    
    cancelEdit();
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
    
    // Statusverlauf automatisch öffnen
    setExpandedAddresses(prev => ({
      ...prev,
      [addressId]: true
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

    // Reset selection und Verlauf öffnen
    setSelectedProducts(prev => ({
      ...prev,
      [addressId]: []
    }));
    
    setExpandedAddresses(prev => ({
      ...prev,
      [addressId]: true
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
      case 'Sonstiges': return { icon: '🔸', color: 'bg-gray-100 text-gray-800', label: 'Sonstiges' };
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
      kipMoeglich: 0, upsellMoeglich: 0, nurKAS: 0, sonstiges: 0,
      productKIP: 0, productKAS: 0, productDIGI: 0, productNET: 0, productMOBILE: 0, productUPSELL: 0,
      geklingelt: 0, heute: { 
      geklingelt: 0, 
      vertrag: 0,
      productKIP: 0,
      productKAS: 0,
      productDIGI: 0,
      productNET: 0,
      productMOBILE: 0,
      productUPSELL: 0
    }, gestern: { geklingelt: 0, vertrag: 0 }, vorgestern: { geklingelt: 0, vertrag: 0 }
    };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    
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
      sonstiges: 0,
      productKIP: 0,
      productKAS: 0,
      productDIGI: 0,
      productNET: 0,
      productMOBILE: 0,
      productUPSELL: 0,
      geklingelt: 0,
      heute: { 
      geklingelt: 0, 
      vertrag: 0,
      productKIP: 0,
      productKAS: 0,
      productDIGI: 0,
      productNET: 0,
      productMOBILE: 0,
      productUPSELL: 0
    },
      gestern: { geklingelt: 0, vertrag: 0 },
      vorgestern: { geklingelt: 0, vertrag: 0 }
    };
    
    currentListData.streets.forEach(street => {
      street.addresses.forEach(addr => {
        stats.total++;
        
        // Status-Statistik
        if (addr.status === 'KI') stats.ki++;
        else if (addr.status === 'NM') stats.nm++;
        else if (addr.status === 'NA') stats.na++;
        else if (addr.status === 'VERTRAG') stats.vertrag++;
        else stats.offen++;

        // Geklingelte Türen (alle mit Status)
        if (addr.status) {
          stats.geklingelt++;
          
          // Zeitbasierte Statistik
          if (addr.statusHistory && addr.statusHistory.length > 0) {
            const lastStatus = addr.statusHistory[addr.statusHistory.length - 1];
            const statusDate = new Date(lastStatus.timestamp);
            const statusDay = new Date(statusDate.getFullYear(), statusDate.getMonth(), statusDate.getDate());
            
            if (statusDay.getTime() === today.getTime()) {
              stats.heute.geklingelt++;
              if (addr.status === 'VERTRAG') {
                stats.heute.vertrag++;
                // Produkte für heute zählen
                if (addr.products && Array.isArray(addr.products)) {
                  addr.products.forEach(product => {
                    if (product === 'KIP') stats.heute.productKIP++;
                    else if (product === 'KAS') stats.heute.productKAS++;
                    else if (product === 'DIGI') stats.heute.productDIGI++;
                    else if (product === 'NET') stats.heute.productNET++;
                    else if (product === 'MOBILE') stats.heute.productMOBILE++;
                    else if (product === 'UPSELL') stats.heute.productUPSELL++;
                  });
                }
              }
            } else if (statusDay.getTime() === yesterday.getTime()) {
              stats.gestern.geklingelt++;
              if (addr.status === 'VERTRAG') stats.gestern.vertrag++;
            } else if (statusDay.getTime() === dayBeforeYesterday.getTime()) {
              stats.vorgestern.geklingelt++;
              if (addr.status === 'VERTRAG') stats.vorgestern.vertrag++;
            }
          }
        }

        // Potenzial-Statistik
        let type = addr.customerType;
        if (type === 'Neukunde') type = 'KIP möglich';
        if (type === 'Upsell') type = 'Upsell möglich';
        if (type === 'nur KAS') type = 'Nur KAS';

        if (type === 'KIP möglich') stats.kipMoeglich++;
        else if (type === 'Upsell möglich') stats.upsellMoeglich++;
        else if (type === 'Nur KAS') stats.nurKAS++;
        else if (type === 'Sonstiges') stats.sonstiges++;

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

  // PDF Export Funktion
  const exportPDF = () => {
    const stats = getStatusStats();
    const listTitle = currentListData?.title || 'Laufliste';
    const today = new Date().toLocaleDateString('de-DE');
    
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${listTitle} - Übersicht</title>
  <style>
    body { 
      font-family: 'Courier New', monospace; 
      padding: 30px; 
      max-width: 800px; 
      margin: 0 auto;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      font-weight: bold;
    }
    .divider {
      margin: 20px 0;
      color: #666;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .info-line {
      margin: 5px 0;
      padding-left: 0;
    }
    .highlight {
      font-weight: bold;
      color: #000;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    📋 LAUFLISTE ÜBERSICHT
  </div>
  <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  
  <div class="info-line"><strong>Gebiet:</strong> ${listTitle}</div>
  <div class="info-line"><strong>Datum:</strong> ${today}</div>
  <div class="info-line"><strong>Vertriebler:</strong> ${userName || 'Nicht angegeben'}</div>
  
  <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  
  <div class="section">
    <div class="section-title">FORTSCHRITT</div>
    <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
    <div class="info-line">🚪 Geklingelt: <span class="highlight">${stats.geklingelt}/${stats.total}</span> Türen (<span class="highlight">${Math.round((stats.geklingelt / stats.total) * 100)}%</span>)</div>
  </div>

  <div class="section">
    <div class="section-title">STATUS</div>
    <div class="info-line">✅ Verträge: <span class="highlight">${stats.vertrag}</span></div>
    <div class="info-line">🔵 NA: <span class="highlight">${stats.na}</span></div>
    <div class="info-line">❌ KI: <span class="highlight">${stats.ki}</span></div>
    <div class="info-line">⚠️ NM: <span class="highlight">${stats.nm}</span></div>
    <div class="info-line">⚪ Offen: <span class="highlight">${stats.offen}</span> potenzielle Kunden</div>
  </div>

  <div class="section">
    <div class="section-title">PRODUKTE VERKAUFT</div>
    <div class="info-line">📞 KIP: <span class="highlight">${stats.productKIP}x</span></div>
    <div class="info-line">📱 MOBILE: <span class="highlight">${stats.productMOBILE}x</span></div>
    <div class="info-line">📺 DIGI: <span class="highlight">${stats.productDIGI}x</span></div>
    <div class="info-line">📡 KAS: <span class="highlight">${stats.productKAS}x</span></div>
    <div class="info-line">🔗 NET: <span class="highlight">${stats.productNET}x</span></div>
    <div class="info-line">📈 UPSELL: <span class="highlight">${stats.productUPSELL}x</span></div>
  </div>

  <div class="section">
    <div class="section-title">GESAMT PUNKTE</div>
    <div class="info-line">Gesamtpunktzahl: <span class="highlight" style="font-size: 18px;">${stats.productKIP + stats.productDIGI + stats.productNET + stats.productMOBILE}</span> Punkte</div>
    <div class="info-line" style="font-size: 12px; color: #666; margin-top: 10px;">
      (Gewertet: KIP + DIGI + NET + MOBILE = je 1 Punkt)
    </div>
  </div>

</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const stats = getStatusStats();

  return (
    <>
      {/* Zoom-Fix für Mobile */}
      <style>{`
        input, select, textarea {
          font-size: 16px !important;
        }
      `}</style>
      
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

          {/* Benutzer-Name Eingabe */}
          <div className="bg-blue-50 p-3 rounded-lg shadow mb-4">
            <div className="flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
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
                <>
                  <button
                    onClick={() => deleteList(currentList)}
                    className="px-3 py-2 md:px-4 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1 md:gap-2 text-sm md:text-base"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Löschen</span>
                  </button>
                  <button
                    onClick={exportPDF}
                    className="px-3 py-2 md:px-4 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 md:gap-2 text-sm md:text-base"
                  >
                    <FileText size={16} />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </>
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
              {/* Erweiterte Statistiken */}
              <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4">
                <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">Statistik</h2>
                
                {/* Geklingelte Türen Gesamt */}
                <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-600">🚪 Geklingelte Türen</div>
                      <div className="text-2xl md:text-3xl font-bold text-blue-700">{stats.geklingelt} <span className="text-sm text-gray-600">/ {stats.total}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-600">Fortschritt</div>
                      <div className="text-2xl md:text-3xl font-bold text-purple-700">{Math.round((stats.geklingelt / stats.total) * 100)}%</div>
                    </div>
                  </div>
                </div>

                {/* Vereinfachte Zeitraum-Statistik: Heute vs Gesamt */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Produktverkäufe</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {/* Heute */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border-2 border-blue-300">
                      <h4 className="font-bold text-base text-blue-800 mb-2 flex items-center gap-1">
                        📅 Heute
                      </h4>
                      <div className="text-xl font-bold text-blue-900 mb-2">
                        🚪 {stats.heute.geklingelt} Türen
                      </div>
                      <div className="text-xs space-y-1 bg-white/60 p-2 rounded">
                        <div className="flex justify-between">
                          <span>✅ Verträge:</span>
                          <span className="font-bold text-green-600">{stats.heute.vertrag}</span>
                        </div>
                        {stats.heute.productKIP > 0 && (
                          <div className="flex justify-between">
                            <span>📞 KIP:</span>
                            <span className="font-bold">{stats.heute.productKIP}x</span>
                          </div>
                        )}
                        {stats.heute.productKAS > 0 && (
                          <div className="flex justify-between">
                            <span>📡 KAS:</span>
                            <span className="font-bold">{stats.heute.productKAS}x</span>
                          </div>
                        )}
                        {stats.heute.productDIGI > 0 && (
                          <div className="flex justify-between">
                            <span>📺 DIGI:</span>
                            <span className="font-bold">{stats.heute.productDIGI}x</span>
                          </div>
                        )}
                        {stats.heute.productNET > 0 && (
                          <div className="flex justify-between">
                            <span>🔗 NET:</span>
                            <span className="font-bold">{stats.heute.productNET}x</span>
                          </div>
                        )}
                        {stats.heute.productMOBILE > 0 && (
                          <div className="flex justify-between">
                            <span>📱 MOBILE:</span>
                            <span className="font-bold">{stats.heute.productMOBILE}x</span>
                          </div>
                        )}
                        {stats.heute.productUPSELL > 0 && (
                          <div className="flex justify-between">
                            <span>📈 UPSELL:</span>
                            <span className="font-bold">{stats.heute.productUPSELL}x</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gesamt */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border-2 border-green-300">
                      <h4 className="font-bold text-base text-green-800 mb-2 flex items-center gap-1">
                        📊 Gesamt
                      </h4>
                      <div className="text-xl font-bold text-green-900 mb-2">
                        🚪 {stats.geklingelt} Türen
                      </div>
                      <div className="text-xs space-y-1 bg-white/60 p-2 rounded">
                        <div className="flex justify-between">
                          <span>✅ Verträge:</span>
                          <span className="font-bold text-green-600">{stats.vertrag}</span>
                        </div>
                        {stats.productKIP > 0 && (
                          <div className="flex justify-between">
                            <span>📞 KIP:</span>
                            <span className="font-bold">{stats.productKIP}x</span>
                          </div>
                        )}
                        {stats.productKAS > 0 && (
                          <div className="flex justify-between">
                            <span>📡 KAS:</span>
                            <span className="font-bold">{stats.productKAS}x</span>
                          </div>
                        )}
                        {stats.productDIGI > 0 && (
                          <div className="flex justify-between">
                            <span>📺 DIGI:</span>
                            <span className="font-bold">{stats.productDIGI}x</span>
                          </div>
                        )}
                        {stats.productNET > 0 && (
                          <div className="flex justify-between">
                            <span>🔗 NET:</span>
                            <span className="font-bold">{stats.productNET}x</span>
                          </div>
                        )}
                        {stats.productMOBILE > 0 && (
                          <div className="flex justify-between">
                            <span>📱 MOBILE:</span>
                            <span className="font-bold">{stats.productMOBILE}x</span>
                          </div>
                        )}
                        {stats.productUPSELL > 0 && (
                          <div className="flex justify-between">
                            <span>📈 UPSELL:</span>
                            <span className="font-bold">{stats.productUPSELL}x</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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
                  <div className="grid grid-cols-4 gap-2">
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
                    <div className="bg-gray-50 p-2 rounded-lg border-gray-200 border text-center">
                      <div className="text-lg md:text-xl font-bold text-gray-700">{stats.sonstiges}</div>
                      <div className="text-xs text-gray-600">Sonstiges</div>
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

              {/* Filter */}
              <div className="bg-white p-3 rounded-lg shadow mb-4">
                <div className="space-y-2">
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
                      <button
                        onClick={() => setCustomerTypeFilter('Sonstiges')}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          customerTypeFilter === 'Sonstiges' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        🔸 Sonstiges
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
                                      <option value="Sonstiges">🔸 Sonstiges</option>
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
                                    const isEditing = editingAddress?.streetId === street.id && editingAddress?.addressId === address.id;
                                    
                                    return (
                                      <div key={address.id} className="border rounded-lg overflow-hidden">
                                        <div className={`p-2 md:p-3 ${address.status ? getStatusColor(address.status) : 'bg-white border'}`}>
                                          {isEditing ? (
                                            // Edit-Modus
                                            <div className="space-y-2">
                                              <div className="font-semibold text-sm text-gray-700 mb-2">Hausnummer bearbeiten:</div>
                                              <input
                                                type="text"
                                                value={editForm.number}
                                                onChange={(e) => setEditForm({...editForm, number: e.target.value})}
                                                placeholder="Hausnummer *"
                                                className="w-full p-2 border rounded-lg text-sm"
                                              />
                                              <select
                                                value={editForm.customerType}
                                                onChange={(e) => setEditForm({...editForm, customerType: e.target.value})}
                                                className="w-full p-2 border rounded-lg text-sm"
                                              >
                                                <option value="KIP möglich">🆕 KIP möglich</option>
                                                <option value="Upsell möglich">📈 Upsell möglich</option>
                                                <option value="Nur KAS">📡 Nur KAS</option>
                                                <option value="Sonstiges">🔸 Sonstiges</option>
                                              </select>
                                              <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                placeholder="Name (optional)"
                                                className="w-full p-2 border rounded-lg text-sm"
                                              />
                                              <input
                                                type="text"
                                                value={editForm.currentContract}
                                                onChange={(e) => setEditForm({...editForm, currentContract: e.target.value})}
                                                placeholder="Aktueller Vertrag (optional)"
                                                className="w-full p-2 border rounded-lg text-sm"
                                              />
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={saveEdit}
                                                  className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                                >
                                                  ✓ Speichern
                                                </button>
                                                <button
                                                  onClick={cancelEdit}
                                                  className="flex-1 p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                                                >
                                                  ✕ Abbrechen
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            // Normal-Ansicht
                                            <>
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
                                                    onClick={() => startEditAddress(street.id, address)}
                                                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                    title="Bearbeiten"
                                                  >
                                                    <Edit2 size={14} />
                                                  </button>
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
                                            </>
                                          )}
                                        </div>

                                        {/* Verlauf - Standardmäßig geöffnet wenn Status vorhanden */}
                                        {!isEditing && address.statusHistory.length > 0 && expandedAddresses[address.id] !== false && (
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
    </>
  );
};

export default GebietsLaufliste;