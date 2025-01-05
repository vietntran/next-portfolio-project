FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Install additional development tools
RUN apt-get update && apt-get install -y \
    less \
    man-db \
    zsh

# Install necessary global packages
RUN su node -c "npm install -g typescript ts-node prisma@latest"

USER node