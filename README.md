# Smart Contracts Simulator

## Prerequisites

```
npm i
```

## Run Simulator

1. Hardhat Compile (this steps creates cache,types and artifacts folders)

```
npx hardhat compile
```

2. Run a hardhat node (local blockchain)

```
npx hardhat node
```

3. Open another terminal and run scripts:

```
npm run deploy
npm run simulate
```

4. After running the scripts, deploy the Dapp:

```
cd frontend
```

and then:

```
npm run start
```