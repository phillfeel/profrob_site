export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, company, phone, email, intent, object, task, consent, website, source } = req.body;

  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || (!phone && !email)) {
    return res.status(400).json({ error: 'Имя и телефон или email обязательны' });
  }

  if (!consent) {
    return res.status(400).json({ error: 'Необходимо согласие на обработку данных' });
  }

  const apiKey = process.env.WEB3FORMS_API_KEY;
  const toEmail = process.env.TO_EMAIL || 'aidvizh8@gmail.com';

  if (!apiKey) {
    console.error('WEB3FORMS_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const intentLabels = {
    quote: 'Запросить КП',
    pilot: 'Демо или пилот',
    audit: 'Аудит объекта',
    consult: 'Консультация',
    '': 'Не указано'
  };

  const objectLabels = {
    'business-centers': 'Бизнес-центры и офисы',
    retail: 'Торговые центры и ритейл',
    logistics: 'Склады и логистика',
    hotels: 'Отели и HoReCa',
    'medical-wellness': 'Медицинские объекты',
    construction: 'Строительство и девелопмент',
    manufacturing: 'Промышленность и производство',
    'public-spaces': 'Общественные пространства',
    municipal: 'Муниципальные службы',
    agriculture: 'Агро и фермерские хозяйства',
    education: 'Образовательные учреждения',
    'fitness-sports': 'Фитнес-клубы и спорткомплексы',
    other: 'Другое',
    '': 'Не указано'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0b1220; color: #fff; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: #fafafa; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 4px; }
        .value { font-size: 16px; }
        .task { white-space: pre-wrap; background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #e5e5e5; }
        .meta { font-size: 12px; color: #999; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5e5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 20px;">Новая заявка с сайта Профробот</h1>
        <p style="margin: 8px 0 0; opacity: 0.8;">Источник: ${source || 'contacts'}</p>
      </div>
      <div class="content">
        <div class="field">
          <div class="label">Имя</div>
          <div class="value">${escapeHtml(name)}</div>
        </div>
        ${company ? `
        <div class="field">
          <div class="label">Компания</div>
          <div class="value">${escapeHtml(company)}</div>
        </div>` : ''}
        ${phone ? `
        <div class="field">
          <div class="label">Телефон</div>
          <div class="value"><a href="tel:${escapeHtml(phone)}" style="color: #0066cc; text-decoration: none;">${escapeHtml(phone)}</a></div>
        </div>` : ''}
        ${email ? `
        <div class="field">
          <div class="label">E-mail</div>
          <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #0066cc; text-decoration: none;">${escapeHtml(email)}</a></div>
        </div>` : ''}
        <div class="field">
          <div class="label">Цель обращения</div>
          <div class="value">${escapeHtml(intentLabels[intent] || intent)}</div>
        </div>
        <div class="field">
          <div class="label">Тип объекта</div>
          <div class="value">${escapeHtml(objectLabels[object] || object)}</div>
        </div>
        ${task ? `
        <div class="field">
          <div class="label">Задача</div>
          <div class="value task">${escapeHtml(task)}</div>
        </div>` : ''}
        <div class="meta">
          Заявка отправлена: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК)
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Новая заявка с сайта Профробот
Источник: ${source || 'contacts'}

Имя: ${name}
${company ? `Компания: ${company}` : ''}
${phone ? `Телефон: ${phone}` : ''}
${email ? `E-mail: ${email}` : ''}
Цель: ${intentLabels[intent] || intent}
Объект: ${objectLabels[object] || object}
${task ? `Задача:\n${task}` : ''}

---
Отправлено: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК)
  `.trim();

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: apiKey,
        email: toEmail,
        subject: `Новая заявка: ${name} — ${intentLabels[intent] || 'сайт'}`,
        from_name: 'Профробот — заявка',
        reply_to: email || undefined,
        message: text,
        html: html,
        botcheck: website || '' // honeypot
      })
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      console.error('Web3Forms error:', data);
      return res.status(500).json({ error: data.message || 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Web3Forms send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''');
}