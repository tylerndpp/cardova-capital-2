module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const lead = req.body || {};

  const payload = {
    flo_campaign_id: '16423ee9-e538-4bb3-8c89-2f141acdcd39',
    flo_supplier_id: 'bd9b21a0-639e-43d0-a122-21023c50eb01',
    first_name: lead.first_name || '',
    last_name: lead.last_name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    funding_amount: lead.funding_amount || '',
    time_in_business: lead.time_in_business || '',
    bank_account: lead.bank_account || '',
    negative_balance: lead.negative_balance || '',
    defaulted_on_loan: lead.defaulted_on_loan || '',
    loan_purpose: lead.loan_purpose || '',
    monthly_sales: lead.monthly_sales || '',
    bank_statements: lead.bank_statements || '',
    credit_score: lead.credit_score || '',
    funding_timeline: lead.funding_timeline || '',
  };

  try {
    const leadRes = await fetch('https://www.leaddistro.ai/api/v1/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LEADDISTRO_API_KEY,
      },
      body: JSON.stringify(payload),
    });
    const data = await leadRes.json();
    return res.status(leadRes.ok ? 200 : 502).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed', message: e.message });
  }
};
