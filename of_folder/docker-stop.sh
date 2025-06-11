#!/bin/bash

# Rick's Agentic Social Media Architecture Docker Stopper ☠️
# This script handles graceful shutdown and cleanup

set -e

# Colors for Rick's style
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Rick's signature
echo -e "${RED}☠️  Rick's Agentic Social Media Architecture ☠️${NC}"
echo -e "${CYAN}🛑 Shutting down Docker containers...${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Parse command line arguments
CLEANUP=false
REMOVE_VOLUMES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --cleanup)
            CLEANUP=true
            shift
            ;;
        --remove-volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        --full)
            CLEANUP=true
            REMOVE_VOLUMES=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --cleanup         Remove containers and images"
            echo "  --remove-volumes  Remove data volumes (WARNING: This deletes all data!)"
            echo "  --full            Perform full cleanup (containers, images, and volumes)"
            echo "  -h, --help        Show this help message"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Stop all services
print_status "Stopping all services..."
docker-compose stop

if [ "$CLEANUP" = true ]; then
    print_status "Removing containers..."
    docker-compose down
    
    print_status "Removing unused images..."
    docker image prune -f
    
    # Remove project-specific images
    print_status "Removing project images..."
    docker rmi $(docker images | grep "rick-agentic\|of_folder" | awk '{print $3}') 2>/dev/null || true
fi

if [ "$REMOVE_VOLUMES" = true ]; then
    print_warning "Removing data volumes (this will delete all data)..."
    read -p "Are you sure you want to delete all data? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker volume prune -f
        print_status "Data volumes removed"
    else
        print_status "Volume removal cancelled"
    fi
fi

# Show final status
print_status "Checking remaining containers..."
RUNNING_CONTAINERS=$(docker ps --filter "name=rick-" --format "{{.Names}}" | wc -l)

if [ "$RUNNING_CONTAINERS" -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All Rick's containers have been stopped${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some containers are still running:${NC}"
    docker ps --filter "name=rick-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🎯 Rick's Agentic Social Media Architecture - Shutdown Complete ☠️${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$CLEANUP" = true ]; then
    echo -e "${GREEN}🧹 Cleanup completed${NC}"
fi

if [ "$REMOVE_VOLUMES" = true ]; then
    echo -e "${RED}💀 Data volumes removed${NC}"
fi

echo -e "${BLUE}To restart: ./docker-run.sh${NC}"
echo -e "${YELLOW}For help: ./docker-stop.sh --help${NC}"
echo ""
echo -e "${RED}☠️  Until next time... ☠️${NC}" 