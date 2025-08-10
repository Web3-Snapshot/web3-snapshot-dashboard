# Web3 Snapshot Dashboard

A dashboard that shows recent trends on the crypto market using data from the CoinGecko API.

## Architecture

### Components
- **Frontend**: React application with nginx serving HTTPS traffic
- **Backend**: Flask API server providing crypto market data
- **Database**: SQLite with automated data fetching via cron jobs
- **Redis**: Caching layer for API responses
- **SSL**: Automated Let's Encrypt certificate management

### Infrastructure
- **Deployment**: AWS EC2 with Docker containers
- **Images**: Multi-platform Docker images stored in AWS ECR
- **Configuration**: AWS SSM Parameter Store for secrets
- **Storage**: AWS S3 for deployment artifacts

## Deployment

### Prerequisites
- AWS account with ECR repositories created
- Domain name pointing to your EC2 instance
- GitHub repository secrets configured

### GitHub Secrets Required
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ACCOUNT_ID
AWS_REGION
COINGECKO_API_URL
COINGECKO_API_KEY
CERTIFICATE_EMAIL
S3_DEPLOYMENT_BUCKET
```

### Production Deployment

1. **Launch EC2 Instance** with the user data script:
   ```bash
   # Use scripts/ec2-user-data.sh as user data
   ```

2. **Deploy Application**:
   ```bash
   ssh ubuntu@<server-ip>
   ~/web3-snapshot/scripts/deploy-production.sh
   ```

3. **Generate SSL Certificates**:
   ```bash
   ~/web3-snapshot/scripts/renew-certificate.sh
   ```

### Automated Deployment Pipeline

Push to `main` branch triggers:
1. Multi-platform Docker image builds (AMD64/ARM64)
2. Push images to AWS ECR
3. Update SSM parameters
4. Upload configuration files to S3

## SSL Certificate Management

### Automatic Certificate Generation
- Certificates are generated automatically during deployment
- Uses Let's Encrypt with webroot validation
- Certificates stored in Docker volumes

### Certificate Renewal
- Automated renewal via cron job (twice daily)
- Script: `~/web3-snapshot/scripts/renew-certificate.sh`
- Logs: `/var/log/certificate-renewal.log`

### Manual Certificate Operations
```bash
# Generate new certificates
~/web3-snapshot/scripts/renew-certificate.sh

# Check certificate status
docker compose -f docker-compose.certbot.yml run --rm certbot certificates
```

## Development

### Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd web3-snapshot-dashboard

# Start development environment
docker compose -f docker-compose.development.yml up -d

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Environment Configuration
- Copy `.env.development_TEMPLATE` to `.env.development`
- Configure CoinGecko API credentials
- Update database and Redis URLs as needed

## File Structure

```
├── backend/           # Flask API server
├── database/          # Data fetching and storage
├── frontend/          # React application
├── nginx/             # Nginx config for SSL challenges
├── scripts/           # Deployment and management scripts
├── docker-compose.*.yml # Container orchestration
└── .github/workflows/ # CI/CD pipeline
```

## Scripts

### Deployment Scripts
- `scripts/deploy-production.sh` - Main production deployment
- `scripts/ec2-user-data.sh` - EC2 instance bootstrap
- `scripts/bootstrap-server.sh` - Server setup (Docker, AWS CLI)

### Certificate Management
- `scripts/renew-certificate.sh` - SSL certificate generation/renewal

### Development Tools
- `scripts/manage.sh` - Development environment management

## Troubleshooting

### Common Issues

**SSL Certificate Problems**:
```bash
# Check certificate status
docker logs web3_frontend_prod

# Regenerate certificates
~/web3-snapshot/scripts/renew-certificate.sh
```

**Container Issues**:
```bash
# Check container status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs [service-name]
```

**Environment Variable Issues**:
```bash
# Verify environment variables
cd ~/web3-snapshot
source .env.production
echo $AWS_REGION
```

### Log Locations
- Application logs: `docker compose logs`
- Certificate renewal: `/var/log/certificate-renewal.log`
- Data fetching: `/var/log/web3snapshot-fetch.log`
- User data script: `/var/log/user-data.log`

## Configuration

### SSM Parameters
The application uses AWS SSM Parameter Store for configuration:
- `/w3s/production/redis-url`
- `/w3s/production/coingecko-api-url`
- `/w3s/production/coingecko-api-key`
- `/w3s/production/aws-account`
- `/w3s/production/aws-region`
- `/w3s/production/domain`
- `/w3s/production/email`

### Docker Compose Files
- `docker-compose.development.yml` - Local development
- `docker-compose.production.yml` - Production deployment
- `docker-compose.certbot.yml` - SSL certificate management

## Security

- SSL certificates automatically managed via Let's Encrypt
- Secrets stored in AWS SSM Parameter Store
- Container memory limits to prevent resource exhaustion
- Regular security updates via automated deployment

## Monitoring

### Health Checks
- Frontend: `https://yourdomain.com`
- Backend API: `https://yourdomain.com/api/health`

### Container Status
```bash
docker compose -f docker-compose.production.yml ps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Submit a pull request

## License

[Add your license information here]
