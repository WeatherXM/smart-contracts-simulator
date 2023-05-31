SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

BOLD = "$$(tput bold)"
GREEN = "$$(tput setaf 190)"
RED = "$$(tput setaf 1)"
CLEAR = "$$(tput sgr0)"


trace = @echo "$(BOLD)$(GREEN) > $(1)$(CLEAR)"
separator = @printf '%s\n' -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
parse_error = sed -e "s/Error/$(BOLD)$(RED)Error$(CLEAR)/g"
# wrap = $(call trace, "$(1)"); $(2) 2>&1 | $(parse_error); $(separator)

.PHONY: all install node simulation dapp clean clean-docker

.PHONY: help
help: # `make help` generates a help message for each target that has a comment starting with ##
	@echo "Please use 'make <target>' where <target> is one of the following:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	$(separator)

.PHONY: install
install:
	$(call trace, Install Dependencies For Simulator)
	npm run setup
	$(call trace, Clone smart-contracts Repo)
	git clone --branch=develop git@github.com:WeatherXM/smart-contracts.git
	$(separator)

.PHONY: node
node: 
	$(call trace, Spin up Hardhat Node)
	npm run node
	$(separator)

.PHONY: simulation
simulation:
	$(call trace, Compile Smart Contracts)
	npm run compile 2>&1 | $(parse_error)
	$(call trace, Deploy Smart Contracts on local Hardhat node)
	npm run deploy 2>&1 | $(parse_error)
	$(call trace, Deploy Simulation Script)
	npm run simulate 2>&1 | $(parse_error)
	$(separator)

.PHONY: dapp
dapp:
	$(call trace, Install Frontend Dependencies & Start Frontend)
	cd frontend && npm install && npm run start
	$(separator)

.PHONY: clean
clean:
	$(call trace, Clean All Local Unused Assets)
	rm -rf ./node_modules frontend/node_modules smart-contracts scripts/cache scripts/artifacts types 
	$(separator)

.PHONY: clean-docker
clean-docker:
	$(call trace, Remove Docker Containers)
	@-docker container rm hardhat-node frontend-node 2>&1 | $(parse_error)
	$(call trace, Remove Docker Image For Frontend)
	@-docker rmi $$(docker images 'smart-contracts-simulator_frontend-node' -a -q) 2>&1 | $(parse_error)
	$(call trace, Remove Docker Image For Hardhat Node)
	@-docker rmi $$(docker images 'smart-contracts-simulator_hardhat-node' -a -q) 2>&1 | $(parse_error)
	$(separator)