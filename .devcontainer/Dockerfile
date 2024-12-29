FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Install basic development tools
RUN apt-get update && apt-get install -y \
    less \
    man-db \
    sudo \
    zsh \
    curl \
    git

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Install necessary global packages
RUN su node -c "npm install -g typescript ts-node prisma@latest"

# Set the default user
USER node