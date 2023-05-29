.DEFAULT_GOAL := help

help: # `make help` generates a help message for each target that has a comment starting with ##
	@echo "Please use 'make <target>' where <target> is one of the following:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install source dependencies
	npm run setup

node: ## Spin up a node for the local blockchain
	npm run node

compile: ## Compile smart contracts
	npm run compile

deploy: ## Deploy smart contracts on local blockchain
	npm run deploy

simulate: ## Deploy initial conditions (root hash, etc) for simulation
	npm run simulate