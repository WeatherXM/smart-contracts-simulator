import fs from 'fs';

const createRemappings = async () => {
  const scRemappings = fs.readFileSync('./smart-contracts/remappings.txt', 'utf-8')
  const simulatorRemappings = scRemappings.replaceAll('lib/', '../lib/') + `src/interfaces=./interfaces\nlib/=smart-contracts/lib/`
  
  fs.writeFileSync('remappings.txt', simulatorRemappings, 'utf-8')
}

createRemappings()