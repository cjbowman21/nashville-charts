# Railway Deployment Guide

This guide walks you through deploying Nashville Charts to Railway.app.

## Prerequisites

- ✅ Railway account created (you've done this!)
- ✅ GitHub account linked to Railway (you've done this!)
- 📧 Google account for OAuth setup
- 💳 Payment method added to Railway (required for $5/month plan)

## Step-by-Step Deployment

### 1️⃣ Create New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`cjbowman21/nashville-charts`**
5. Select the branch **`claude/project-hosting-plan-011CUSFATwAp9JE6cYCJ97oE`** (or `main` if merged)

### 2️⃣ Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a database and set the `DATABASE_URL` environment variable
4. ✅ Your app will automatically use this database!

### 3️⃣ Configure Environment Variables

Railway automatically provides `DATABASE_URL`, but you need to add OAuth credentials.

#### Get Your Railway Domain First

1. Click on your **NashvilleCharts.Web** service
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** → **"Public Networking"**
4. Click **"Generate Domain"**
5. You'll get something like: `nashville-charts-production-xxxx.up.railway.app`
6. **Copy this domain** - you'll need it for OAuth setup

### 4️⃣ Set Up Google OAuth

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **"APIs & Services"** → **"Credentials"**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure consent screen if prompted:
   - User Type: **External**
   - App name: **Nashville Charts**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: **Nashville Charts Production**
   - Authorized redirect URIs:
     ```
     https://your-railway-domain.up.railway.app/signin-google
     ```
     *(Replace with your actual Railway domain from Step 3)*

7. Click **"Create"**
8. **Copy the Client ID and Client Secret** - you'll need these!

#### B. Add OAuth Variables to Railway

1. Back in Railway, go to your service
2. Click **"Variables"** tab
3. Add these variables:

```
Authentication__Google__ClientId=YOUR_GOOGLE_CLIENT_ID
Authentication__Google__ClientSecret=YOUR_GOOGLE_CLIENT_SECRET
```

**Important:** Use double underscores (`__`) to represent nested JSON structure!

### 5️⃣ Configure ASPNETCORE_ENVIRONMENT

Add one more environment variable:

```
ASPNETCORE_ENVIRONMENT=Production
```

This tells the app to use production settings.

### 6️⃣ Deploy!

Railway will automatically detect changes and deploy when you push to GitHub.

#### Manual Deploy (if needed):

1. Go to **"Deployments"** tab in Railway
2. Click **"Deploy"**
3. Watch the build logs

The build process:
- ✅ Installs .NET 8 SDK
- ✅ Installs Node.js
- ✅ Restores NuGet packages
- ✅ Builds React frontend with Vite
- ✅ Publishes .NET application
- ✅ Runs database migrations automatically
- ✅ Starts the app

### 7️⃣ Initialize Database

Railway will automatically run migrations on first startup, but if you need to run them manually:

1. In Railway, click your service
2. Go to **"Settings"** → **"Deploy Triggers"**
3. Or use Railway CLI:

```bash
railway run dotnet ef database update --project src/NashvilleCharts.Infrastructure --startup-project src/NashvilleCharts.Web
```

### 8️⃣ Test Your Deployment

1. Open your Railway domain: `https://your-app.up.railway.app`
2. You should see the Nashville Charts home page!
3. Try logging in with Google
4. Create a test chart
5. Export to PDF

## Environment Variables Summary

Here's what you need configured in Railway:

| Variable | Value | Auto-Set? |
|----------|-------|-----------|
| `DATABASE_URL` | PostgreSQL connection | ✅ Auto |
| `ASPNETCORE_ENVIRONMENT` | `Production` | ❌ Manual |
| `Authentication__Google__ClientId` | Your Google Client ID | ❌ Manual |
| `Authentication__Google__ClientSecret` | Your Google Client Secret | ❌ Manual |

### Optional: Facebook OAuth

If you want Facebook login:

```
Authentication__Facebook__AppId=YOUR_FACEBOOK_APP_ID
Authentication__Facebook__AppSecret=YOUR_FACEBOOK_APP_SECRET
```

Follow similar steps at [Facebook Developers](https://developers.facebook.com/).

## Custom Domain Setup (Optional)

Once you're ready for a custom domain:

### 1. Purchase Domain

Buy from Namecheap, Google Domains, Cloudflare, etc.

### 2. Add Domain in Railway

1. Go to your service → **"Settings"** → **"Networking"**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `nashvillecharts.com`)
4. Railway gives you a **CNAME** record

### 3. Configure DNS

In your domain registrar's DNS settings:

```
Type: CNAME
Name: @ (or www)
Value: [Railway CNAME from step 2]
```

### 4. Update OAuth Redirect URIs

Go back to Google Cloud Console and add:

```
https://nashvillecharts.com/signin-google
```

### 5. SSL Certificate

Railway automatically provisions Let's Encrypt SSL - **free and automatic!**

## Troubleshooting

### Build Fails

- Check **"Deployments"** → **"Build Logs"** in Railway
- Common issues:
  - Node.js version mismatch
  - Missing npm dependencies
  - .NET restore errors

### Database Connection Fails

- Verify `DATABASE_URL` exists in **"Variables"**
- Check PostgreSQL service is running
- Look at application logs

### OAuth Doesn't Work

- Verify redirect URIs match exactly (https://, no trailing slash)
- Check client ID/secret are correct
- Ensure environment variables use `__` (double underscore)

### App Won't Start

- Check **"Deploy Logs"** for errors
- Verify `ASPNETCORE_ENVIRONMENT=Production`
- Check if port binding is correct (Railway auto-assigns PORT)

## Monitoring & Logs

### View Logs

1. Railway Dashboard → Your Service
2. Click **"Deployments"** → Latest deployment
3. Click **"View Logs"**

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request count

## Cost Estimate

```
Railway Hobby Plan              $5/month
PostgreSQL Database             Included in $5
SSL Certificate                 Free
Bandwidth (100GB included)      Free
Additional bandwidth            $0.10/GB
```

**Total: $5/month** for most use cases!

## Scaling

If you outgrow the $5 plan:

1. Upgrade to **Pro Plan** ($20/month)
2. Increase resources per service
3. Add Redis for caching
4. Add multiple replicas

## Next Steps

- ✅ Deploy to Railway
- 📧 Set up custom domain
- 🔒 Configure additional OAuth providers
- 📊 Set up monitoring/alerts
- 🚀 Share with users!

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create issues in this repo

## Rollback

If something goes wrong:

1. Railway Dashboard → **"Deployments"**
2. Find a previous working deployment
3. Click **"⋮"** → **"Redeploy"**

---

**You're all set!** 🎉 Your Nashville Charts app should now be live on Railway!
