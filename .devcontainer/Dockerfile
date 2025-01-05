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

# Switch to node user for remaining operations
USER node

# Set zsh as default shell
SHELL ["/bin/zsh", "-c"]

# Add any custom zsh configurations if needed
RUN echo 'plugins=(git node npm)' >> ~/.zshrc

# Install necessary global packages
RUN npm install -g typescript ts-node prisma@latest
