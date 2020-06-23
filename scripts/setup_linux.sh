#! /bin/sh

# this script installs the necessary packages for cross-platform
# distribution building on a Debian/Ubuntu machine

# build for linux
sudo apt-get install --no-install-recommends -y \
  icnsutils graphicsmagick xz-utils
  
# on Fedora, this packages would be installed with:
# sudo dnf install libicns-utils graphicsmagick xz-libs
  
# build rpm
sudo apt-get install --no-install-recommends -y rpm
# build pacman
sudo apt-get install --no-install-recommends -y bsdtar

# build for windows
sudo add-apt-repository ppa:ubuntu-wine/ppa -y
sudo apt-get update
sudo apt-get install --no-install-recommends -y wine1.8
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb http://download.mono-project.com/repo/debian wheezy main" | sudo tee /etc/apt/sources.list.d/mono-xamarin.list
sudo apt-get update
sudo apt-get install --no-install-recommends -y mono-devel ca-certificates-mono

# build 32bit win from 64bit linux
sudo apt-get install --no-install-recommends -y gcc-multilib g++-multilib
