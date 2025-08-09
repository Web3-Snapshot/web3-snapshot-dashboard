#!/bin/bash

# This shell script is used to manage the application via simple commands
# targeting the underlying docker setup. It contains various functions to start,
# stop, and restart the application.
#
# Commands:
#   start - Starts the application
#   stop - Stops the application
#   print-vars - Prints the environment variables
#   build - Builds the containers
#   tests - Runs the tests
#   ps - Shows the running containers
#   logs - Shows the logs of the application
#   isession - Starts an interactive session
#   connect-service - Connects to a service
#   start-cert-server - Starts the certbot server on port 80
#   get-certificate - Gets a certificate
#   renew-certificate - Renews a certificate
#   help - Shows the help menu

#######################################
#####      Global variables       #####
#######################################

valid_environments=("production" "testing" "development")
required_variables=("ENVIRONMENT" "REDIS_URL" "COINGECKO_API_URL"
    "COINGECKO_API_KEY" "AWS_ACCOUNT" "AWS_PROFILE" "AWS_REGION" "DOMAIN"
    "AWS_FRONTEND_REPOSITORY" "CERTIFICATE_RENEWAL_LOG")

#######################################
#####      Internal functions     #####
#######################################

# Execute docker compose with specified environment variables
# Usage: _exec_dc var_array command...
_exec_dc() {
    if [[ $# -lt 2 ]]; then
        echo "Error: _exec_dc requires at least 2 arguments: variable_array and command" >&2
        return 1
    fi

    local -n vars_ref="$1"
    shift

    local env_prefix=""

    for var_name in "${vars_ref[@]}"; do
        if [[ -n "${!var_name}" ]]; then
            env_prefix+="${var_name}=${!var_name} "
        fi
    done

    if [[ -n "$env_prefix" ]]; then
        /bin/bash -c "${env_prefix}$*"
    else
        "$@"
    fi
}

# Define a function to convert a relative path to an absolute path
_realpath() {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

# This function validates the environment before executing any command.
_validate_environment() {
    valid=false

    for i in "${valid_environments[@]}"; do
        if [[ "$i" == "$ENVIRONMENT" ]]; then
            valid=true
            break
        fi
    done

    if [ "$valid" = false ]; then
        echo "Variable ENVIRONMENT must be either production, testing, cypress or development."
        exit 1
    fi
}

_load_env_file() {
    # Check if the file exists
    if [ -f "$ENV_FILE" ]; then
        echo "Found an environment file: $ENV_FILE"

        local loaded_vars=()
        local ignored_vars=()

        # Load variables from .env file, respecting existing environment variables
        while read -r line || [[ -n "$line" ]]; do
            if [[ ! "$line" =~ ^# && ! "$line" =~ ^\s*$ ]]; then
                var_name=$(echo "$line" | cut -d= -f1)
                file_value=$(echo "$line" | cut -d= -f2-)
                if [[ -z "${!var_name}" ]]; then
                    loaded_vars+=("$var_name")
                    export "${line?}"
                else
                    ignored_vars+=("${var_name} (${!var_name} -> ${file_value})")
                fi
            fi
        done <"$ENV_FILE"

        # Print summary
        if [[ ${#loaded_vars[@]} -gt 0 ]]; then
            echo "Loaded from file: ${loaded_vars[*]}"
        fi
        if [[ ${#ignored_vars[@]} -gt 0 ]]; then
            echo "Already set, ignoring file values:"
            for var_info in "${ignored_vars[@]}"; do
                echo "  $var_info"
            done
        fi
    fi
    echo
}

# This function checks if the required variables are set. The variable names are passed in from the required_vars array.
_check_required_variables() {
    for var in "${required_variables[@]}"; do
        if [ -z "${var}" ]; then
            echo "Error: Required variable $var is not set."
            exit 1
        fi
    done
}

# Validate that an option has a required argument
# Usage: _validate_option_arg "option_name" remaining_args_count next_arg
_validate_option_arg() {
    local option_name="$1"
    local remaining_args="$2"
    local next_arg="$3"
    
    # Check if there are enough arguments remaining
    test "$remaining_args" -lt 2 && die "Missing value for the optional argument '$option_name'." 1
    
    # Check if the next argument starts with - (indicating it's another option)
    [[ "$next_arg" == -* ]] && die "Missing value for the optional argument '$option_name'." 1
}

######################################
#####      Exposed functions     #####
######################################
check_db() {
    echo "Checking if database exists..."
    
    # Direct approach: list files and grep for database file
    if docker compose -f docker-compose."$ENVIRONMENT".yml run --rm backend ls /app/instance/ | grep -q "$ENVIRONMENT.db"; then
        echo "Database found"
        return 0
    else
        echo "Database not found. Run migrations first"
        return 1
    fi
}

start() {
    echo "Starting containers in $ENVIRONMENT environment"
    # shellcheck disable=SC2034
    local -a start_vars=("ENVIRONMENT" "DEBUG")
    check_db && _exec_dc start_vars docker compose -f docker-compose."$ENVIRONMENT".yml up -d frontend backend db redis
}

stop() {
    # Only needs ENVIRONMENT to find the right compose file
    # shellcheck disable=SC2034
    local -a stop_vars=("ENVIRONMENT")
    _exec_dc stop_vars docker compose -f docker-compose."$ENVIRONMENT".yml down --remove-orphans
}

build() {
    docker_command="ENVIRONMENT=$ENVIRONMENT docker compose -f docker-compose.$ENVIRONMENT.yml build"

    if [ "$_arg_build_service" = "all" ]; then
        echo "Building all services"
        if [ "$ENVIRONMENT" = "production" ]; then
            echo "Production build: frontend will be omitted"
            docker_command="$docker_command db redis backend"
        else
            docker_command="$docker_command frontend backend db redis"
        fi
    else
        echo "Building service: $_arg_build_service"
        docker_command="$docker_command $_arg_build_service"
    fi

    if [ "$_arg_cache" = "on" ]; then
        echo "Building with cache"
    else
        echo "Building without cache"
        docker_command="$docker_command --no-cache"
    fi

    /bin/sh -c "$docker_command"
}

deploy() {
    echo "Deploying to AWS"

    aws sso login --profile "$AWS_PROFILE" &&
        (aws ecr get-login-password --region "$AWS_REGION" --profile "$AWS_PROFILE") | docker login --username AWS --password-stdin $AWS_ACCOUNT

    # First, remove the old image
    docker image rm "$AWS_ACCOUNT"/"$AWS_FRONTEND_REPOSITORY"

    # Then, build the new image
    docker compose -f docker-compose.production.yml build frontend

    docker push "$AWS_ACCOUNT/$AWS_FRONTEND_REPOSITORY:latest"
}

connect_service() {
    if [[ "$_arg_connect_service" == 'redis' ]]; then
        ENVIRONMENT=${ENVIRONMENT} \
            docker compose -f docker-compose."$ENVIRONMENT".yml run --rm -d --service-ports --name="temp_redis" redis &&
            docker ps && docker compose -f docker-compose."$ENVIRONMENT".yml exec redis redis-cli && docker rm -f temp_redis
    else
        ENVIRONMENT=${ENVIRONMENT} \
            docker compose -f docker-compose."$ENVIRONMENT".yml run --rm -it "$_arg_connect_service" /bin/sh
    fi
}

ps() {
    # Only needs ENVIRONMENT to find the right compose file
    # shellcheck disable=SC2034
    local -a ps_vars=("ENVIRONMENT")
    _exec_dc ps_vars docker compose -f docker-compose."$ENVIRONMENT".yml ps
}

print_vars() {
    for i in "${required_variables[@]}"; do
        echo "$i: ${!i}"
    done
}

logs() {
    # Only needs ENVIRONMENT to find the right compose file
    # shellcheck disable=SC2034
    local -a logs_vars=("ENVIRONMENT")
    _exec_dc logs_vars docker compose -f docker-compose."$ENVIRONMENT".yml logs -f
}

tests() {
    # Tests should mock external dependencies and don't need certificate logging
    # shellcheck disable=SC2034
    local -a test_vars=("ENVIRONMENT" "DEBUG" "REDIS_URL")
    start && _exec_dc test_vars docker compose -f docker-compose."$ENVIRONMENT".yml run --rm backend pytest tests -vvv &&
        _exec_dc test_vars docker compose -f docker-compose."$ENVIRONMENT".yml run --rm db pytest tests -vvv
}

isession() {
    # Needs full environment since it runs the isession container
    # shellcheck disable=SC2034
    local -a isession_vars=("ENVIRONMENT" "DEBUG" "REDIS_URL" "COINGECKO_API_URL" "COINGECKO_API_KEY" "CERTIFICATE_RENEWAL_LOG")
    start &&
        _exec_dc isession_vars docker compose -f docker-compose."$ENVIRONMENT".yml run --service-ports --no-deps --rm -d isession &&
        docker attach "(docker ps -aqf 'name=isession')"
}

init_db() {
    # Needs full environment since it runs the db container
    # shellcheck disable=SC2034
    local -a init_vars=("ENVIRONMENT" "DEBUG" "REDIS_URL" "COINGECKO_API_URL" "COINGECKO_API_KEY" "CERTIFICATE_RENEWAL_LOG")
    _exec_dc init_vars docker compose -f docker-compose."$ENVIRONMENT".yml run --rm db /bin/sh -c "python /app/core/init_db.py"
}

start_cert_server() {
    docker compose -f docker-compose.certbot.yml down &&
        docker compose -f docker-compose.certbot.yml up -d nginx80
}

stop_cert_server() {
    docker compose -f docker-compose.certbot.yml down --remove-orphans
}

get_certificate() {
    docker compose -f docker-compose.certbot.yml run --rm certbot certonly --webroot \
        --webroot-path /var/www/certbot/ -d "${DOMAIN}" -d "${DOMAIN}" -v
}

# Renew SSL certificate using certbot
# Uses the dry_run_flag variable set in the preparation phase to determine if this is a test run
renew_certificate() {
    local log_file="$CERTIFICATE_RENEWAL_LOG"
    local output
    local exit_code

    # Determine the location of docker-compose.certbot.yml
    local compose_file="${1:-${DOCKER_COMPOSE_CERTBOT_YML:-docker-compose.certbot.yml}}"

    # Validate the compose file exists
    if [ ! -f "$compose_file" ]; then
        echo "Error: Docker Compose file not found: $compose_file" >&2
        return 1
    fi

    # Run the docker command and capture output and exit code
    # The dry_run_flag variable is set in the preparation phase
    output=$(docker compose -f "$compose_file" run --rm certbot renew --webroot --webroot-path /var/www/certbot/ $dry_run_flag 2>&1)
    exit_code=$?

    # Log the output
    echo "$output"
    echo "$output" >>"$log_file"

    # Handle errors
    if [ $exit_code -ne 0 ]; then
        echo "Error renewing certificate: $output" >&2
        echo "Error renewing certificate: $output" >>"$log_file"
        return 1
    fi

    return 0
}

install_backend() {
    if [[ -z "$_arg_install_backend" ]]; then
        echo "Error: No package to install."
        exit 1
    fi

    rm -rf backend/Pipfile.lock
    # Only needs basic environment since it executes in existing backend container
    # shellcheck disable=SC2034
    local -a install_vars=("ENVIRONMENT" "REDIS_URL")
    start && _exec_dc install_vars docker compose -f docker-compose."$ENVIRONMENT".yml exec backend pip install "$_arg_install_backend"
}


#######################################
#####      Argument Parsing       #####
#######################################

# ARG_OPTIONAL_ACTION([start],[],[Start the server],[start])
# ARG_OPTIONAL_ACTION([stop],[],[Stop the server],[stop])
# ARG_OPTIONAL_ACTION([print-vars],[],[Print variables],[print_vars])
# ARG_OPTIONAL_SINGLE([build],[],[Build with docker compose])
# ARG_OPTIONAL_SINGLE([deploy],[],[Deploy application to server])
# ARG_OPTIONAL_BOOLEAN([debug],[],[Start up the debugging server and attach],[off])
# ARG_OPTIONAL_BOOLEAN([dry-run],[],[Run certificate renewal in dry-run mode],[off])
# ARG_OPTIONAL_ACTION([tests],[],[Run pytests],[tests])
# ARG_OPTIONAL_ACTION([ps],[],[Print running containers],[ps])
# ARG_OPTIONAL_ACTION([logs],[],[Tail out logs],[logs])
# ARG_OPTIONAL_ACTION([isession],[],[Start an interactive session],[isession])
# ARG_OPTIONAL_ACTION([start-cert-server],[],[Start the certbot server on port 80],[start-cert-server])
# ARG_OPTIONAL_ACTION([stop-cert-server],[],[Stop the certbot server],[stop-cert-server])
# ARG_OPTIONAL_ACTION([get-certificate],[],[Get a certbot certificate],[get-certificate])
# ARG_OPTIONAL_ACTION([renew-certificate],[],[Renew certificate],[renew-certificate])
# ARG_OPTIONAL_SINGLE([connect-service],[],[Connect to a service],[connect-service])
# ARG_OPTIONAL_SINGLE([install-backend],[],[Install backend package])
#
# ARG_HELP([The general script's help msg])
# ARGBASH_GO()

die() {
    local _ret="${2:-1}"
    test "${_PRINT_HELP:-no}" = yes && print_help >&2
    echo "$1" >&2
    exit "${_ret}"
}

begins_with_short_option() {
    local first_option all_short_options='h'
    first_option="${1:0:1}"
    test "$all_short_options" = "${all_short_options/$first_option/}" && return 1 || return 0
}

# THE DEFAULTS INITIALIZATION - OPTIONALS
_arg_connect_service=
_arg_debug=off
_arg_dry_run=off
_arg_build_service=all
_arg_deploy=
_arg_cache=off

print_help() {
    printf '%s\n' "Manage the application via simple commands targeting the underlying docker setup."
    printf 'Usage: %s [--start] [--stop] [--print-vars] [--build] [--deploy] [--build-backend] [--(no-)debug] [--(no-)dry-run] [--tests] [--ps] [--logs] [--issession] [--start-cert-server] [--stop-cert-server] [--get-certificate] [--renew-certificate] [--connect-service <arg>] [--install-backend <arg>] [-h|--help]\n' "$0"
    printf '\t%s\n' "--start: Start the server"
    printf '\t%s\n' "--stop: Stop the server"
    printf '\t%s\n' "--print-vars: Print variables"
    printf '\t%s\n' "--build: Build with docker compose (no default)"
    printf '\t%s\n' "--deploy: Deploy application to remote server (no default)"
    printf '\t%s\n' "--debug, --no-debug: Start up the debugging server and attach (off by default)"
    printf '\t%s\n' "--dry-run, --no-dry-run: Run certificate renewal in dry-run mode (off by default)"
    printf '\t%s\n' "--init-db: Initialize the database"
    printf '\t%s\n' "--tests: Run pytests"
    printf '\t%s\n' "--ps: Print running containers"
    printf '\t%s\n' "--logs: Tail out logs"
    printf '\t%s\n' "--isession: Start an interactive session"
    printf '\t%s\n' "--start-cert-server: Start the certbot server on port 80"
    printf '\t%s\n' "--stop-cert-server: Stop the certbot server"
    printf '\t%s\n' "--get-certificate: Get a certbot certificate"
    printf '\t%s\n' "--renew-certificate: Renew certificate"
    printf '\t%s\n' "--connect-service: Connect to a service (default: 'connect-service')"
    printf '\t%s\n' "--install-backend: Install backend package (no default)"
    printf '\t%s\n' "-h, --help: Prints help"
}

# Parse command line arguments and set variables
# This function only parses options and validates arguments - no execution happens here
# All commands are stored in the 'command' variable for later execution
parse_commandline() {
    while test $# -gt 0; do
        _key="$1"
        case "$_key" in
        --start)
            command="start"
            ;;
        --stop)
            command="stop"
            ;;
        --print-vars)
            command="print_vars"
            ;;
        --build)
            _validate_option_arg "$_key" $# "$2"
            _arg_build_service="$2"
            command="build"
            shift
            ;;
        --build=*)
            _arg_build_service="${_key##--build=}"
            command="build"
            ;;
        --deploy)
            _validate_option_arg "$_key" $# "$2"
            _arg_deploy="$2"
            command="deploy"
            shift
            ;;
        --deploy=*)
            _arg_deploy="${_key##--deploy=}"
            command="deploy"
            ;;
        --no-debug | --debug)
            _arg_debug="on"
            test "${1:0:5}" = "--no-" && _arg_debug="off"
            ;;
        --no-dry-run | --dry-run)
            _arg_dry_run="on"
            test "${1:0:5}" = "--no-" && _arg_dry_run="off"
            ;;
        --tests)
            command="tests"
            ;;
        --ps)
            command="ps"
            ;;
        --logs)
            command="logs"
            ;;
        --check-db)
            command="check_db"
            ;;
        --isession)
            command="isession"
            ;;
        --connect-service)
            _validate_option_arg "$_key" $# "$2"
            _arg_connect_service="$2"
            command="connect_service"
            shift
            ;;
        --connect-service=*)
            _arg_connect_service="${_key##--connect-service=}"
            command="connect_service"
            ;;
        --init-db)
            command="init_db"
            ;;
        --start-cert-server)
            command="start_cert_server"
            ;;
        --stop-cert-server)
            command="stop_cert_server"
            ;;
        --get-certificate)
            command="get_certificate"
            ;;
        --renew-certificate)
            command="renew_certificate"
            ;;
        --install-backend)
            _validate_option_arg "$_key" $# "$2"
            _arg_install_backend="$2"
            command="install_backend"
            shift
            ;;
        --install-backend=*)
            _arg_install_backend="${_key##--install-backend=}"
            command="install_backend"
            ;;
        -h | --help)
            print_help
            exit 0
            ;;
        -h*)
            print_help
            exit 0
            ;;
        *)
            _PRINT_HELP=yes die "FATAL ERROR: Got an unexpected argument '$1'" 1
            ;;
        esac
        shift
    done
}

