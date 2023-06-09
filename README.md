# Smart Contracts Simulator

Welcome to the Smart Contract Simulator repository!

This project simulates the following two process:
- claiming flow that enables rewards to be withdrawn from smart contract and
- purchasing services' flow that enables our customers to get weather services.

The simulator utilizes WeatherXM's smart contracts.

## Prerequisites
Before cloning and using this repository, please make sure you have the following prerequisites installed on your local machine:

- Docker Compose: This project utilizes Docker Compose to manage the development environment and its dependencies. Docker Compose allows for easy setup and configuration of the required services.

If you haven't installed Docker Compose yet, you can follow the installation instructions for your operating system provided in the Docker documentation: [Docker Compose Installation](https://docs.docker.com/compose/install/)

## Getting Started
To get started with this project, follow these steps:

1. Clone the repository to your local machine:

```
git clone https://github.com/WeatherXM/smart-contracts-simulator
```

2. Change into the project directory:

```
cd smart-contracts-simulator
```

3. Install the dependencies and add the smart-contracts:

```
make install
```

4. Build and run the project using Docker Compose:

```
make deploy
```

or if you want to rebuild the docker images: 

```
make deploy-clean
```

Both commands will start the necessary services and set up the development environment for the project. You should see the logs from the running services in the terminal.

5.  Setup the Metamask to work with the simulator using the following [instructions](./docs/metamask.md)

6. Access the application:

Once the project is running, you can access the application by opening a web browser and navigating to  `http://localhost:3000`.

7. Once the simulation is complete, you may cleanup the environment:

```
make clean
make clean-docker
```

**Additional Configuration**

- In case that the port `:3000` on your host is already allocated to another service, you can customize the configuration by modifying the docker-compose.yml file in order to expose the port `:3000` from the container named `frontend-node` to another port.
- If you encounter a nonce error when running the simulator then get into our [troubleshooting section](./docs/troubleshhoting.md)

## Contributing

Feel free to dive in! [Open](https://github.com/WeatherXM/smart-contracts-simulator/issues/new) an issue or submit a PR in order to make some proposal or submit a question.

## Acknowledgements

- [Hardhat](https://github.com/NomicFoundation/hardhat)
- [Etherjs](https://github.com/ethers-io/ethers.js/)
- [Metamask](https://metamask.io)
- [Docker Compose](https://docs.docker.com/compose/)
