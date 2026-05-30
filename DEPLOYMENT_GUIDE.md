# HabitFlow Deployment Guide

This guide covers deploying HabitFlow to production environments.

## Prerequisites

- Node.js 18+ installed
- Git repository (GitHub, GitLab, etc.)
- Database (MySQL 8+)
- Environment variables configured

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@host:3306/habitflow

# Authentication
JWT_SECRET=your-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Application
VITE_APP_ID=your-app-id
VITE_APP_TITLE=HabitFlow
VITE_APP_LOGO=https://your-domain.com/logo.png

# Analytics (Optional)
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# API Keys
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://api.manus.im
```

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

**Frontend Deployment (Vercel)**
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

Build command: `pnpm build`
Output directory: `dist`

**Backend Deployment (Render)**
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `node dist/index.js`
5. Add environment variables
6. Deploy

### Option 2: Railway (Full Stack)

1. Connect GitHub repository to Railway
2. Railway auto-detects Node.js project
3. Add MySQL database plugin
4. Configure environment variables
5. Deploy automatically

### Option 3: Docker (Any Cloud)

Build and deploy Docker image to AWS ECS, Google Cloud Run, Azure Container Instances, DigitalOcean, etc.

## Monitoring & Maintenance

### Error Tracking (Sentry)

1. Create account at https://sentry.io
2. Create new project
3. Add DSN to environment variables
4. Errors automatically tracked

### Analytics (Google Analytics 4)

1. Create GA4 property at https://analytics.google.com
2. Get measurement ID
3. Add to environment variables
4. Track user behavior and conversions

### Performance Monitoring

Monitor API response times, database query performance, error rates, and set up alerts for anomalies.

### Database Backups

```bash
# Daily backup
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Automated backup (cron job)
0 2 * * * /path/to/backup-script.sh
```

## Performance Optimization

### Frontend

- Enable gzip compression
- Minify CSS/JavaScript
- Optimize images
- Use CDN for static assets
- Enable browser caching

### Backend

- Use database indexes
- Implement caching (Redis)
- Rate limiting
- Connection pooling
- Query optimization

### Database

- Add indexes on frequently queried columns
- Archive old data
- Regular maintenance
- Monitor query performance

## Troubleshooting

### Common Issues

**Database connection fails**
- Check DATABASE_URL format
- Verify credentials
- Check firewall rules
- Ensure database is running

**OAuth not working**
- Verify OAUTH_SERVER_URL
- Check VITE_APP_ID
- Ensure callback URL is registered
- Check session cookie settings

**High memory usage**
- Check for memory leaks
- Monitor process with `top`
- Restart application
- Scale horizontally

**Slow API responses**
- Check database query performance
- Enable query caching
- Add database indexes
- Monitor server resources

## Health Checks

Add health check endpoint for monitoring:

```bash
curl https://your-domain.com/api/health
```

## Scaling

### Horizontal Scaling

- Deploy multiple instances
- Use load balancer
- Share database across instances
- Use Redis for session storage

### Vertical Scaling

- Increase server resources
- Upgrade database tier
- Optimize code and queries

## Security Checklist

- Enable HTTPS/SSL
- Set secure cookie flags
- Implement rate limiting
- Add CORS headers
- Validate all inputs
- Use environment variables for secrets
- Enable database encryption
- Regular security audits
- Keep dependencies updated
- Monitor for vulnerabilities
