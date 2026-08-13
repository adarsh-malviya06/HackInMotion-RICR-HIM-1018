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
  const [csvFiles, setCsvFiles] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [importSummary, setImportSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleFileUpload = (filesInput) => {
    if (!filesInput) return;
    const fileList = filesInput.length !== undefined ? Array.from(filesInput) : [filesInput];
    if (!fileList.length) return;

    setCsvFiles(fileList);
    setImportSummary(null);
    setIsProcessing(true);

    let combinedRows = [];
    let allHeaders = new Set();
    let filesProcessedCount = 0;

    fileList.forEach(file => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          filesProcessedCount++;
          if (results.data && results.data.length) {
            results.data.forEach(row => combinedRows.push(row));
            Object.keys(results.data[0]).forEach(h => allHeaders.add(h));
          }

          if (filesProcessedCount === fileList.length) {
            const headerArr = Array.from(allHeaders);
            setCsvHeaders(headerArr);
            setRawRows(combinedRows);
            setIsProcessing(false);

            const autoMap = { date: '', merchant: '', amount: '', category: '', type: '' };
            headerArr.forEach(h => {
              const lower = h.toLowerCase();
              if (lower.includes('date') || lower.includes('time')) autoMap.date = h;
              else if (lower.includes('merchant') || lower.includes('payee') || lower.includes('desc') || lower.includes('name')) autoMap.merchant = h;
              else if (lower.includes('amount') || lower.includes('price') || lower.includes('val')) autoMap.amount = h;
              else if (lower.includes('cat')) autoMap.category = h;
              else if (lower.includes('type')) autoMap.type = h;
            });
            setColumnMap(autoMap);

            if (fileList.length === 1) {
              showToast(`Parsed ${fileList[0].name} with ${combinedRows.length} rows!`, 'success');
            } else {
              showToast(`Parsed ${fileList.length} CSV files with ${combinedRows.length} total rows!`, 'success');
            }
          }
        },
        error: (err) => {
          filesProcessedCount++;
          showToast(`CSV Error in ${file.name}: ${err.message}`, 'error');
          if (filesProcessedCount === fileList.length) {
            setIsProcessing(false);
          }
        }
      });
    });
  };

  const handleBulkImportSubmit = async () => {
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

    const fileMeta = {
      filesProcessed: csvFiles.length || 1,
      fileNames: csvFiles.length ? csvFiles.map(f => f.name) : ['Statement.csv']
    };

    const summary = await importBulkTransactions(mapped, fileMeta);
    if (summary) {
      setImportSummary(summary);
    }
    setCsvFiles([]);
    setRawRows([]);
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
          Import real bank CSV statement files or manually record single transaction items into your database
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
          {/* IMPORT SUMMARY CARD (Displayed after import completes) */}
          {importSummary && (
            <div className="card-white-clean" style={{ border: '2px solid #10b981', background: '#f0fdf4', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={20} color="#15803d" />
                  </div>
                  <div>
                    <h3 className="display-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                      Import Complete
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                      {importSummary.filesProcessed > 1 
                        ? `Files Processed (${importSummary.filesProcessed}): ${importSummary.fileNames.join(', ')}`
                        : `File: ${importSummary.fileNames[0] || 'Statement.csv'}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setImportSummary(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}
                >
                  ✕ Dismiss
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '16px' }}>
                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.725rem', color: '#166534', fontWeight: 700 }}>Total Rows Detected</div>
                  <div className="num-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d', marginTop: '2px' }}>
                    {importSummary.totalRows}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.725rem', color: '#15803d', fontWeight: 700 }}>Successfully Imported</div>
                  <div className="num-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    {importSummary.imported}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '0.725rem', color: '#854d0e', fontWeight: 700 }}>Duplicates Skipped</div>
                  <div className="num-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a16207', marginTop: '2px' }}>
                    {importSummary.duplicates}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                  <div style={{ fontSize: '0.725rem', color: '#9f1239', fontWeight: 700 }}>Invalid Rows Skipped</div>
                  <div className="num-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#be123c', marginTop: '2px' }}>
                    {importSummary.invalid}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #bbf7d0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532d' }}>
                  🎉 New transactions added: <strong>{importSummary.imported}</strong>
                </span>
                <button onClick={() => setActiveTab('dashboard')} className="btn-pill-dark" style={{ padding: '8px 18px', fontSize: '0.8rem' }}>
                  View Updated Dashboard →
                </button>
              </div>
            </div>
          )}

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
              if (e.dataTransfer.files && e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files);
              }
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
                <UploadCloud size={16} /> Select CSV File(s)
                <input
                  type="file"
                  accept=".csv"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => e.target.files && e.target.files.length && handleFileUpload(e.target.files)}
                />
              </label>
              <button onClick={downloadSampleCsv} className="btn-pill-white">
                <Download size={16} /> Sample CSV Template
              </button>
            </div>
            {csvFiles.length > 0 && (
              <div style={{ marginTop: '16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                📁 Loaded {csvFiles.length} file(s): {csvFiles.map(f => f.name).join(', ')} ({rawRows.length} total rows)
              </div>
            )}
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
                Preview Parsed Records (First 5 items out of {rawRows.length})
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
                <Check size={18} /> Confirm & Ingest {rawRows.length} Records with Duplicate Protection
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
