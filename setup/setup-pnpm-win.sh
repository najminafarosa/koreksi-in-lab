echo  "==== START SETUP PNPM ===="

# Docker has specific installation instructions for each operating system.
# Please refer to the official documentation at https://docker.com/get-started/

# Pull the Node.js Docker image:
docker pull node:24-slim

# Create a Node.js container and start a Shell session:
docker run -it --rm --entrypoint sh node:24-slim

# Verify the Node.js version:
node -v # Should print "v24.22.0".

# Download and install pnpm:
corepack enable pnpm

# Verify pnpm version:
pnpm -v

echo "==== END SETUP PNPM ===="
