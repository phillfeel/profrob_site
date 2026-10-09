# Email Setup for Contact Form (Web3Forms)

## Overview
The contact form on `contacts.html` submits to `/api/lead` (a Vercel serverless function) which sends emails via **Web3Forms** to `aidvizh8@gmail.com` (changeable to `probot2020@mail.ru` later).

## Why Web3Forms
- No SMTP setup needed
- No account credentials to manage
- Free tier: 250 submissions/month
- Works instantly — just add API key
- Easy to change recipient email anytime

## Setup Steps

### 1. Get API Key (already done)
You have: `5cdb883a-1e41-4f29-bfd1-d53a9350b035`

### 2. Configure Environment Variables in Vercel

Go to Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `WEB3FORMS_API_KEY` | `5cdb883a-1e41-4f29-bfd1-d53a9350b035` |
| `TO_EMAIL` | `aidvizh8@gmail.com` (or `probot2020@mail.ru` later) |

**For local development**, create `.env.local`:
```bash
WEB3FORMS_API_KEY=5cdb883a-1e41-4f29-bfd1-d53a9350b035
TO_EMAIL=aidvizh8@gmail.com
```

### 3. Deploy
```bash
npm install
vercel --prod
```

## Switching to probot2020@mail.ru Later

Just change `TO_EMAIL` in Vercel Environment Variables:
```
TO_EMAIL=probot2020@mail.ru
```
Redeploy (`vercel --prod`) — no code changes needed.

## Testing Locally

```bash
cp .env.example .env.local
npm run dev
# Opens http://localhost:3000
# Submit form on contacts.html → check Vercel function logs
```

## How It Works

1. User submits form → `POST /api/lead`
2. Serverless function validates data (honeypot, required fields, consent)
3. Calls `https://api.web3forms.com/submit` with your API key
4. Web3Forms sends email to `TO_EMAIL`
5. Returns `{ ok: true }` → frontend shows success

## Security Notes
- Honeypot field (`website`) blocks bots
- Form validates: name + (phone OR email) + consent required
- API key only in Vercel environment variables (encrypted)
- No SMTP credentials anywhere
- Web3Forms handles deliverability, spam protection

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Email service not configured` | Add `WEB3FORMS_API_KEY` to Vercel env vars |
| `Failed to send email` | Check Vercel function logs for Web3Forms response |
| Email not received | Check spam. Verify `TO_EMAIL` is correct in Vercel. |
| Rate limited | Free tier: 250/month. Upgrade at web3forms.com if needed. |