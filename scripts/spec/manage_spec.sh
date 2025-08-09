#!/bin/bash

Describe "manage.sh"
  Include scripts/spec/spec_helper.sh
  
  BeforeAll 'setup_test_fixtures'

  # Minimal reusable docker mock fixture (logs suppressed for now)
  docker_fixture_basic() {
    Mock docker
      # Future: add simple branching & logging
      exit 0
    End
  }

  Describe "Help functionality"
    It "shows help without environment processing"
      When run bash scripts/manage.sh --help
      The status should be success
      The stdout should include "Manage the application"
    End
  End

  Describe "Environment loading"
    setup() {
      echo "TEST_VAR=from_file" >> "$SHELLSPEC_TMPDIR/fixtures/.env.development"
      export ENVIRONMENT="development"
      . "$(pwd)/scripts/manage.sh"
      ENV_FILE="$(_realpath "$SHELLSPEC_TMPDIR/fixtures/.env.development")"
      _load_env_file
    }
    BeforeEach 'setup'
    It "loads environment variables from correct .env file"
      The variable TEST_VAR should eq "from_file"
    End
  End

  Describe "Environment validation with mocked files"
    setup() {
      . "$(pwd)/scripts/manage.sh"
      export ENVIRONMENT="development"
      ENV_FILE="$SHELLSPEC_TMPDIR/fixtures/.env.development"
      _load_env_file
    }
    BeforeEach 'setup'
    It "works with mocked environment file"
      When call print_vars
      The output should include "ENVIRONMENT: development"
      The output should include "REDIS_URL: redis://localhost:6379"
      The output should include "COINGECKO_API_URL: https://api.coingecko.com"
      The output should include "COINGECKO_API_KEY: test-key"
      The output should include "AWS_ACCOUNT: 123456789"
      The output should include "AWS_PROFILE: test-profile"
      The output should include "AWS_REGION: us-east-1"
      The output should include "DOMAIN: test.example.com"
      The output should include "AWS_FRONTEND_REPOSITORY: test-repo"
      The output should include "CERTIFICATE_RENEWAL_LOG: /tmp/test.log"
    End
  End

  # Shared inline env exports for external script invocations
  env_exports='ENVIRONMENT=development REDIS_URL=redis://localhost:6379 COINGECKO_API_URL=https://api.coingecko.com COINGECKO_API_KEY=test-key AWS_ACCOUNT=123456789 AWS_PROFILE=test-profile AWS_REGION=us-east-1 DOMAIN=test.example.com AWS_FRONTEND_REPOSITORY=test-repo CERTIFICATE_RENEWAL_LOG=/tmp/test.log'

  Describe "Argument parsing"
    docker_fixture_basic
    It "fails with missing build argument"
      When run env $env_exports bash scripts/manage.sh --build
      The status should be failure
      The stderr should include "Missing value for the optional argument"
    End

    It "handles --build with service argument"
      When run env $env_exports bash scripts/manage.sh --build backend
      The status should be success
      The stdout should include "Building service: backend"
    End

    # It "fails with unknown option"
    #   When run env $env_exports bash scripts/manage.sh --totally-unknown-command
    #   The status should be failure
    #   The stderr should include "Unknown option"
    # End
  End

  Describe "Command execution"
    docker_fixture_basic

    It "executes ps command"
      When run env $env_exports bash scripts/manage.sh --ps
      The status should be success
      # Depending on script output; retain previous expectation
      The stdout should include "Found an environment file"
    End

     It "prints all expected variables via --print-vars"
      When run env $env_exports bash scripts/manage.sh --print-vars
      The status should be success
      The stdout should include "COINGECKO_API_URL: https://api.coingecko.com"
      The stdout should include "COINGECKO_API_KEY: test-key"
      The stdout should include "AWS_ACCOUNT: 123456789"
      The stdout should include "AWS_PROFILE: test-profile"
      The stdout should include "AWS_REGION: us-east-1"
      The stdout should include "DOMAIN: test.example.com"
      The stdout should include "AWS_FRONTEND_REPOSITORY: test-repo"
      The stdout should include "CERTIFICATE_RENEWAL_LOG: /tmp/test.log"
    End
  End

Describe "Certificate renewal"
    prepare_compose_file() {
      CERT_COMPOSE_FILE="$SHELLSPEC_TMPDIR/docker-compose.certbot.yml"
      : > "$CERT_COMPOSE_FILE"
    }
    BeforeEach 'prepare_compose_file'

    It "passes --dry-run flag to renew-certificate command"
      Mock docker
        echo "docker $@"
        return 0
      End
      When run env $env_exports DOCKER_COMPOSE_CERTBOT_YML="$CERT_COMPOSE_FILE" bash scripts/manage.sh --renew-certificate --dry-run
      The status should be success
      The stdout should include "--dry-run"
    End
  End
End