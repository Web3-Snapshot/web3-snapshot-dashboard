# Web3 Snapshot Dashboard

A dashboard that shows recent trends on the crypto market using data from the CoinGecko API.

## Architecture

### Components

- **Frontend**: React application with nginx serving HTTPS traffic
- **Backend**: Flask API server providing crypto market data from Redis
- **Data Fetcher**: Service that fetches data from CoinGecko API via cron jobs
- **Redis**: Data store for all crypto market data
- **SSL**: Automated Let's Encrypt certificate management

### Data Flow

- **External API**: CoinGecko API provides crypto market data
- **Data Fetcher**: Fetches and processes data every 6 minutes, stores in Redis
- **Redis Store**: Data storage with pub/sub for real-time updates
- **Backend API**: Serves data from Redis to frontend
- **Frontend**: Receives real-time updates via server-sent events

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
   /opt/web3-snapshot/scripts/deploy-production.sh
   ```

   **Alternative - Pull deployment script from S3:**
   ```bash
   aws s3 cp s3://w3s-deployment-configs-us-east-1/scripts/deploy-production.sh - --region us-east-1 | bash
   ```

3. **Generate SSL Certificates**:
   ```bash
   /opt/web3-snapshot/scripts/renew-certificate.sh
   ```

### Automated Deployment Pipeline

Merge to `main` branch (via PR) triggers:

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
- Script: `/opt/web3-snapshot/scripts/renew-certificate.sh`
- Logs: `/var/log/certificate-renewal.log`

### Manual Certificate Operations

```bash
# Generate new certificates
/opt/web3-snapshot/scripts/renew-certificate.sh

# Check certificate status
docker compose -f docker-compose.certbot.yml run --rm certbot certificates
```

## Development

For local development setup, container architecture, and debugging tools, see the [Development Guide](docs/development.md).

## File Structure

```
├── backend/           # Flask API server
├── data_fetcher/      # Data fetcher service (CoinGecko API → Redis)
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

## Server Troubleshooting

### Common Production Issues

**SSL Certificate Problems**:

```bash
# Check certificate status
docker logs web3_frontend_prod

# Regenerate certificates
/opt/web3-snapshot/scripts/renew-certificate.sh
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

### Container Status (Server)

```bash
docker compose -f docker-compose.production.yml ps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
