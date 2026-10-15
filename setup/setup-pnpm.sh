
echo "==== START PROCCESS SETUP NODE ===="

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 24

# Verify the Node.js version:
node -v # Should print "v24.22.0".

# Download and install pnpm:
corepack enable pnpm

# Verify pnpm version:
pnpm -v

echo "===== END PROCESSS SETUP NODE ======"
