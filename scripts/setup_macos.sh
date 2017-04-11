#! /bin/sh

# this script installs the necessary packages for cross-platform
# distribution building on a macOS machine
# it requires brew to be installed

# build for windows
brew install wine --without-x11
brew install mono

# build for linux
brew install gnu-tar graphicsmagick xz

# build rpm
brew install rpm
