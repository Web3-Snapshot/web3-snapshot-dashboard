# shellcheck shell=sh

# Defining variables and functions here will affect all specfiles.
# Change shell options inside a function may cause different behavior,
# so it is better to set them here.
# set -eu

# This callback function will be invoked only once before loading specfiles.
spec_helper_precheck() {
  # Available functions: info, warn, error, abort, setenv, unsetenv
  # Available variables: VERSION, SHELL_TYPE, SHELL_VERSION
  : minimum_version "0.29.0"
}

# This callback function will be invoked after a specfile has been loaded.
spec_helper_loaded() {
  :
}

# This callback function will be invoked after core modules has been loaded.
spec_helper_configure() {
  # Available functions: import, before_each, after_each, before_all, after_all
  : import 'support/custom_matcher'
}

setup_test_fixtures() {
    mkdir -p "$SHELLSPEC_TMPDIR/fixtures"
    
    cat > "$SHELLSPEC_TMPDIR/fixtures/.env.development" << 'EOF'
ENVIRONMENT=development
REDIS_URL=redis://localhost:6379
COINGECKO_API_URL=https://api.coingecko.com
COINGECKO_API_KEY=test-key
AWS_ACCOUNT=123456789
AWS_PROFILE=test-profile
AWS_REGION=us-east-1
DOMAIN=test.example.com
AWS_FRONTEND_REPOSITORY=test-repo
CERTIFICATE_RENEWAL_LOG=/tmp/test.log
EOF
}
