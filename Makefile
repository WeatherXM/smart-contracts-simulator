.DEFAULT_GOAL := help

help: # `make help` generates a help message for each target that has a comment starting with ##
	@echo "Please use 'make <target>' where <target> is one of the following:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install source dependencies
	npm run setup
	git clone --branch=develop git@github.com:WeatherXM/smart-contracts.git

node: ## Spin up a node for the local blockchain
	npm run node

simulation:
	npm run compile
	npm run deploy
	npm run simulate

dapp:
	cd frontend && npm install && npm run start

clean:
	rm -rf ./node_modules frontend/node_modules smart-contracts scripts/cache scripts/artifacts types 

clean-docker:
	-docker container rm hardhat-node frontend-node
	-docker rmi $$(docker images 'smart-contracts-simulator_frontend-node' -a -q)
	-docker rmi $$(docker images 'smart-contracts-simulator_hardhat-node' -a -q)