# Only execute if script is run directly, not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    ### Parse command line arguments
    ##
    #
    parse_commandline "$@"

    ### Check for environment variables
    ##
    # Convert the relative path to an absolute path
    ENV_FILE=$(_realpath ".env.$ENVIRONMENT")
    # Call the function to load the environment file
    _load_env_file

    # Make sure that the environment matches on of the valid environments
    _validate_environment

    _check_required_variables

    # Execute the requested command with any necessary setup
    # Each command runs and exits - no fallthrough behavior
    case "$command" in
    "start")
        if [ "$_arg_debug" = "on" ]; then
            echo "Starting in debug mode"
        fi
        start
        exit 0
        ;;
    "stop")
        stop
        exit 0
        ;;
    "print_vars")
        print_vars
        exit 0
        ;;
    "build")
        if [ -z "$_arg_build_service" ]; then
            echo "Error: Target container environment is not set."
            exit 1
        fi
        build
        exit 0
        ;;
    "deploy")
        if [ -z "$_arg_deploy" ]; then
            echo "Error: Target container environment is not set."
            exit 1
        fi
        deploy
        exit 0
        ;;
    "tests")
        tests
        exit 0
        ;;
    "ps")
        ps
        exit 0
        ;;
    "logs")
        logs
        exit 0
        ;;
    "check_db")
        check_db
        exit 0
        ;;
    "isession")
        isession
        exit 0
        ;;
    "connect_service")
        connect_service
        exit 0
        ;;
    "init_db")
        init_db
        exit 0
        ;;
    "start_cert_server")
        start_cert_server
        exit 0
        ;;
    "stop_cert_server")
        stop_cert_server
        exit 0
        ;;
    "get_certificate")
        get_certificate
        exit 0
        ;;
    "renew_certificate")
        if [ "$_arg_dry_run" = "on" ]; then
            dry_run_flag="--dry-run"
        fi
        renew_certificate
        exit 0
        ;;
    "install_backend")
        install_backend
        exit 0
        ;;
    esac
fi
