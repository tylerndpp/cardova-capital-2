const BUYERS = {
  simplyCapital: 'https://hook.us2.make.com/9un1iqhex5sstjgz4xam9ulw467bpgy3',
  laRoma: 'https://hook.us2.make.com/otbcpkurg5q1syxapsvbt5y8r1nk9d28',
  primeDock: 'https://hook.us2.make.com/pr34yrpy6fyuiwavvrc5lmgc29e2j7vn',
};

const BUYER_LABELS = {
  simplyCapital: 'Simply Capital',
  laRoma: 'La Roma',
  primeDock: 'PrimeDock',
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyoJ2xxc7MG5vIdb51pZIgvrNdDBhbt2rdnwsOvy8nvH51hJvQB1FdwJ8rXq1N17CLp/exec';

function isGoodOrExcellentCredit(creditScore) {
  return ['Excellent (720+)', 'Good (690 – 719)'].includes(creditScore);
}

function isEligibleForSimplyCapital(lead) {
  if (['Less than 6 months', '6 – 12 months'].includes(lead.time_in_business)) return false;
  if (lead.defaulted_on_loan === 'Yes') return false;
  if (lead.monthly_sales === '$0 – $20,000') return false;
  if (lead.monthly_sales === '$20,000 – $50,000' && !isGoodOrExcellentCredit(lead.credit_score)) return false;
  return true;
}

function buildPayload(lead) {
  return {
    fullName: [lead.first_name, lead.last_name].filter(Boolean).join(' '),
    email: lead.email || '',
    phone: lead.phone || '',
    creditScore: lead.credit_score || '',
    loanRequest: lead.funding_amount || '',
    monthlyRevenue: lead.monthly_sales || '',
    timeInBusiness: lead.time_in_business || '',
    bankAccount: lead.bank_account || '',
    defaultedLoan: lead.defaulted_on_loan || '',
    bankStatements: lead.bank_statements || '',
    loanPurpose: lead.loan_purpose || '',
    timeline: lead.funding_timeline || '',
    businessName: lead.business_name || '',
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const lead = req.body || {};
  const payload = buildPayload(lead);

  const eligibleForSimplyCapital = isEligibleForSimplyCapital(lead);
  const partner = new Date().getMinutes() % 2 === 0 ? 'laRoma' : 'primeDock';
  const isExclusive = Math.random() < 0.33;

  let recipients;
  if (eligibleForSimplyCapital) {
    recipients = isExclusive ? ['simplyCapital'] : ['simplyCapital', partner];
  } else {
    recipients = isExclusive ? [partner] : ['laRoma', 'primeDock'];
  }

  const results = await Promise.allSettled(
    recipients.map((name) =>
      fetch(BUYERS[name], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    )
  );

  const sheetLog = {
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    fullName: payload.fullName,
    businessName: payload.businessName,
    email: payload.email,
    phone: payload.phone,
    eligibleForSimplyCapital: eligibleForSimplyCapital ? 'Yes' : 'No',
    distributionType: isExclusive ? 'Exclusive' : 'Shared',
    sentTo: recipients.map((name) => BUYER_LABELS[name]).join(' + '),
    sheet: 'Buyer Routing',
  };
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(sheetLog),
    });
  } catch (e) {}

  return res.status(200).json({ sent_to: recipients, results: results.map((r) => r.status) });
};
