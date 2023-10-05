/* eslint-disable */ 
import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
import { getAllocatedRewards } from "../contracts/scripts.js";
// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import config from "../contracts/config.json";
import proofs from "../contracts/proofs.json";
//{TokenArtifact, contractAddress}
// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { ChooseService } from "./ChooseService";
import { ValidateProofOfBurn } from "./ValidateProofOfBurn.js"
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { PurchasedServices } from "./PurchasedServices";

// This is the Hardhat Network id that we set in our hardhat.config.js.
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = "1337";

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

const override = {
	display: "block",
	margin: "0 auto",
	borderColor: "blue",
  };
// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
	constructor(props) {
		super(props);
		this.state = { value: "" };
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleConfirmPurchase = this.handleConfirmPurchase.bind(this);
		this.state = { hasError: false }
		// We store multiple things in Dapp's state.
		// You don't need to follow this pattern, but it's an useful example.
		this.initialState = {
			// The info of the token (i.e. It's Name and symbol)
			tokenData: undefined,
			// The user's address and balance
			selectedAddress: undefined,
			balance: undefined,
			allowance: undefined,
			totalUSD: undefined,
			proofOfBurnAmount: undefined,
			proofOfBurnServiceID: undefined,
			proofOfBurnPrice: undefined,
			allocatedRewards: undefined,
			// The ID about transactions being sent, and any possible error with them
			txBeingSent: undefined,
			transactionError: undefined,
			networkError: undefined,
			purchaseOrder: {serviceID: undefined, wxmAmount: undefined, usdAmount: undefined, service: undefined, amount: undefined, period: undefined},
			loading: false,
			error: undefined,
			burnForServiceHash: undefined,
			validatedProofOfBurn: false,
			purchaseOrderApproval: false,
			claimedAmount: undefined,
			claimedAddress: undefined,
			claimedHash: undefined,
			purchasedServices: [],
			claimWaitPeriod: undefined
		};

		this.state = this.initialState;
	}

	render() {
		// Ethereum wallets inject the window.ethereum object. If it hasn't been
		// injected, we instruct the user to install MetaMask.
		if (window.ethereum === undefined) {
			return <NoWalletDetected />;
		}

		// The next thing we need to do, is to ask the user to connect their wallet.
		// When the wallet gets connected, we are going to save the users's address
		// in the component's state. So, if it hasn't been saved yet, we have
		// to show the ConnectWallet component.
		//
		// Note that we pass it a callback that is going to be called when the user
		// clicks a button. This callback just calls the _connectWallet method.
		if (!this.state.selectedAddress) {
			return (
				<ConnectWallet
					connectWallet={() => this._connectWallet()}
					networkError={this.state.networkError}
					dismiss={() => this._dismissNetworkError()}
				/>
			);
		}

		// If the token data or the user's balance hasn't loaded yet, we show
		// a loading component.
		if (!this.state.tokenData || !this.state.balance || !this.state.allowance) {
			return <Loading />;
		}

		// If everything is loaded, we render the application.
		return (
			<div className="container p-4">
				<div className="row">
					<div className="col-12">
						<h1>
							{this.state.tokenData.name} Demo
						</h1>
						<p>
							Welcome <b>{this.state.selectedAddress}</b>, you have:{" "}
						</p>
						<p>
							<b>
								{this.state.balance.toString()} {this.state.tokenData.symbol}{" "}
								BALANCE
							</b>
						</p>
						<p>
							<b>
								{this.state.allocatedRewards ? this.state.allocatedRewards.toString() : '...'}{" "}
								{this.state.tokenData.symbol} ALLOCATED REWARDS
							</b>
						</p>
						{/* <p>
							<b>
								{this.state.allowance.toString()}{" "}
								{this.state.tokenData.symbol} APPROVED TOKENS TO <b>BurnPool</b>
							</b>
						</p> */}
						<p>
							{/* <b>
            		{this.state.allowance.toString()} {this.state.tokenData.symbol} Approved
						</b> */}
						</p>
						<form onSubmit={this.handleSubmit}>
							<label>
								Amount to Claim:
								<input
									type="text"
									value={this.state.value}
									onChange={this.handleChange}
								/>
							</label>
							<br></br>
							<input className="btn btn-primary" type="submit" value="Claim" />
						</form>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						{/* 						
              If the user has no tokens, we don't show the Transfer form
            */}
				{/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
						{this.state.claimedAmount > 0 && (
							
							<div>
								<hr />
								<label><h3>Claiming Transaction: Completed</h3></label>
								<p>
									<b>HASH: {this.state.claimedHash}</b>
								</p>
								<p>
									<b>CLAIMED ADDRESS: {this.state.claimedAddress}</b>
								</p>
								<p>
									<b>CLAIMED AMOUNT: {this.state.claimedAmount}</b>
								</p>

							</div>
						)}
					</div>
				</div>
				<hr />

				<div className="row">
					<div className="col-12">
						{/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
						{this.state.txBeingSent && (
							<WaitingForTransactionMessage txHash={this.state.txBeingSent} />
						)}

						{/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
						{this.state.transactionError && (
							<TransactionErrorMessage
								message={this._getRpcErrorMessage(this.state.transactionError)}
								dismiss={() => this._dismissTransactionError()}
							/>
						)}
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						{/* 						
              If the user has no tokens, we don't show the Transfer form
            */}


						{/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
						{this.state.balance > 0 && (
							<div>
								<ChooseService
									requestService={(service, period, vpu) =>
										this._requestService(service, period, vpu)
									}
									tokenSymbol={this.state.tokenData.symbol}
									services={this._services}
								/>
							</div>
						)}
					</div>
				</div>
				<br></br>
				<div className="row">
					<div className="col-12">
						{/* 						
              If the user has no tokens, we don't show the Transfer form
            */}
				{/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
						{this.state.purchaseOrder.amount > 0 && (
							
							<div>
								<hr />
								<label><h3>2. Purchase Order Details</h3></label>
								<p>
									PURCHASE ORDER IDENTIFIER: <b>{this.state.purchaseOrder.serviceID}</b>
								</p>
								<p>
									AMOUNT: <b>{this.state.purchaseOrder.amount}</b>
								</p>
								<p>
									
									USD COST FOR {this.state.purchaseOrder.amount} DAYS OF {this.state.purchaseOrder.service}: <b>{this.state.purchaseOrder.usdAmount} $</b>
								</p>
								<p>
									WXM/USD Price from Oracle: <b>{this.state.purchaseOrder.wxmPrice}</b>
								</p>
								<p>
									
									WXM COST FOR {this.state.purchaseOrder.amount} DAYS OF {this.state.purchaseOrder.service}: <b>{this.state.purchaseOrder.usdAmount}$ / {this.state.purchaseOrder.wxmPrice} = {this.state.purchaseOrder.wxmAmount} WXM</b>
									
								</p>
								<form onSubmit={this.handleConfirmPurchase}>
									<input className="btn btn-primary mr-6" type="submit" value={`Purchase with WXM (${this.state.purchaseOrder.wxmAmount} WXM)`} />
									<input className="btn btn-primary" type="submit" value={`Purchase with USDT (${this.state.purchaseOrder.usdAmount} USDT)`} />
								</form>

							</div>
						)}
					</div>
				</div>
				<br></br>
				
				<div className="row">
					<div className="col-12">
					

						{/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
						{this.state.burnForServiceHash && !this.state.loading && (
							<div>
								<hr />
								<label><h3>3. Burning Transaction (Proof-of-Burn): Completed</h3></label>
								<p>
									HASH: <b>{this.state.burnForServiceHash}</b>
								</p>
								<p>
									AMOUNT: <b>{this.state.proofOfBurnAmount} WXM</b>
								</p>
								<p>
									PURCHASE ORDER IDENTIFIER: <b>{this.state.proofOfBurnServiceID}</b>
								</p>
								<p>
									WXM PRICE: <b>{this.state.proofOfBurnPrice}</b>
								</p>
							</div>
						)}
						{JSON.stringify(this.state.proofOfBurnServiceID) !== "" && (
							<div></div>
						)}
					</div>
					</div>
					
					<div className="row">
						<div className="col-12">
							{/* 						
				If the user has no tokens, we don't show the Transfer form
				*/}


							{/*
				This component displays a form that the user can use to send a 
				transaction and transfer some tokens.
				The component doesn't have logic, it just calls the transferTokens
				callback.
				*/}
							{this.state.burnForServiceHash > 0 && !this.state.loading && (
								<div>
									<hr />
									<ValidateProofOfBurn
										validateProofOfBurn={(identifier, hash) =>
											this._validateProofOfBurn(identifier, hash)
										}
										tokenSymbol={this.state.tokenData.symbol}
									/>
								</div>
							)}
						</div>
					</div>
					<div className="row">
						<div className="col-12">
						{this.state.validatedProofOfBurn && !this.state.loading && (
										<div>
											<hr />
											<h3>
												<b>
													SUCCESS!!!
												</b>
											</h3>
										</div>
							)}
						</div>
					</div>
					<div className="row">
					`<div className="col-12">
					

						{/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
						{this.state.hasError && (
							<div>
							<hr />
							<p>Something went wrong 😭</p>
							{this.state.error.message && <span>Here's the error: {this.state.error.message}</span>}
						  </div>
						)}
					</div>
					</div>
					<PurchasedServices services={this.state.purchasedServices}/>
					<div className="sweet-loading" >
						<ClipLoader
						cssOverride={override}
						size={150}
						color={"#123abc"}
						loading={this.state.loading}
						speedMultiplier={0.8}
						aria-label="Loading Spinner"
						data-testid="loader"
						/>
					</div>
				</div>
		);
	}

	componentWillUnmount() {
		// We poll the user's balance, so we have to stop doing that when Dapp
		// gets unmounted
		this._stopPollingData();
	}

	async _fetchAllServices() {
		const serviceCount = Number((await this._servicePool.getServiceCount()).toString());

		const allServices = [];

		for(let i = 0 ; i < serviceCount ; i++) {
			const serviceId = await this._servicePool.getServiceAtIndex(i);
			const service = await this._servicePool.getServiceByID(serviceId);
			allServices.push({
				...service,
				serviceId
			})
		}
		
		this._services = allServices;
	}

	async _fetchPurchasedServices(address) {

		return [];

		// if (!this.state.selectedAddress) {
		// 	const res = await fetch(`http://localhost:3000/api/v1/service-purchased?buyer=${address ? address : this.state.selectedAddress}`);
		// 	const purchasedServices = await res.json()

		// 	this.setState({
		// 		purchasedServices
		// 	})
		// }
	}

	async _connectWallet() {
		// This method is run when the user clicks the Connect. It connects the
		// dapp to the user's wallet, and initializes it.

		// To connect to the user's wallet, we have to run this method.
		// It returns a promise that will resolve to the user's address.
		const [selectedAddress] = await window.ethereum.request({
			method: "eth_requestAccounts",
		});

		// Once we have the address, we can initialize the application.

		// First we check the network
		if (!this._checkNetwork()) {
			return;
		}

		this._initialize(selectedAddress);

		// We reinitialize it whenever the user changes their account.
		window.ethereum.on("accountsChanged", ([newAddress]) => {
			this._stopPollingData();
			// `accountsChanged` event can be triggered with an undefined newAddress.
			// This happens when the user removes the Dapp from the "Connected
			// list of sites allowed access to your addresses" (Metamask > Settings > Connections)
			// To avoid errors, we reset the dapp state
			if (newAddress === undefined) {
				return this._resetState();
			}

			this._initialize(newAddress);
		});

		// We reset the dapp state if the network is changed
		window.ethereum.on("chainChanged", ([networkId]) => {
			this._stopPollingData();
			this._resetState();
		});
	}

	async _initialize(userAddress) {
		// This method initializes the dapp

		// We first store the user's address in the component's state
		this.setState({
			selectedAddress: userAddress,
		});

		// Then, we initialize ethers, fetch the token's data, and start polling
		// for the user's balance.

		// Fetching the token data and the user's balance are specific to this
		// sample project, but you can reuse the same initialization pattern.
		await this._fetchPurchasedServices(userAddress)
		await this._initializeEthers();
		await this._getTokenData();
		await this._startPollingData();
		await this._updateAllocatedRewards();
		await this._fetchAllServices();
	}

	async _initializeEthers() {
		// We first initialize ethers by creating a provider using window.ethereum
		this._provider = new ethers.providers.Web3Provider(window.ethereum);

		// Then, we initialize the contract using that provider and the token's
		// artifact. You can do this same thing with your contracts.
		this._token = new ethers.Contract(
			config.tokenAddress,
			config.tokenArtifact.abi,
			this._provider.getSigner(0)
		);
		this._usdt = new ethers.Contract(
			config.usdtAddress,
			config.tokenArtifact.abi,
			this._provider.getSigner(0)
		);
		this._rewardPool = new ethers.Contract(
			config.rewardPoolAddress,
			config.rewardPoolArtifact.abi,
			this._provider.getSigner(0)
		);
		this._servicePool = new ethers.Contract(
			config.servicePoolAddress,
			config.servicePoolArtifact.abi,
			this._provider.getSigner(0)
		);
	}

	// The next two methods are needed to start and stop polling data. While
	// the data being polled here is specific to this example, you can use this
	// pattern to read any data from your contracts.
	//
	// Note that if you don't need it to update in near real time, you probably
	// don't need to poll it. If that's the case, you can just fetch it when you
	// initialize the app, as we do with the token data.
	_startPollingData() {
		this._pollDataInterval = setInterval(() => this._updateBalance(), 2000);
		this._pollDataInterval = setInterval(() => this._updateAllowance(), 2000);
		this._pollDataInterval = setInterval(
			() => this._updateAllocatedRewards(),
			2000
		);

		// We run it once immediately so we don't have to wait for it
		this._updateBalance();
		this._updateAllowance();
		this._updateAllocatedRewards();
		this._updateClaimedReceipt();
	}

	_stopPollingData() {
		clearInterval(this._pollDataInterval);
		this._pollDataInterval = undefined;
	}

	// The next two methods just read from the contract and store the results
	// in the component state.
	async _getTokenData() {
		const name = await this._token.name();
		const symbol = await this._token.symbol();

		this.setState({ tokenData: { name, symbol } });
	}

	async _updateBalance() {
		const balanceWEI = await this._token.balanceOf(this.state.selectedAddress);
		const balance = ethers.utils.formatUnits(balanceWEI.toString(), "ether");
		this.setState({ balance });
	}

	async _updateAllowance() {
		const allowanceWEI = await this._token.allowance(
			this.state.selectedAddress,
			config.servicePoolAddress
		);
		const allowance = ethers.utils.formatUnits(
			allowanceWEI.toString(),
			"ether"
		);
		this.setState({ allowance });
	}

	async _updateClaimedReceipt() {
		this._rewardPool.on(
			"Claimed",
			(account, amount, event) => {
				let ClaimedEvent = {
					account: account,
					amount: ethers.utils.formatUnits(amount.toString(), "ether")
				};
				const claimedAmount = ClaimedEvent.amount;
				const claimedAddress = ClaimedEvent.account;
				this.state.loading = false;
				this.setState({
					claimedAmount,
					claimedAddress,
				});
				
			}
		);
	}

	async _captureClaimedEvent() {
		this._rewardPool.on(
			"Claimed",
			(from, amount, event) => {
				this.state.loading = false;
			}
		);
	}

	async _updateAllocatedRewards() {
		try{
			const latestCycle = await this._rewardPool.cycle();

			const allocatedRewards = await getAllocatedRewards(
				latestCycle,
				ethers.utils.getAddress(this.state.selectedAddress),
				this._provider
			);
			this.setState({ allocatedRewards });
		}catch(err){
			this.state.loading = false;
			this.state.hasError = true;
			this.state.error = err;
		}
		
	}

	canClaimNow() {
		const claimUnlockTime = this.getClaimUnlockTime()
		const now = Math.ceil(Date.now() / 1000)

		return claimUnlockTime < now;
	}

	hasAvailableToClaim() {
		if(this.state.requestedClaimAmount) {
			const availableAmount = Number(this.state.requestedClaimAmount.toString())

			return availableAmount > 0
		}

		return false
	}

	getTimeToClaim() {
		const claimUnlockTime = this.getClaimUnlockTime()
		const now = Math.ceil(Date.now() / 1000)

		return claimUnlockTime - now;
	}

	handleChange(event) {
		this.setState({ value: event.target.value });
	}

	handleSubmit(event) {
		this.state.loading = true;
		alert("The submitted amount to claim " + this.state.value);
		this._claim(this.state.value);
		event.preventDefault();
	}

	handleConfirmPurchase(event) {
		this.confirmPurchase(event);
		event.preventDefault();
	}

	
	async _claim(amount) {
		const latestCycle = await this._rewardPool.cycle();
		this.state.hasError = false;
		try{
			let transaction = await this._rewardPool.claim(
				ethers.utils.parseEther(String(amount)),
				ethers.utils.parseEther(
					proofs[ethers.utils.getAddress(this.state.selectedAddress)]
						.cumulativeAmount
				),
				Number(latestCycle.toString()) - 1,
				proofs[ethers.utils.getAddress(this.state.selectedAddress)].proof
			);
			this.state.claimedHash = transaction.hash;
		}catch(err){
			this.state.loading = false;
			this.state.hasError = true;
			this.state.error = err;
		}
		
	}
	async _requestService(service, amount, vpu) {
		this.state.hasError = false;
		this.state.purchaseOrder.amount = Number(amount);
		this.state.purchaseOrder.service = service;
		
		this.state.purchaseOrder.wxmPrice = 10;
		
		this.state.purchaseOrder.usdAmount = (Number(amount) * Number(ethers.utils.formatEther(vpu).toString())).toFixed(1);
		this.state.purchaseOrder.wxmAmount = Number(this.state.purchaseOrder.amount / this.state.purchaseOrder.wxmPrice).toFixed(1);
		this.state.purchaseOrder.serviceID = service
		this.state.purchaseOrderApproval = true
	}

	async confirmPurchase(event) {
		this.state.hasError = false;
		try{
			this.state.loading = true;
			// await this._token.approve(
			// 	config.servicePoolAddress,
			// 	ethers.utils.parseEther(String(this.state.purchaseOrder.wxmAmount))
			// );
			//talk to the billing system

			let transaction

			if(event.nativeEvent.submitter.value.startsWith('Purchase with WXM')) {
				await (await this._token.approve(
					config.servicePoolAddress,
					ethers.utils.parseEther(String(this.state.purchaseOrder.wxmAmount))
				)).wait()
				transaction = await this._servicePool['purchaseService(uint256,uint256,string)'](
					ethers.utils.parseEther(String(this.state.purchaseOrder.wxmAmount)),
					this.state.purchaseOrder.amount,
					this.state.purchaseOrder.serviceID
				);
			} else if(event.nativeEvent.submitter.value.startsWith('Purchase with USDT')) {
				await (await this._usdt.approve(
					config.servicePoolAddress,
					ethers.utils.parseEther(String(this.state.purchaseOrder.amount))
				)).wait();
				transaction = await this._servicePool['purchaseService(uint256,string)'](
					this.state.purchaseOrder.amount,
					this.state.purchaseOrder.serviceID
				);
			}

			this.state.burnForServiceHash = transaction.hash
		}catch(err){
			this.state.loading = false;
			this.state.hasError = true;
			this.state.error = err;
		}
		
	}

	async _validateProofOfBurn(identifier, hash) {
		this.state.hasError = false;
		this.state.loading = true;
		let receipt = await this._provider.getTransactionReceipt(hash);
		const signature = 'BurnedForService(address,uint256,int,uint,string)';
		let fragment = ethers.utils.EventFragment.from(signature)
		let emptyIface = new ethers.utils.Interface([])
		let topicHash = emptyIface.getEventTopic(fragment)
		const topic = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature))
		receipt.logs.map(log => {
			if(log.topics[0] === topicHash){				
				const result = ethers.utils.defaultAbiCoder.decode(['address', 'uint256', 'int', 'uint', 'string'],log.data)
				if(Number(ethers.utils.formatUnits(result[1].toString(), "ether")*ethers.utils.formatUnits(result[2].toString(), "ether")).toFixed(1)==this.state.purchaseOrder.usdAmount 
				&& this.state.purchaseOrder.serviceID==result[4].toString()){
					this.state.loading = false;
					this.state.validatedProofOfBurn = true;
				}
			}
		})		
	}

	async _transferTokens(to, amount) {
		// Sending a transaction is a complex operation:
		//   - The user can reject it
		//   - It can fail before reaching the ethereum network (i.e. if the user
		//     doesn't have ETH for paying for the tx's gas)
		//   - It has to be mined, so it isn't immediately confirmed.
		//     Note that some testing networks, like Hardhat Network, do mine
		//     transactions immediately, but your dapp should be prepared for
		//     other networks.
		//   - It can fail once mined.
		//
		// This method handles all of those things, so keep reading to learn how to
		// do it.

		try {
			// If a transaction fails, we save that error in the component's state.
			// We only save one such error, so before sending a second transaction, we
			// clear it.
			this._dismissTransactionError();

			// We send the transaction, and save its hash in the Dapp's state. This
			// way we can indicate that we are waiting for it to be mined.
			const tx = await this._token.transfer(to, amount);
			this.setState({ txBeingSent: tx.hash });

			// We use .wait() to wait for the transaction to be mined. This method
			// returns the transaction's receipt.
			const receipt = await tx.wait();

			// The receipt, contains a status flag, which is 0 to indicate an error.
			if (receipt.status === 0) {
				// We can't know the exact error that made the transaction fail when it
				// was mined, so we throw this generic one.
				throw new Error("Transaction failed");
			}

			// If we got here, the transaction was successful, so you may want to
			// update your state. Here, we update the user's balance.
			await this._updateBalance();
		} catch (error) {
			// We check the error code to see if this error was produced because the
			// user rejected a tx. If that's the case, we do nothing.
			if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
				return;
			}

			// Other errors are logged and stored in the Dapp's state. This is used to
			// show them to the user, and for debugging.
			console.error(error);
			this.setState({ transactionError: error });
		} finally {
			// If we leave the try/catch, we aren't sending a tx anymore, so we clear
			// this part of the state.
			this.setState({ txBeingSent: undefined });
		}
	}

	// This method just clears part of the state.
	_dismissTransactionError() {
		this.setState({ transactionError: undefined });
	}

	// This method just clears part of the state.
	_dismissNetworkError() {
		this.setState({ networkError: undefined });
	}

	// This is an utility method that turns an RPC error into a human readable
	// message.
	_getRpcErrorMessage(error) {
		if (error.data) {
			return error.data.message;
		}

		return error.message;
	}

	// This method resets the state
	_resetState() {
		this.setState(this.initialState);
	}

	// This method checks if Metamask selected network is Localhost:8545
	_checkNetwork() {
		if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
			return true;
		}

		this.setState({
			networkError: "Please connect Metamask to Localhost:8545",
		});

		return false;
	}
}
