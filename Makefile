SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

BOLD = "$$(tput bold)"
GREEN = "$$(tput setaf 190)"
RED = "$$(tput setaf 1)"
CLEAR = "$$(tput sgr0)"


trace = @echo "$(BOLD)$(GREEN) > $(1)$(CLEAR)"
separator = @printf '%s\n' -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-

.PHONY: all install node deploy deploy-clean simulation dapp clean clean-docker

.PHONY: help
help: # `make help` generates a help message for each target that has a comment starting with ##
	@echo "Please use 'make <target>' where <target> is one of the following:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	$(separator)

.PHONY: install
install: clean
	$(call trace, Install Dependencies For Simulator)
	npm config set loglevel error && npm run setup
	$(call trace, Clone smart-contracts Repo)
	git clone --branch=develop git@github.com:WeatherXM/smart-contracts.git
	$(separator)

.PHONY: node
node: 
	$(call trace, Spin up Hardhat Node)
	npm run node
	$(separator)

.PHONY: deploy
deploy:
	$(call trace, Spin Up Docker Containers)
	docker-compose up

.PHONY: deploy-clean
deploy-clean:
	$(call trace, Spin Up Docker Containers [Rebuild Images])
	docker-compose up --build

.PHONY: simulation
simulation:
	$(call trace, Create remappings for smart contract imports)
	npm run createRemappings
	$(call trace, Compile Smart Contracts)
	npm run compile 
	$(call trace, Deploy Smart Contracts on local Hardhat node)
	npm run deploy 
	$(call trace, Deploy Simulation Script)
	npm run simulate
	$(separator)

.PHONY: dapp
dapp:
	$(call trace, Install Frontend Dependencies & Start Frontend)
	cd frontend && npm config set loglevel error && npm install && npm run start
	$(separator)

.PHONY: clean
clean:
	$(call trace, Clean All Local Unused Assets)
	rm -rf ./node_modules frontend/node_modules smart-contracts scripts/cache scripts/artifacts types 
	$(separator)

.PHONY: clean-docker
clean-docker:
	$(call trace, Remove Docker Containers)
	@-docker container rm hardhat-node frontend-node 
	$(call trace, Remove Docker Image For Frontend)
	@-docker rmi $$(docker images 'smart-contracts-simulator_frontend-node' -a -q)
	$(call trace, Remove Docker Image For Hardhat Node)
	@-docker rmi $$(docker images 'smart-contracts-simulator_hardhat-node' -a -q)
	$(separator)