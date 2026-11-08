const DEFAULT_BOT_TOKEN = ''; // Можете вставить токен сюда ИЛИ (рекомендуется) в настройках Vercel -> Environment Variables -> TELEGRAM_BOT_TOKEN

module.exports = async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({
      ok: false,
      error: 'Токен не задан! Добавьте TELEGRAM_BOT_TOKEN в Environment Variables на Vercel или вставьте его в api/bot.js'
    });
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const appUrl = process.env.WEBAPP_URL || `${proto}://${host}`;

  // Если открыть https://ваш-домен.vercel.app/api/bot?setup=1 в браузере —
  // вебхук и кнопка меню настроятся автоматически!
  if (req.method === 'GET') {
    if (req.query && req.query.setup === '1') {
      const webhookUrl = `${appUrl}/api/bot`;
      const [whRes, menuRes] = await Promise.all([
        fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl })
        }).then(r => r.json()),
        fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menu_button: {
              type: 'web_app',
              text: 'Расписание',
              web_app: { url: appUrl }
            }
          })
        }).then(r => r.json())
      ]);

      return res.status(200).json({
        ok: true,
        message: 'Бот успешно привязан к этому домену Vercel!',
        appUrl,
        webhook: whRes,
        menuButton: menuRes
      });
    }

    return res.status(200).json({
      ok: true,
      hint: `Откройте ${appUrl}/api/bot?setup=1 в браузере, чтобы автоматически привязать бота и кнопку меню.`
    });
  }

  // Обработка входящих сообщений от Telegram (Webhook)
  if (req.method === 'POST') {
    try {
      const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const message = update && update.message;

      if (message && message.chat && message.text) {
        const chatId = message.chat.id;
        const text = message.text.trim();

        if (text.startsWith('/start') || text.startsWith('/schedule')) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '📚 <b>UniLink · ШИ-9-23 (4 курс)</b>\n\nНажмите кнопку ниже, чтобы открыть расписание пар и звонков:',
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '📅 Открыть расписание',
                      web_app: { url: appUrl }
                    }
                  ]
                ]
              }
            })
          });
        }
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(200).json({ ok: true });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
