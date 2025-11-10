import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Phone, MapPin, CreditCard, CheckSquare, 
  Plus, Trash2, Filter, Download, Upload, Eye, EyeOff, 
  Search, X, Edit2, Check, Clock, FileText 
} from 'lucide-react';

const Kundendatenbank = () => {
  const [customers, setCustomers] = useState([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [todoFilter, setTodoFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [password, setPassword] = useState('admin123'); // Initial-Passwort
  const [visibleIBANs, setVisibleIBANs] = useState({});
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    vorname: '',
    nachname: '',
    neuerName: '',
    geburtsdatum: '',
    rufnummer: '',
    strasse: '',
    hausnummer: '',
    kundennummer: '',
    iban: '',
    status: 'Installation offen'
  });

  // LocalStorage laden
  useEffect(() => {
    const savedCustomers = localStorage.getItem('kundendatenbank');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
    
    const savedPassword = localStorage.getItem('kundendatenbankPassword');
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  // LocalStorage speichern
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('kundendatenbank', JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('kundendatenbankPassword', password);
  }, [password]);

  const addCustomer = () => {
    if (!newCustomer.vorname || !newCustomer.nachname) {
      alert('Bitte mindestens Vor- und Nachname eingeben!');
      return;
    }

    const customer = {
      id: Date.now(),
      ...newCustomer,
      todos: [],
      createdAt: new Date().toISOString()
    };

    setCustomers([customer, ...customers]);
    setNewCustomer({
      vorname: '',
      nachname: '',
      neuerName: '',
      geburtsdatum: '',
      rufnummer: '',
      strasse: '',
      hausnummer: '',
      kundennummer: '',
      iban: '',
      status: 'Installation offen'
    });
    setShowNewCustomerForm(false);
  };

  const deleteCustomer = (customerId) => {
    if (window.confirm('⚠️ Kunde wirklich löschen?')) {
      setCustomers(customers.filter(c => c.id !== customerId));
    }
  };

  const updateCustomerStatus = (customerId, newStatus) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: newStatus }
        : customer
    ));
  };

  const addTodo = (customerId, todoType) => {
    const todo = {
      id: Date.now(),
      type: todoType,
      text: todoType === 'Eigener Text' ? '' : todoType,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? { ...customer, todos: [...customer.todos, todo] }
        : customer
    ));
  };

  const toggleTodo = (customerId, todoId) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? {
            ...customer,
            todos: customer.todos.map(todo =>
              todo.id === todoId
                ? { ...todo, completed: !todo.completed }
                : todo
            )
          }
        : customer
    ));
  };

  const deleteTodo = (customerId, todoId) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? {
            ...customer,
            todos: customer.todos.filter(todo => todo.id !== todoId)
          }
        : customer
    ));
  };

  const updateTodoText = (customerId, todoId, newText) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? {
            ...customer,
            todos: customer.todos.map(todo =>
              todo.id === todoId
                ? { ...todo, text: newText }
                : todo
            )
          }
        : customer
    ));
  };

  const formatIBAN = (iban, isVisible) => {
    if (!iban) return '';
    
    if (isVisible) {
      // Formatiere IBAN in 4er-Gruppen
      return iban.match(/.{1,4}/g)?.join(' ') || iban;
    }
    
    // Zeige nur letzte 4 Stellen
    const lastFour = iban.slice(-4);
    const hiddenPart = 'x'.repeat(Math.max(0, iban.length - 4));
    const formatted = hiddenPart + lastFour;
    return formatted.match(/.{1,4}/g)?.join(' ') || formatted;
  };

  const toggleIBANVisibility = (customerId) => {
    if (visibleIBANs[customerId]) {
      // Verstecke IBAN
      setVisibleIBANs(prev => {
        const newVisible = { ...prev };
        delete newVisible[customerId];
        return newVisible;
      });
    } else {
      // Zeige IBAN - Passwort abfragen
      const inputPassword = prompt('Passwort eingeben:');
      if (inputPassword === password) {
        setVisibleIBANs(prev => ({
          ...prev,
          [customerId]: true
        }));
      } else {
        alert('❌ Falsches Passwort!');
      }
    }
  };

  const startEditCustomer = (customer) => {
    setEditingCustomer({ ...customer });
  };

  const saveEditCustomer = () => {
    if (!editingCustomer.vorname || !editingCustomer.nachname) {
      alert('Bitte mindestens Vor- und Nachname eingeben!');
      return;
    }

    setCustomers(customers.map(customer =>
      customer.id === editingCustomer.id
        ? editingCustomer
        : customer
    ));
    setEditingCustomer(null);
  };

  const cancelEdit = () => {
    setEditingCustomer(null);
  };

  const toggleExpanded = (customerId) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Installation offen': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Installiert': return 'bg-green-100 text-green-700 border-green-300';
      case 'Storniert': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filterCustomer = (customer) => {
    // Status-Filter
    if (statusFilter !== 'ALL' && customer.status !== statusFilter) {
      return false;
    }

    // Todo-Filter
    if (todoFilter !== 'ALL') {
      if (todoFilter === 'Installation offen') {
        const hasOpenInstallation = customer.todos.some(
          todo => !todo.completed && (todo.type === 'Installation' || todo.text.toLowerCase().includes('installation'))
        );
        if (!hasOpenInstallation && customer.status !== 'Installation offen') {
          return false;
        }
      } else if (todoFilter === 'Rufnummermitnahme offen') {
        const hasOpenRufnummermitnahme = customer.todos.some(
          todo => !todo.completed && (todo.type === 'Rufnummermitnahme' || todo.text.toLowerCase().includes('rufnummer'))
        );
        if (!hasOpenRufnummermitnahme) {
          return false;
        }
      }
    }

    // Such-Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        customer.vorname.toLowerCase().includes(query) ||
        customer.nachname.toLowerCase().includes(query) ||
        (customer.neuerName && customer.neuerName.toLowerCase().includes(query)) ||
        (customer.kundennummer && customer.kundennummer.toLowerCase().includes(query)) ||
        (customer.strasse && customer.strasse.toLowerCase().includes(query))
      );
    }

    return true;
  };

  const getFilteredCustomers = () => {
    return customers.filter(filterCustomer);
  };

  const getStats = () => {
    const stats = {
      total: customers.length,
      installationOffen: 0,
      installiert: 0,
      storniert: 0,
      offeneTodos: 0,
      openInstallations: 0,
      openRufnummermitnahme: 0
    };

    customers.forEach(customer => {
      if (customer.status === 'Installation offen') stats.installationOffen++;
      else if (customer.status === 'Installiert') stats.installiert++;
      else if (customer.status === 'Storniert') stats.storniert++;

      const openTodos = customer.todos.filter(todo => !todo.completed);
      stats.offeneTodos += openTodos.length;

      if (openTodos.some(todo => todo.type === 'Installation' || todo.text.toLowerCase().includes('installation')) || 
          customer.status === 'Installation offen') {
        stats.openInstallations++;
      }

      if (openTodos.some(todo => todo.type === 'Rufnummermitnahme' || todo.text.toLowerCase().includes('rufnummer'))) {
        stats.openRufnummermitnahme++;
      }
    });

    return stats;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(customers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `kundendatenbank-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (window.confirm('Backup importieren? Aktuelle Daten werden überschrieben!')) {
          setCustomers(importedData);
          alert('Backup erfolgreich importiert!');
        }
      } catch (error) {
        alert('Fehler beim Importieren: Ungültige Backup-Datei');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const exportPDF = () => {
    const stats = getStats();
    const today = new Date().toLocaleDateString('de-DE');
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kundendatenbank - Übersicht</title>
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
    .customer {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .info-line {
      margin: 5px 0;
    }
    .highlight {
      font-weight: bold;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    📊 KUNDENDATENBANK ÜBERSICHT
  </div>
  <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  
  <div class="info-line"><strong>Datum:</strong> ${today}</div>
  <div class="info-line"><strong>Gesamt Kunden:</strong> ${stats.total}</div>
  
  <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  
  <div class="section">
    <div class="section-title">STATUS ÜBERSICHT</div>
    <div class="info-line">⏳ Installation offen: <span class="highlight">${stats.installationOffen}</span></div>
    <div class="info-line">✅ Installiert: <span class="highlight">${stats.installiert}</span></div>
    <div class="info-line">❌ Storniert: <span class="highlight">${stats.storniert}</span></div>
  </div>

  <div class="section">
    <div class="section-title">OFFENE AUFGABEN</div>
    <div class="info-line">📋 Offene Todos gesamt: <span class="highlight">${stats.offeneTodos}</span></div>
    <div class="info-line">🔧 Kunden mit offener Installation: <span class="highlight">${stats.openInstallations}</span></div>
    <div class="info-line">📞 Kunden mit offener Rufnummermitnahme: <span class="highlight">${stats.openRufnummermitnahme}</span></div>
  </div>

  <div class="section">
    <div class="section-title">KUNDENLISTE</div>
    ${customers.map(customer => `
      <div class="customer">
        <div class="info-line">
          <strong>${customer.vorname} ${customer.nachname}</strong>
          ${customer.neuerName ? `<em>(${customer.neuerName})</em>` : ''}
        </div>
        <div class="info-line">Status: <span class="highlight">${customer.status}</span></div>
        ${customer.kundennummer ? `<div class="info-line">Kundennr.: ${customer.kundennummer}</div>` : ''}
        ${customer.rufnummer ? `<div class="info-line">Tel.: ${customer.rufnummer}</div>` : ''}
        ${customer.strasse ? `<div class="info-line">Adresse: ${customer.strasse} ${customer.hausnummer}</div>` : ''}
        ${customer.todos.length > 0 ? `
          <div class="info-line" style="margin-top: 8px;">
            <strong>Todos:</strong>
            <ul style="margin: 5px 0;">
              ${customer.todos.map(todo => `
                <li>${todo.completed ? '✅' : '⏳'} ${todo.text}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>

</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const stats = getStats();
  const filteredCustomers = getFilteredCustomers();

  return (
    <>
      {/* Zoom-Fix für Mobile */}
      <style>{`
        input, select, textarea {
          font-size: 16px !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 py-2 px-2 md:py-4 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <User className="text-purple-600" size={24} />
              Kundendatenbank
            </h1>
            <p className="text-sm text-gray-600 mt-1">Kunden & Aufgaben verwalten</p>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                className="px-3 py-2 md:px-4 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Neuer Kunde</span>
              </button>
              
              <button
                onClick={exportPDF}
                className="px-3 py-2 md:px-4 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">PDF</span>
              </button>

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

            {/* Passwort ändern */}
            <div className="mt-3 pt-3 border-t">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                  🔐 Passwort ändern
                </summary>
                <div className="mt-2 flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Neues Passwort"
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={() => alert('Passwort gespeichert!')}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Speichern
                  </button>
                </div>
              </details>
            </div>
          </div>

          {/* Neuer Kunde Formular */}
          {showNewCustomerForm && (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Neuer Kunde</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newCustomer.vorname}
                  onChange={(e) => setNewCustomer({...newCustomer, vorname: e.target.value})}
                  placeholder="Vorname *"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={newCustomer.nachname}
                  onChange={(e) => setNewCustomer({...newCustomer, nachname: e.target.value})}
                  placeholder="Nachname *"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={newCustomer.neuerName}
                  onChange={(e) => setNewCustomer({...newCustomer, neuerName: e.target.value})}
                  placeholder="Neuer Name (optional)"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="date"
                  value={newCustomer.geburtsdatum}
                  onChange={(e) => setNewCustomer({...newCustomer, geburtsdatum: e.target.value})}
                  placeholder="Geburtsdatum"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="tel"
                  value={newCustomer.rufnummer}
                  onChange={(e) => setNewCustomer({...newCustomer, rufnummer: e.target.value})}
                  placeholder="Rufnummer"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={newCustomer.strasse}
                  onChange={(e) => setNewCustomer({...newCustomer, strasse: e.target.value})}
                  placeholder="Straße"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={newCustomer.hausnummer}
                  onChange={(e) => setNewCustomer({...newCustomer, hausnummer: e.target.value})}
                  placeholder="Hausnummer"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={newCustomer.kundennummer}
                  onChange={(e) => setNewCustomer({...newCustomer, kundennummer: e.target.value})}
                  placeholder="Kundennummer"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={newCustomer.iban}
                  onChange={(e) => setNewCustomer({...newCustomer, iban: e.target.value.replace(/\s/g, '')})}
                  placeholder="IBAN"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <select
                  value={newCustomer.status}
                  onChange={(e) => setNewCustomer({...newCustomer, status: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Installation offen">Installation offen</option>
                  <option value="Installiert">Installiert</option>
                  <option value="Storniert">Storniert</option>
                </select>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addCustomer}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  ✓ Kunde anlegen
                </button>
                <button
                  onClick={() => setShowNewCustomerForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                >
                  ✕ Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Statistiken */}
          <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4">
            <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">Statistik</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-gray-50 p-2 rounded-lg border text-center">
                <div className="text-lg md:text-xl font-bold text-gray-700">{stats.total}</div>
                <div className="text-xs text-gray-600">Kunden</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded-lg border-yellow-200 border text-center">
                <div className="text-lg md:text-xl font-bold text-yellow-700">{stats.installationOffen}</div>
                <div className="text-xs text-yellow-600">Inst. offen</div>
              </div>
              <div className="bg-green-50 p-2 rounded-lg border-green-200 border text-center">
                <div className="text-lg md:text-xl font-bold text-green-700">{stats.installiert}</div>
                <div className="text-xs text-green-600">Installiert</div>
              </div>
              <div className="bg-red-50 p-2 rounded-lg border-red-200 border text-center">
                <div className="text-lg md:text-xl font-bold text-red-700">{stats.storniert}</div>
                <div className="text-xs text-red-600">Storniert</div>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border-blue-200 border text-center">
                <div className="text-lg md:text-xl font-bold text-blue-700">{stats.offeneTodos}</div>
                <div className="text-xs text-blue-600">Offene Todos</div>
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
                placeholder="Kunde suchen..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
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
                    onClick={() => setStatusFilter('Installation offen')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusFilter === 'Installation offen' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    ⏳ Installation offen
                  </button>
                  <button
                    onClick={() => setStatusFilter('Installiert')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusFilter === 'Installiert' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    ✅ Installiert
                  </button>
                  <button
                    onClick={() => setStatusFilter('Storniert')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusFilter === 'Storniert' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    ❌ Storniert
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-700">Aufgaben:</span>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setTodoFilter('ALL')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      todoFilter === 'ALL' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setTodoFilter('Installation offen')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      todoFilter === 'Installation offen' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    🔧 Installation offen
                  </button>
                  <button
                    onClick={() => setTodoFilter('Rufnummermitnahme offen')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      todoFilter === 'Rufnummermitnahme offen' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    📞 Rufnummermitnahme offen
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Kundenliste */}
          <div className="bg-white p-3 rounded-lg shadow">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-gray-800">
              Kunden ({filteredCustomers.length})
            </h2>

            {customers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <p>Noch keine Kunden vorhanden.</p>
                <button
                  onClick={() => setShowNewCustomerForm(true)}
                  className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
                >
                  <Plus size={18} />
                  Ersten Kunden anlegen
                </button>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                Keine Kunden gefunden.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map(customer => {
                  const isExpanded = expandedCustomers[customer.id];
                  const isEditing = editingCustomer?.id === customer.id;
                  const openTodos = customer.todos.filter(t => !t.completed).length;

                  return (
                    <div key={customer.id} className={`border-2 rounded-lg overflow-hidden ${getStatusColor(customer.status)}`}>
                      {/* Kunden-Header */}
                      <div 
                        className="p-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => !isEditing && toggleExpanded(customer.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User size={16} />
                              <span className="font-bold text-base">
                                {customer.vorname} {customer.nachname}
                              </span>
                              {customer.neuerName && (
                                <span className="text-sm italic">({customer.neuerName})</span>
                              )}
                            </div>
                            {customer.kundennummer && (
                              <div className="text-xs ml-5">KdNr: {customer.kundennummer}</div>
                            )}
                            {openTodos > 0 && (
                              <div className="text-xs ml-5 mt-1 font-semibold">
                                📋 {openTodos} offene Todo{openTodos !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isEditing) toggleExpanded(customer.id);
                              }}
                              className="p-1 hover:bg-white/50 rounded"
                            >
                              {isExpanded ? <Check size={16} /> : <Edit2 size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Erweiterte Ansicht */}
                      {isExpanded && (
                        <div className="border-t p-3 bg-white">
                          {isEditing ? (
                            // Edit-Modus
                            <div className="space-y-2">
                              <div className="font-semibold text-sm mb-2">Kunde bearbeiten:</div>
                              <div className="grid md:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editingCustomer.vorname}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, vorname: e.target.value})}
                                  placeholder="Vorname *"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  value={editingCustomer.nachname}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, nachname: e.target.value})}
                                  placeholder="Nachname *"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  value={editingCustomer.neuerName}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, neuerName: e.target.value})}
                                  placeholder="Neuer Name"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="date"
                                  value={editingCustomer.geburtsdatum}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, geburtsdatum: e.target.value})}
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="tel"
                                  value={editingCustomer.rufnummer}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, rufnummer: e.target.value})}
                                  placeholder="Rufnummer"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  value={editingCustomer.strasse}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, strasse: e.target.value})}
                                  placeholder="Straße"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  value={editingCustomer.hausnummer}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, hausnummer: e.target.value})}
                                  placeholder="Hausnummer"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  value={editingCustomer.kundennummer}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, kundennummer: e.target.value})}
                                  placeholder="Kundennummer"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  value={editingCustomer.iban}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, iban: e.target.value.replace(/\s/g, '')})}
                                  placeholder="IBAN"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <select
                                  value={editingCustomer.status}
                                  onChange={(e) => setEditingCustomer({...editingCustomer, status: e.target.value})}
                                  className="p-2 border rounded-lg text-sm"
                                >
                                  <option value="Installation offen">Installation offen</option>
                                  <option value="Installiert">Installiert</option>
                                  <option value="Storniert">Storniert</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEditCustomer}
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
                            // Ansicht-Modus
                            <>
                              {/* Kundendetails */}
                              <div className="space-y-2 mb-3">
                                {customer.geburtsdatum && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={14} className="text-gray-500" />
                                    <span>{new Date(customer.geburtsdatum).toLocaleDateString('de-DE')}</span>
                                  </div>
                                )}
                                {customer.rufnummer && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone size={14} className="text-gray-500" />
                                    <span>{customer.rufnummer}</span>
                                  </div>
                                )}
                                {customer.strasse && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin size={14} className="text-gray-500" />
                                    <span>{customer.strasse} {customer.hausnummer}</span>
                                  </div>
                                )}
                                {customer.iban && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <CreditCard size={14} className="text-gray-500" />
                                    <span className="font-mono">{formatIBAN(customer.iban, visibleIBANs[customer.id])}</span>
                                    <button
                                      onClick={() => toggleIBANVisibility(customer.id)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                      title={visibleIBANs[customer.id] ? "IBAN verbergen" : "IBAN anzeigen"}
                                    >
                                      {visibleIBANs[customer.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Status-Änderung */}
                              <div className="mb-3">
                                <div className="text-xs font-semibold mb-1">Status ändern:</div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => updateCustomerStatus(customer.id, 'Installation offen')}
                                    className="flex-1 px-2 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs font-medium"
                                  >
                                    ⏳ Inst. offen
                                  </button>
                                  <button
                                    onClick={() => updateCustomerStatus(customer.id, 'Installiert')}
                                    className="flex-1 px-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-medium"
                                  >
                                    ✅ Installiert
                                  </button>
                                  <button
                                    onClick={() => updateCustomerStatus(customer.id, 'Storniert')}
                                    className="flex-1 px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium"
                                  >
                                    ❌ Storniert
                                  </button>
                                </div>
                              </div>

                              {/* Todos hinzufügen */}
                              <div className="mb-3">
                                <div className="text-xs font-semibold mb-1">Todo hinzufügen:</div>
                                <div className="grid grid-cols-3 gap-1">
                                  {['Installation', 'Kündigen', 'HD Sender raus', 'Runterstufen', 'Rufnummermitnahme', 'Eigener Text'].map(todoType => (
                                    <button
                                      key={todoType}
                                      onClick={() => addTodo(customer.id, todoType)}
                                      className="px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-medium"
                                    >
                                      + {todoType}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Todo-Liste */}
                              {customer.todos.length > 0 && (
                                <div className="border-t pt-3">
                                  <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                                    <CheckSquare size={14} />
                                    Aufgaben ({customer.todos.filter(t => !t.completed).length} offen)
                                  </div>
                                  <div className="space-y-2">
                                    {customer.todos.map(todo => (
                                      <div key={todo.id} className={`flex items-start gap-2 p-2 rounded-lg ${
                                        todo.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                      }`}>
                                        <input
                                          type="checkbox"
                                          checked={todo.completed}
                                          onChange={() => toggleTodo(customer.id, todo.id)}
                                          className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                                        />
                                        {todo.type === 'Eigener Text' ? (
                                          <input
                                            type="text"
                                            value={todo.text}
                                            onChange={(e) => updateTodoText(customer.id, todo.id, e.target.value)}
                                            placeholder="Eigener Text..."
                                            className="flex-1 p-1 border rounded text-xs"
                                          />
                                        ) : (
                                          <span className={`flex-1 text-xs ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                            {todo.text}
                                          </span>
                                        )}
                                        <button
                                          onClick={() => deleteTodo(customer.id, todo.id)}
                                          className="p-1 hover:bg-red-100 rounded text-red-600"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Aktionen */}
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                <button
                                  onClick={() => startEditCustomer(customer)}
                                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                                >
                                  <Edit2 size={14} />
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => deleteCustomer(customer.id)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Kundendatenbank;