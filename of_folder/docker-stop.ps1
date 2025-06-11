# Rick's Agentic Social Media Architecture Docker Stopper ☠️
# PowerShell version for Windows

param(
    [switch]$Cleanup,
    [switch]$RemoveVolumes,
    [switch]$Full,
    [switch]$Help
)

function Write-RickStatus {
    param($Message, $Color = 'Green')
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Write-RickWarning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-RickError {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

if ($Help) {
    Write-Host @"
Rick's Agentic Social Media Architecture - Docker Stop ☠️

Usage: .\docker-stop.ps1 [OPTIONS]

Options:
  -Cleanup         Remove containers and images
  -RemoveVolumes   Remove data volumes (WARNING: This deletes all data!)
  -Full            Perform full cleanup (containers, images, and volumes)
  -Help            Show this help message

Examples:
  .\docker-stop.ps1                    # Simple stop
  .\docker-stop.ps1 -Cleanup           # Stop and cleanup
  .\docker-stop.ps1 -Full              # Full cleanup including data

"@ -ForegroundColor Cyan
    exit 0
}

# Handle -Full parameter
if ($Full) {
    $Cleanup = $true
    $RemoveVolumes = $true
}

# Rick's signature
Write-Host @"
☠️  Rick's Agentic Social Media Architecture ☠️
🛑 Shutting down Docker containers...

"@ -ForegroundColor Red

# Stop all services
Write-RickStatus "Stopping all services..."
try {
    docker-compose stop
    if ($LASTEXITCODE -ne 0) {
        Write-RickWarning "Some services may have already been stopped"
    }
} catch {
    Write-RickWarning "Error stopping services: $_"
}

if ($Cleanup) {
    Write-RickStatus "Removing containers..."
    try {
        docker-compose down
        if ($LASTEXITCODE -ne 0) {
            Write-RickWarning "Error removing containers"
        }
    } catch {
        Write-RickWarning "Error during container removal: $_"
    }
    
    Write-RickStatus "Removing unused images..."
    try {
        docker image prune -f
    } catch {
        Write-RickWarning "Error pruning images: $_"
    }
    
    # Remove project-specific images
    Write-RickStatus "Removing project images..."
    try {
        $projectImages = docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | Where-Object { $_ -match "rick-agentic|of_folder" }
        if ($projectImages) {
            $imageIds = ($projectImages | ForEach-Object { ($_ -split '\s+')[1] }) | Where-Object { $_ -ne "ID" }
            if ($imageIds) {
                docker rmi $imageIds 2>$null
            }
        }
    } catch {
        Write-RickWarning "Error removing project images: $_"
    }
}

if ($RemoveVolumes) {
    Write-RickWarning "Removing data volumes (this will delete all data)..."
    $confirmation = Read-Host "Are you sure you want to delete all data? [y/N]"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        try {
            docker-compose down -v
            docker volume prune -f
            Write-RickStatus "Data volumes removed"
        } catch {
            Write-RickError "Error removing volumes: $_"
        }
    } else {
        Write-RickStatus "Volume removal cancelled"
    }
}

# Show final status
Write-RickStatus "Checking remaining containers..."
try {
    $runningContainers = docker ps --filter "name=rick-" --format "{{.Names}}" | Measure-Object | Select-Object -ExpandProperty Count
    
    if ($runningContainers -eq 0) {
        Write-Host "`n✅ All Rick's containers have been stopped" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Some containers are still running:" -ForegroundColor Yellow
        docker ps --filter "name=rick-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    }
} catch {
    Write-RickWarning "Error checking container status: $_"
}

Write-Host @"

════════════════════════════════════════════════════════════════════
🎯 Rick's Agentic Social Media Architecture - Shutdown Complete ☠️
════════════════════════════════════════════════════════════════════

"@ -ForegroundColor Magenta

if ($Cleanup) {
    Write-Host "🧹 Cleanup completed" -ForegroundColor Green
}

if ($RemoveVolumes) {
    Write-Host "💀 Data volumes removed" -ForegroundColor Red
}

Write-Host @"
To restart: .\docker-run.ps1
For help: .\docker-stop.ps1 -Help

☠️  Until next time... ☠️
"@ -ForegroundColor Blue 