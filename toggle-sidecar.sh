#!/bin/bash

# CPU Sidecar Toggle Helper Script
# This script helps enable/disable the CPU sidecar and handles app restart

set -e

PREF_KEY="eu.exelban.Stats"
SIDECAR_KEY="enableCpuSidecar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to get current state
get_current_state() {
    local value=$(defaults read "$PREF_KEY" "$SIDECAR_KEY" 2>/dev/null || echo "not-set")
    if [ "$value" = "1" ]; then
        echo "enabled"
    elif [ "$value" = "0" ]; then
        echo "disabled"
    else
        echo "disabled" # default is false
    fi
}

# Function to check if Stats is running
is_stats_running() {
    pgrep -x "Stats" > /dev/null
}

# Function to kill Stats app
kill_stats() {
    echo -e "${YELLOW}Stopping Stats app...${NC}"
    killall Stats 2>/dev/null || true
    sleep 1
}

# Function to start Stats app
start_stats() {
    echo -e "${YELLOW}Starting Stats app...${NC}"
    open -a Stats
    sleep 2
}

# Function to verify sidecar is working
verify_sidecar() {
    echo -e "${BLUE}Verifying sidecar...${NC}"
    sleep 3 # Give it time to start

    response=$(curl -s http://127.0.0.1:8973/cpu 2>&1 || echo "connection-failed")

    if [[ "$response" == *"connection-failed"* ]] || [[ "$response" == *"Connection refused"* ]]; then
        echo -e "${RED}✗ Sidecar verification FAILED${NC}"
        echo "  Server not responding on http://127.0.0.1:8973/cpu"
        echo "  This might mean:"
        echo "    - The setting wasn't applied (try running script again)"
        echo "    - Stats failed to start (check Console.app for errors)"
        return 1
    fi

    # Check if we got data
    if [[ "$response" == *"totalUsage"* ]] && [[ "$response" == *"topProcesses"* ]]; then
        echo -e "${GREEN}✓ Sidecar is working correctly${NC}"
        echo "  Sample data: $(echo "$response" | cut -c1-80)..."
        return 0
    else
        echo -e "${YELLOW}⚠ Sidecar is running but data may be incomplete${NC}"
        echo "  Response: $(echo "$response" | cut -c1-100)..."
        echo "  If you see empty arrays, the readers may not be activated yet."
        return 0
    fi
}

# Main script
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Stats CPU Sidecar Toggle Helper${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

current_state=$(get_current_state)
echo -e "Current state: ${YELLOW}$current_state${NC}"
echo

# Show menu
echo "What would you like to do?"
echo "  1) Enable sidecar (continuous CPU polling, battery impact)"
echo "  2) Disable sidecar (battery-friendly, default)"
echo "  3) Check sidecar status"
echo "  4) Exit"
echo
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        if [ "$current_state" = "enabled" ]; then
            echo -e "${GREEN}Sidecar is already enabled${NC}"
            exit 0
        fi

        echo -e "${YELLOW}Enabling CPU sidecar...${NC}"
        defaults write "$PREF_KEY" "$SIDECAR_KEY" -bool true
        echo -e "${GREEN}✓ Setting updated${NC}"
        echo

        if is_stats_running; then
            echo -e "${YELLOW}Stats is currently running and must be restarted${NC}"
            read -p "Restart Stats now? [Y/n]: " restart
            if [[ "$restart" =~ ^[Yy]$ ]] || [ -z "$restart" ]; then
                kill_stats
                start_stats
                verify_sidecar
            else
                echo -e "${YELLOW}⚠ Remember to restart Stats manually for changes to take effect${NC}"
            fi
        else
            echo -e "${YELLOW}Stats is not running${NC}"
            read -p "Start Stats now? [Y/n]: " start
            if [[ "$start" =~ ^[Yy]$ ]] || [ -z "$start" ]; then
                start_stats
                verify_sidecar
            fi
        fi
        ;;

    2)
        if [ "$current_state" = "disabled" ]; then
            echo -e "${GREEN}Sidecar is already disabled${NC}"
            exit 0
        fi

        echo -e "${YELLOW}Disabling CPU sidecar...${NC}"
        defaults write "$PREF_KEY" "$SIDECAR_KEY" -bool false
        echo -e "${GREEN}✓ Setting updated${NC}"
        echo

        if is_stats_running; then
            echo -e "${YELLOW}Stats is currently running and must be restarted${NC}"
            read -p "Restart Stats now? [Y/n]: " restart
            if [[ "$restart" =~ ^[Yy]$ ]] || [ -z "$restart" ]; then
                kill_stats
                start_stats
                echo -e "${GREEN}✓ Stats restarted with sidecar disabled${NC}"
            else
                echo -e "${YELLOW}⚠ Remember to restart Stats manually for changes to take effect${NC}"
            fi
        else
            echo -e "${GREEN}✓ Sidecar disabled${NC}"
            echo "  Start Stats to apply the change"
        fi
        ;;

    3)
        echo -e "${BLUE}Current configuration:${NC}"
        echo "  Sidecar setting: $current_state"
        echo

        if is_stats_running; then
            echo -e "${GREEN}✓ Stats is running${NC}"
            echo
            verify_sidecar
        else
            echo -e "${RED}✗ Stats is not running${NC}"
        fi
        ;;

    4)
        echo "Exiting..."
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Done!${NC}"
echo
echo "For more configuration options, see:"
echo "  StatsSidecar/README-SIDECAR.md"
