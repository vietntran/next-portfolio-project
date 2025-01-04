#!/bin/bash

# Copy .zshrc to home directory
cp /workspace/.devcontainer/dotfiles/.zshrc ~/.zshrc

# Source the file
source ~/.zshrc

# Change default shell to zsh
chsh -s $(which zsh)