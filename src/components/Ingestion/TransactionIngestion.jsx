import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import Papa from 'papaparse';
import { 
  UploadCloud, 
  PlusCircle, 
  FileSpreadsheet, 
  Check, 
  Download
} from 'lucide-react';

export const TransactionIngestion = () => {
  const { addTransaction, importBulkTransactions, currency, showToast, setActiveTab } = useFinance();
  const [activeSubTab, setActiveSubTab] = useState('csv'); // 'csv' | 'manual'

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    raw_description: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    payment_method: 'Credit Card',
    is_recurring: false
  });

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [columnMap, setColumnMap] = useState({
    date: '',
    merchant: '',
    amount: '',
    category: '',
    type: ''
  });

  const categories = [
    'Housing', 'Groceries', 'Food & Dining', 'Subscriptions & Tech', 
    'Utilities', 'Travel & Transport', 'Health & Fitness', 'Shopping', 
    'Income', 'Investments', 'Miscellaneous'
  ];

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.merchant || !manualForm.amount) {
      showToast('Please fill in merchant name and amount.', 'rose');
      return;
    }

    addTransaction(manualForm);
    setManualForm({
      date: new Date().toISOString().split('T')[0],
      merchant: '',
      raw_description: '',
      amount: '',
      type: 'expense',
      category: 'Food & Dining',
      payment_method: 'Credit Card',
      is_recurring: false
    });
    setActiveTab('dashboard');
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length) {
          const headers = Object.keys(results.data[0]);
          setCsvHeaders(headers);
          setRawRows(results.data);

          const autoMap = { date: '', merchant: '', amount: '', category: '', type: '' };
          headers.forEach(h => {
            const lower = h.toLowerCase();
            if (lower.includes('date') || lower.includes('time')) autoMap.date = h;
            else if (lower.includes('merchant') || lower.includes('payee') || lower.includes('desc') || lower.includes('name')) autoMap.merchant = h;
            else if (lower.includes('amount') || lower.includes('price') || lower.includes('val')) autoMap.amount = h;
            else if (lower.includes('cat')) autoMap.category = h;
            else if (lower.includes('type')) autoMap.type = h;
          });
          setColumnMap(autoMap);
          showToast(`Parsed CSV with ${results.data.length} rows!`, 'success');
        }
      },
      error: (err) => showToast(`CSV Error: ${err.message}`, 'error')
    });
  };

  const handleBulkImportSubmit = () => {
    if (!columnMap.merchant || !columnMap.amount) {
      showToast('Please map at least Merchant and Amount columns.', 'amber');
      return;
    }

    const mapped = rawRows.map(row => {
      const amtVal = parseFloat(row[columnMap.amount] || '0');
      return {
        date: row[columnMap.date] || new Date().toISOString().split('T')[0],
        merchant: row[columnMap.merchant] || 'Imported Expense',
        raw_description: row[columnMap.merchant] || '',
        amount: Math.abs(amtVal),
        type: amtVal < 0 ? 'expense' : (row[columnMap.type] || 'expense').toLowerCase().includes('inc') ? 'income' : 'expense',
        category: row[columnMap.category] || 'Uncategorized'
      };
    });

    importBulkTransactions(mapped);
    setCsvFile(null);
    setRawRows([]);
    setActiveTab('dashboard');
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Merchant,Amount,Category,Type\n" +
      "2026-08-01,Whole Foods Market,124.50,Groceries,Expense\n" +
      "2026-08-02,Starbucks Coffee,5.75,Food & Dining,Expense\n" +
      "2026-08-03,Netflix Streaming,19.99,Subscriptions & Tech,Expense\n" +
      "2026-08-04,Uber Trip,22.40,Travel & Transport,Expense\n" +
      "2026-08-05,Monthly Salary,4800.00,Income,Income\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finly_sample_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="display-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Transaction Ingestion Center</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Import real bank CSV statement files or manually record single transaction items into your Supabase database
        </p>
      </div>

      {/* Navigation Subtab Pill Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveSubTab('csv')}
          className={activeSubTab === 'csv' ? 'btn-pill-dark' : 'btn-pill-white'}
        >
          <UploadCloud size={16} /> CSV File Upload & Auto-Mapper
        </button>
        <button
          onClick={() => setActiveSubTab('manual')}
          className={activeSubTab === 'manual' ? 'btn-pill-dark' : 'btn-pill-white'}
        >
          <PlusCircle size={16} /> Manual Single Entry Form
        </button>
      </div>

      {/* CSV Uploader Subtab */}
      {activeSubTab === 'csv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Drag & Drop Area */}
          <div
            className="card-light-lavender"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              border: '2px dashed #b8c1dc',
              cursor: 'pointer'
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files[0]);
            }}
          >
            <FileSpreadsheet size={52} color="var(--accent-purple)" style={{ marginBottom: '14px' }} />
            <h3 className="display-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              {csvFile ? `Loaded File: ${csvFile.name}` : 'Drag & Drop Bank CSV Statement Here'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {csvFile ? `${rawRows.length} rows parsed. Map your columns below.` : 'Supports CSV exports from Chase, Bank of America, Wells Fargo, Revolut, Amex, Apple Card & more.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <label className="btn-pill-dark" style={{ cursor: 'pointer' }}>
                <UploadCloud size={16} /> Select CSV File
                <input
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files.length && handleFileUpload(e.target.files[0])}
                />
              </label>
              <button onClick={downloadSampleCsv} className="btn-pill-white">
                <Download size={16} /> Sample CSV Template
              </button>
            </div>
          </div>

          {/* Mapping & Preview Section */}
          {rawRows.length > 0 && (
            <div className="card-white-clean">
              <h3 className="display-title" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
                Step 2: Map CSV Header Columns
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Date Column</label>
                  <select
                    className="form-select"
                    value={columnMap.date}
                    onChange={e => setColumnMap({ ...columnMap, date: e.target.value })}
                  >
                    <option value="">-- Select Column --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Merchant Column *</label>
                  <select
                    className="form-select"
                    value={columnMap.merchant}
                    onChange={e => setColumnMap({ ...columnMap, merchant: e.target.value })}
                  >
                    <option value="">-- Select Column --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Amount Column *</label>
                  <select
                    className="form-select"
                    value={columnMap.amount}
                    onChange={e => setColumnMap({ ...columnMap, amount: e.target.value })}
                  >
                    <option value="">-- Select Column --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Category Column</label>
                  <select
                    className="form-select"
                    value={columnMap.category}
                    onChange={e => setColumnMap({ ...columnMap, category: e.target.value })}
                  >
                    <option value="">-- Auto Assign Category --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Data Preview */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
                Preview Parsed Records (First 5 items)
              </h4>
              <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Date</th>
                      <th style={{ padding: '8px' }}>Merchant</th>
                      <th style={{ padding: '8px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #edf0f8' }}>
                        <td style={{ padding: '8px' }} className="num-mono">{row[columnMap.date] || 'N/A'}</td>
                        <td style={{ padding: '8px' }}>{row[columnMap.merchant] || 'N/A'}</td>
                        <td style={{ padding: '8px' }} className="num-mono">{currency}{row[columnMap.amount] || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button onClick={handleBulkImportSubmit} className="btn-pill-dark" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
                <Check size={18} /> Confirm & Ingest {rawRows.length} Records to Supabase
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Single Entry Subtab */}
      {activeSubTab === 'manual' && (
        <div className="card-white-clean" style={{ maxWidth: '640px' }}>
          <h3 className="display-title" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>Record Single Transaction</h3>

          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Transaction Type</label>
                <select
                  className="form-select"
                  value={manualForm.type}
                  onChange={e => setManualForm({ ...manualForm, type: e.target.value })}
                >
                  <option value="expense">Expense (-)</option>
                  <option value="income">Income (+)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={manualForm.date}
                  onChange={e => setManualForm({ ...manualForm, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Merchant / Payee Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Starbucks, Amazon, Landlord"
                value={manualForm.merchant}
                onChange={e => setManualForm({ ...manualForm, merchant: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Amount ({currency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={manualForm.amount}
                  onChange={e => setManualForm({ ...manualForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Category</label>
                <select
                  className="form-select"
                  value={manualForm.category}
                  onChange={e => setManualForm({ ...manualForm, category: e.target.value })}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Payment Method</label>
                <select
                  className="form-select"
                  value={manualForm.payment_method}
                  onChange={e => setManualForm({ ...manualForm, payment_method: e.target.value })}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="form-group" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={manualForm.is_recurring}
                    onChange={e => setManualForm({ ...manualForm, is_recurring: e.target.checked })}
                  />
                  Recurring Subscription
                </label>
              </div>
            </div>

            <button type="submit" className="btn-pill-dark" style={{ marginTop: '12px', padding: '14px', justifyContent: 'center' }}>
              <PlusCircle size={18} /> Save Record to Database
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
