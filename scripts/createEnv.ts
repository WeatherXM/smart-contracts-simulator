import fs from 'fs';

const createRemappings = async () => {
  const env = `
    ALCHEMY_API_KEY=xxxxxx
    FORKING=false
    REPORT_GAS=true
    MUMBAI_PRIVATE_KEY=xxxxx
    COINMARKETCAP_API=xxxxx
  `
  
  fs.writeFileSync('smart-contracts/.env', env, 'utf-8')
}

createRemappings()