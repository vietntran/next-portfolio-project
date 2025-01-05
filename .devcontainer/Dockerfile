FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Install additional development tools
RUN apt-get update && apt-get install -y \
    less \
    man-db \
    zsh

# Switch to node user for remaining operations
USER node

# Copy .zshrc file to node user's home
COPY --chown=node:node dotfiles/.zshrc /home/node/.zshrc

# Set zsh as default shell
SHELL ["/bin/zsh", "-c"]

# Install necessary global packages
RUN npm install -g typescript ts-node prisma@latest