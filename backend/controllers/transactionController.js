import { Transaction } from '../models/Transaction.js';

// @desc    Get all transactions for authenticated user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transactions = await Transaction.findByUser(userId);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('getTransactions Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

// @desc    Get single transaction by ID for authenticated user
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transaction = await Transaction.findOneByUser(req.params.id, userId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error('getTransactionById Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving transaction' });
  }
};

// @desc    Create a new transaction for authenticated user
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { merchant, amount, type, category, date, raw_description, payment_method, is_recurring } = req.body;

    if (!merchant || amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Merchant and amount are required' });
    }

    const cleanMerchant = normalizeMerchantName(merchant);
    const txType = type === 'income' ? 'income' : 'expense';
    let finalCategory = category;
    if (!finalCategory || finalCategory === 'Uncategorized' || finalCategory === 'Miscellaneous') {
      finalCategory = autoCategorizeBackend(cleanMerchant, raw_description || cleanMerchant, Number(amount), txType);
    }

    // STRICT SECURITY: Always override/assign userId from authenticated req.user.id
    const payload = {
      userId,
      merchant: cleanMerchant,
      amount: Math.abs(Number(amount)),
      type: txType,
      category: finalCategory,
      date: date || new Date().toISOString().split('T')[0],
      raw_description: raw_description || cleanMerchant,
      payment_method: payment_method || 'Card',
      is_recurring: Boolean(is_recurring)
    };

    const newTx = await Transaction.create(payload);
    return res.status(201).json(newTx);
  } catch (error) {
    console.error('createTransaction Error:', error.message);
    return res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// @desc    Update a transaction for authenticated user
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const updateData = { ...req.body };

    // STRICT SECURITY: Remove userId from request body to prevent ownership transfer
    delete updateData.userId;
    delete updateData._id;

    const updatedTx = await Transaction.updateOneByUser(req.params.id, userId, updateData);

    if (!updatedTx) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    return res.status(200).json(updatedTx);
  } catch (error) {
    console.error('updateTransaction Error:', error.message);
    return res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// @desc    Delete a transaction for authenticated user
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const deleted = await Transaction.deleteOneByUser(req.params.id, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('deleteTransaction Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

// Merchant Normalization Patterns matching frontend dataIntelligence.js
const MERCHANT_PATTERNS = [
  { pattern: /amzn|amazon|mktp/i, name: 'Amazon' },
  { pattern: /uber|lyft|grab|cab/i, name: 'Uber / Ride Share' },
  { pattern: /starbucks|dunkin|costa|coffee/i, name: 'Starbucks' },
  { pattern: /netflix|hulu|disney|spotify|apple\.com\/bill|hbo|prime video/i, name: 'Subscription Service' },
  { pattern: /doordash|ubereats|grubhub|postmates|zomato|swiggy/i, name: 'Food Delivery' },
  { pattern: /walmart|target|costco|kroger|safeway|trader joe|whole foods/i, name: 'Groceries' },
  { pattern: /shell|chevron|exxon|bp|gas|fuel/i, name: 'Gas Station' },
  { pattern: /payroll|salary|direct dep|stripe|payout/i, name: 'Payroll / Salary' }
];

function normalizeMerchantName(rawStr) {
  if (!rawStr) return 'Unknown Merchant';
  
  const clean = String(rawStr)
    .trim()
    .replace(/^SQ\s*\*|^TST\s*\*|^PAYPAL\s*\*/i, '')
    .replace(/\*.*$/, '')
    .replace(/#\d+/g, '')
    .replace(/\s+[A-Z]{2}\s+\d{5}$/, '')
    .replace(/\s+/g, ' ');

  for (const item of MERCHANT_PATTERNS) {
    if (item.pattern.test(clean)) {
      return item.name;
    }
  }

  return clean.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function normalizeMerchantKey(merchant) {
  if (!merchant) return '';
  const normalized = normalizeMerchantName(merchant);
  return normalized.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function autoCategorizeBackend(merchant, description = '', amount = 0, type = 'expense') {
  const normType = String(type || '').toLowerCase();
  const text = `${merchant || ''} ${description || ''}`.toLowerCase();

  if (normType === 'income' || Number(amount) < 0) {
    if (/salary|payroll|direct dep|wages|stipend|employer|company payout/i.test(text)) {
      return 'Salary / Income';
    }
    return 'Other Income';
  }

  if (/swiggy|zomato|starbucks|dunkin|mcdonald|kfc|dominos|pizza|burger|restaurant|cafe|coffee|diner|bistro|food|dining|eat|pub|bar|bakery|subway|taco bell|chipotle/i.test(text)) {
    return 'Food & Dining';
  }

  if (/zepto|blinkit|instamart|bigbasket|dmart|jiomart|grocery|groceries|supermarket|walmart|target|trader joe|kroger|costco|whole foods|market|fruits|vegetable|dairy|milk|bakers/i.test(text)) {
    return 'Groceries';
  }

  if (/amazon|amzn|flipkart|myntra|ajio|meesho|zara|nike|adidas|puma|decathlon|shop|shopping|store|mall|clothing|apparel|electronics|fashion|retail|uniqlo|h&m/i.test(text)) {
    return 'Shopping';
  }

  if (/rent|landlord|lease|property|housing|flat|maintenance fee|real estate|mortgage|apartment/i.test(text)) {
    return 'Rent & Housing';
  }

  if (/electric|electricity|power|water bill|gas bill|utility|utilities|broadband|wifi|jio fiber|airtel|vodafone|vi\b|bsnl|tata play|dth|bill pay|piped gas|bescom|mseb/i.test(text)) {
    return 'Bills & Utilities';
  }

  if (/uber|ola|rapido|taxi|cab|auto|metro|transit|fuel|petrol|diesel|gas station|shell|bpcl|hpcl|iocl|parking|toll|fastag|bus ticket/i.test(text)) {
    return 'Transportation';
  }

  if (/irctc|railway|train|flight|airline|air india|indigo|akasa|spicejet|vistara|makemytrip|cleartrip|yatra|goibibo|hotel|resort|airbnb|stay|boarding/i.test(text)) {
    return 'Travel';
  }

  if (/bookmyshow|pvr|inox|cinema|movie|theater|gaming|playstation|xbox|steam|event|concert|amusement|park/i.test(text)) {
    return 'Entertainment';
  }

  if (/netflix|spotify|hotstar|disney|hulu|youtube|apple\.com|google play|prime video|patreon|software|github|aws|digitalocean|adobe|open ai|chatgpt|midjourney|linkedin|cloud|saas/i.test(text)) {
    return 'Subscriptions & Tech';
  }

  if (/apollo|pharmacy|pharmeasy|netmeds|1mg|hospital|clinic|doctor|dental|dentist|health|lab|diagnostic|medicine|medical|cvs|walgreens/i.test(text)) {
    return 'Healthcare';
  }

  if (/college|university|school|tuition|fees|coursera|udemy|edx|unacademy|byjus|coaching|books|exam|test series|academy|institution/i.test(text)) {
    return 'Education';
  }

  if (/salon|spa|barber|cosmetics|nykaa|parlor|grooming|beauty|skincare|haircut/i.test(text)) {
    return 'Personal Care';
  }

  if (/zerodha|groww|upstox|coin|mutual fund|sip|stocks|equity|vanguard|fidelity|robinhood|crypto|coindcx|binance|gold|bonds|investment/i.test(text)) {
    return 'Investments';
  }

  if (/lic\b|hdfc life|icici lombard|max life|sbi life|insurance|policy|premium|policybazaar|health insurance|term insurance/i.test(text)) {
    return 'Insurance';
  }

  return 'Other';
}

function formatDateKey(dStr) {
  if (!dStr) return new Date().toISOString().split('T')[0];
  const str = String(dStr).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return str;
}

function createFingerprint(item) {
  const normMerchant = normalizeMerchantKey(item.merchant || item.raw_description);
  const normDate = formatDateKey(item.date);
  const normAmount = Math.abs(Number(item.amount || 0)).toFixed(2);
  const normType = (item.type || 'expense').toLowerCase();
  return `${normDate}_${normMerchant}_${normAmount}_${normType}`;
}

// @desc    Bulk import transactions for authenticated user (CSV Ingestion with Deduplication)
// @route   POST /api/transactions/import
// @access  Private
export const bulkImportTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { items, filesProcessed, fileNames } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ 
        message: 'No items provided for import',
        summary: { totalRows: 0, imported: 0, duplicates: 0, invalid: 0, filesProcessed: 0, fileNames: [] }
      });
    }

    const totalRows = items.length;
    let invalidCount = 0;
    let duplicateCount = 0;

    // Fetch existing transactions for this authenticated user to build DB fingerprint set
    const existingUserTransactions = await Transaction.findByUser(userId);
    const existingFingerprints = new Set();
    if (Array.isArray(existingUserTransactions)) {
      existingUserTransactions.forEach(t => {
        existingFingerprints.add(createFingerprint(t));
      });
    }

    const batchSeenFingerprints = new Set();
    const validPayload = [];

    for (const t of items) {
      const rawMerchant = String(t.merchant || t.raw_description || '').trim();
      const amountNum = Number(t.amount);

      // Row Validation
      if (!rawMerchant || isNaN(amountNum) || amountNum === 0) {
        invalidCount++;
        continue;
      }

      const cleanMerchant = normalizeMerchantName(rawMerchant);
      const txType = t.type || (amountNum < 0 ? 'expense' : 'income');
      let finalCategory = t.category;
      if (!finalCategory || finalCategory === 'Uncategorized' || finalCategory === 'Miscellaneous' || finalCategory === 'Auto Assign Category') {
        finalCategory = autoCategorizeBackend(cleanMerchant, t.raw_description || rawMerchant, Math.abs(amountNum), txType);
      }

      const cleanItem = {
        userId,
        merchant: cleanMerchant,
        raw_description: t.raw_description || rawMerchant,
        amount: Math.abs(amountNum),
        type: txType,
        category: finalCategory,
        date: formatDateKey(t.date),
        payment_method: t.payment_method || 'Card',
        is_recurring: Boolean(t.is_recurring)
      };

      const fp = createFingerprint(cleanItem);

      // Duplicate Check (DB existing or Intra-batch)
      if (existingFingerprints.has(fp) || batchSeenFingerprints.has(fp)) {
        duplicateCount++;
        continue;
      }

      batchSeenFingerprints.add(fp);
      validPayload.push(cleanItem);
    }

    let importedTransactions = [];
    if (validPayload.length > 0) {
      importedTransactions = await Transaction.createMany(validPayload);
    }

    const summary = {
      totalRows,
      imported: importedTransactions.length,
      duplicates: duplicateCount,
      invalid: invalidCount,
      filesProcessed: Number(filesProcessed) || 1,
      fileNames: Array.isArray(fileNames) && fileNames.length ? fileNames : ['Statement.csv']
    };

    return res.status(201).json({
      success: true,
      message: `Import complete: ${importedTransactions.length} new transactions added, ${duplicateCount} duplicates skipped.`,
      summary,
      data: importedTransactions
    });
  } catch (error) {
    console.error('bulkImportTransactions Error:', error.message);
    return res.status(500).json({ message: 'Server error importing transactions' });
  }
};

