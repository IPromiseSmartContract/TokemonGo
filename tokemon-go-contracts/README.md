# Hardhat

git clone https://github.com/IPromiseSmartContract/TokemonGo.git
cd TokemonGo
cp .env.example .env
# After copying the .env.example file to .env, you'll need to fill in the following fields in the .env file:
# SEP_URL = "" - The URL for your Sepolia Endpoint.
# SEPOLIA_PRIVATE_KEY="" - Your private key for the Sepolia network wallet.
# ETHER_SCAN_API_KEY="" - Your API key for Etherscan,.
# to install packages
pnpm install -r
pnpm -w run test 
