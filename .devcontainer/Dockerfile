FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Install additional development tools
RUN apt-get update && apt-get install -y \
    less \
    man-db \
    zsh && \
    su node -c "npm install -g prisma@latest" && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

USER node