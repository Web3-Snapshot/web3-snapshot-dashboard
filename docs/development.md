# Development Guide

> **Note**: You can locally export `export PATH="$PWD/scripts:$PATH"` and `export ENVIRONMENT=development` to be able to call manage directly without ./scripts/manage.sh. The following sections assume this has been done.

## Local Development Setup

```bash
# Clone repository
git clone <repository-url>
cd web3-snapshot-dashboard

# Setup environment
cp .env.development_TEMPLATE .env.development
# Edit .env.development and add your CoinGecko API key


manage --start

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Container Architecture

The application consists of five main containers in development:

### Core Services

- **frontend**: React development server with hot reload
- **backend**: Flask API server serving data from Redis
- **data_fetcher**: Data fetcher service that retrieves data from CoinGecko API
- **redis**: Data store for all crypto market data

### Development Tools

- **isession**: Interactive Python session for system development and debugging

### Container Organization

```
                    CoinGecko API
                          │
                          ▼
                 ┌─────────────────┐
                 │   Data Fetcher   │
                 │  (Cron: 6min)   │
                 │  database:5432  │
                 └─────────────────┘
                          │
                          ▼ (stores data)
                 ┌─────────────────┐
                 │      Redis      │
                 │  (Data Store)   │
                 │   Port: 6379    │
                 └─────────────────┘
                          │
                          ▼ (reads data)
┌─────────────────┐    ┌─────────────────┐
│    Frontend     │◄──►│     Backend     │
│   (React Dev)   │    │   (Flask API)   │
│   Port: 3000    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘

                 ┌─────────────────┐
                 │    iSession     │◄──── Redis (network)
                 │ (Debug/Explore) │
                 │   Interactive   │
                 └─────────────────┘
```

### Shared Resources

- **cache volume**: Redis data persistence
- **w3s_development-nw**: Internal network for container communication
- **Redis pub/sub**: Real-time data updates between data fetcher and backend

## Interactive Session (isession)

The isession container provides an interactive IPython environment for developing and testing system components.

### Features

- Redis connection for testing data operations
- Auto-reload enabled for iterative development
- Vi editing mode
- Access to all backend and data fetcher modules for testing

### Usage

```bash
# Start interactive session
manage --isession

# Available in session:
# - redis_conn: Redis connection for testing
# - cache: Redis cache helper
# - All backend/data fetcher modules loaded
```

### Development Use Cases

- **Test API functions**: Import and test data fetcher functions interactively
- **Debug Redis operations**: Inspect data structure and test cache operations
- **Prototype new features**: Develop and test code before adding to main codebase
- **Inspect system state**: Check current data, debug issues

Example usage:

```python
# Test data fetcher functions
from core.main import get_coins, preprocess_data
response = get_coins(10)
processed = preprocess_data(response.json())

# Inspect current system data
redis_conn.keys('coins:*')
coins = json.loads(redis_conn.get('coins:all'))

# Test new functionality
from utils.helpers import compute_extra_columns
test_data = compute_extra_columns(coins)
```

### Configuration

- **Startup script**: Automatically loads database and Redis connections
- **IPython config**: Vi mode, autoreload, true color support
- **History**: Persistent command history across sessions

## Development Commands

### Service Management

```bash
# Start all development services
manage --start

# Stop all services and clean up
manage --stop

# Check status of running containers
manage --ps

# View real-time logs from all services
manage --logs
```



### Testing and Quality

```bash
# Run all test suites (backend and database)
manage --tests

# Build containers (useful after dependency changes)
manage --build all             # Build all services
manage --build backend         # Build specific service
manage --build backend --no-cache  # Build without using cache
```

### Debugging and Development

```bash
# Connect to service containers for debugging
manage --connect-service backend  # Drops into backend container shell
manage --connect-service data_fetcher  # Drops into data_fetcher container shell
manage --connect-service redis    # Drops into redis-cli prompt

# Interactive Python session with pre-loaded connections
manage --isession                 # iPython with Redis and system modules

# Install Python packages in backend container
manage --install-backend package-name
```

### Information and Help

```bash
# Display all available commands and options
manage --help

# Print current environment variables
manage --print-vars
```

## Environment Configuration

### Required Variables

Copy `.env.development_TEMPLATE` to `.env.development` and configure:

```bash
ENVIRONMENT=development
REDIS_URL=redis://redis:6379/0
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=<your_coingecko_api_key_here>
CERTIFICATE_RENEWAL_LOG=/var/log/certificate_renewal.log
```

### Dependencies

All dependencies are handled automatically by Docker:

- **Frontend**: npm packages installed during build
- **Backend**: Python packages via Pipfile installed during build
- **Database**: Python packages via Pipfile installed during build

### Hot Reload

- **Frontend**: React dev server automatically reloads on file changes
- **Backend**: Flask development server reloads on Python file changes
- **Database**: Code changes are reflected via volume mounting

## File Structure

```
├── backend/           # Flask API server (serves from Redis)
│   ├── server/        # API routes and Redis connections
│   ├── tests/         # Backend tests
│   └── Dockerfile.dev # Development container
├── database/          # Data fetcher service (CoinGecko → Redis)
│   ├── core/          # API fetching and Redis storage logic
│   ├── tests/         # Data fetcher tests
│   └── crontab        # 6-minute scheduled data fetching
├── frontend/          # React application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── Dockerfile.dev # Development container
├── isession/          # Interactive debugging
│   ├── .ipython/      # IPython configuration
│   └── utils/         # Helper functions
└── scripts/           # Management scripts
    └── manage.sh      # Main development tool
```

## Troubleshooting

### Common Issues

**Database not found**:

```bash
# Initialize database
manage --init-db
```

**Port conflicts**:

```bash
# Check what's using ports
lsof -i :3000
lsof -i :5000
```

**Container issues**:

```bash
# Check container status
manage --ps

# View specific service logs
docker compose -f docker-compose.development.yml logs backend
```

**Environment variables**:

```bash
# Verify environment file exists
ls -la .env.development

# Check manage script can read variables
manage --print-vars
```
