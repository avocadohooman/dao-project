import { useEffect, useMemo, useState } from "react";
import config from './utils/config';
import { ethers } from "ethers";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";

// here we initiate the sdk on rinkeby
const sdk = new ThirdwebSDK('rinkeby');

// we can grab a reference to our ERC-1155 contract, where we get all our 
// members addresses
const bundleDropModule = sdk.getBundleDropModule(config.bundleDropAddress);
// we get the reference to our ERC-20 contract, where we can
// retrieve # tokens of each member
const tokenModule = sdk.getTokenModule(config.tokenModuleAddress);
// we get the reference to our vote module, where we can
// retrieve active proposals and let users vote
const voteModule = sdk.getVoteModule(config.voteModuleAddress);

const App = () => {
	
	const { connectWallet, address, error, provider } = useWeb3();
	console.log('Address: ', address);
	// The signer is required to sign transactions on the blockchain.
	// Without it we can only read data, not write.
	const signer = provider ? provider.getSigner() : undefined;
	// state variable to know whether use has our NFT
	const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
	// isClaiming lets us easily keep a loading state while the NFT is minting.
	const [isClaiming, setIsClaiming] = useState(false);
	// Holds the amount of token each member has in state.
	const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
	// The array holding all of our members addresses.
	const [memberAddresses, setMemberAddresses] = useState([]);
	// states for holding all proposals, loading state for isVoting 
	// and a state for has voted
	const [proposals, setProposals] = useState([]);
	const [isVoting, setIsVoting] = useState(false);
	const [hasVoted, setHasVoted] = useState(false);
	
	const shortenAddress = (str) => {
		return str.substring(0, 6) + "..." + str.substring(str.length - 4);
	};

	const renderContainer = () => {
		if (!address) {
			return (
				<div className="landing">
					<h1>Welcome to 🚀42DAO</h1>
					<button className="btn-hero" onClick={() => connectWallet("injected")}>
						Connect your wallet
					</button>
				</div>
			)
		}
		// This is the case where we have the user's address
		// which means they've connected their wallet to our site!
		console.log(memberList);
		if (hasClaimedNFT) {
			return (
				<div className="member-page">
					<h1>🚀42DAO Member Page</h1>
					<p>A DAO for seekers of the answer to life, universe and everything else.</p>
					<div>
						<div>
						<h2>Member List</h2>
						<table className="card">
							<thead>
							<tr>
								<th>Address</th>
								<th>Token Amount</th>
							</tr>
							</thead>
							<tbody>
							{memberList.map((member) => {
								return (
								<tr key={member.address}>
									<td>{shortenAddress(member.address)}</td>
									<td>{member.tokenAmount}</td>
								</tr>
								);
							})}
							</tbody>
						</table>
						</div>
					<div>
						<h2>Active Proposals</h2>
						<form
						onSubmit={async (e) => {
							e.preventDefault();
							e.stopPropagation();

							//before we do async things, we want to disable the button to prevent double clicks
							setIsVoting(true);

							// lets get the votes from the form for the values
							const votes = proposals.map((proposal) => {
							let voteResult = {
								proposalId: proposal.proposalId,
								//abstain by default
								vote: 2,
							};
							proposal.votes.forEach((vote) => {
								const elem = document.getElementById(
								proposal.proposalId + "-" + vote.type
								);

								if (elem.checked) {
								voteResult.vote = vote.type;
								return;
								}
							});
							return voteResult;
							});

							// first we need to make sure the user delegates their token to vote
							try {
							//we'll check if the wallet still needs to delegate their tokens before they can vote
							const delegation = await tokenModule.getDelegationOf(address);
							// if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
							if (delegation === ethers.constants.AddressZero) {
								//if they haven't delegated their tokens yet, we'll have them delegate them before voting
								await tokenModule.delegateTo(address);
							}
							// then we need to vote on the proposals
							try {
								await Promise.all(
								votes.map(async (vote) => {
									// before voting we first need to check whether the proposal is open for voting
									// we first need to get the latest state of the proposal
									const proposal = await voteModule.get(vote.proposalId);
									// then we check if the proposal is open for voting (state === 1 means it is open)
									if (proposal.state === 1) {
									// if it is open for voting, we'll vote on it
									return voteModule.vote(vote.proposalId, vote.vote);
									}
									// if the proposal is not open for voting we just return nothing, letting us continue
									return;
								})
								);
								try {
								// if any of the propsals are ready to be executed we'll need to execute them
								// a proposal is ready to be executed if it is in state 4
								await Promise.all(
									votes.map(async (vote) => {
									// we'll first get the latest state of the proposal again, since we may have just voted before
									const proposal = await voteModule.get(
										vote.proposalId
									);

									//if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
									if (proposal.state === 4) {
										return voteModule.execute(vote.proposalId);
									}
									})
								);
								// if we get here that means we successfully voted, so let's set the "hasVoted" state to true
								setHasVoted(true);
								// and log out a success message
								console.log("successfully voted");
								} catch (err) {
								console.error("failed to execute votes", err);
								}
							} catch (err) {
								console.error("failed to vote", err);
							}
							} catch (err) {
								console.error("failed to delegate tokens");
							} finally {
								// in *either* case we need to set the isVoting state to false to enable the button again
								setIsVoting(false);
							}
						}}
						>
						{proposals.map((proposal, index) => (
							<div key={proposal.proposalId} className="card">
							<h5>{proposal.description}</h5>
							<div>
								{proposal.votes.map((vote) => (
								<div key={vote.type}>
									<input
									type="radio"
									id={proposal.proposalId + "-" + vote.type}
									name={proposal.proposalId}
									value={vote.type}
									//default the "abstain" vote to chedked
									defaultChecked={vote.type === 2}
									/>
									<label htmlFor={proposal.proposalId + "-" + vote.type}>
									{vote.label}
									</label>
								</div>
								))}
							</div>
							</div>
						))}
						<button disabled={isVoting || hasVoted} type="submit">
							{isVoting
							? "Voting..."
							: hasVoted
								? "You Already Voted"
								: "Submit Votes"}
						</button>
						<small>
							This will trigger multiple transactions that you will need to
							sign.
						</small>
						</form>
					</div>
					</div>
				</div>
			  );
		}
		return (
			<div className="mint-nft">
				<h1>Mint your free 🍪DAO Membership NFT</h1>
				<button
					onClick={() => mintNFT()}
					disabled={isClaiming}
				>
					{isClaiming ? "🍪 🍪 Minting... 🍪 🍪" : "Mint 🍪 your NFT (free)"}
				</button>
			</div>);	
	};

	useEffect(() => {
		if (signer) {
			// We pass the signer to the sdk, which allows us to interact with 
			// the deployed contract
			sdk.setProviderOrSigner(signer);
		}
	}, [signer])

	useEffect(() => {
		if (!address) {
			return;
		}

		console.log('getting NFT..');
		return bundleDropModule
			.balanceOf(address, "0")
			.then((balance) => {
				if (balance.gt(0)) {
					setHasClaimedNFT(true);
					console.log("🌟 this user has a membership NFT!");
				} else {	
					console.log("😭 this user doesn't have a membership NFT.");
				}
			})
			.catch((error) => {
				console.log('failed to fetch nft balance', error);
			})
	}, [address]);

	useEffect(() => {
		if (!hasClaimedNFT) {
			return ;
		}
		bundleDropModule
			.getAllClaimerAddresses("0")
			.then((addresses) => {
				console.log("🚀 Members addresses", addresses)
				setMemberAddresses(addresses);
			})
			.catch((error) => {
				console.error("failed to get member list", error);
			});
			
		tokenModule
			.getAllHolderBalances()
			.then((amounts) => {
				console.log("👜 Amounts", amounts)
				setMemberTokenAmounts(amounts);		  
			})
			.catch((error) => {
				console.error("failed to get token amounts", error);
			});
		
		voteModule
			.getAll()
			.then(proposals => {
				setProposals(proposals);
				console.log("🌈 Proposals:", proposals)
			})
			.catch(error => {
				console.log('❌ failed to get all proposals', error);
			});
	}, [hasClaimedNFT]);

	useEffect(() => {
		if (!hasClaimedNFT) {
			return ;
		}
		if (!proposals.length) {
			return ;
		}

		voteModule
			.hasVoted(proposals[0].proposalId, address)
			.then((hasVoted) => {
				if (hasVoted) {
					console.log("🥵 User has already voted");
					setHasVoted(true);
				} else {
					console.log("🙂 User has not voted yet");
					setHasVoted(false);
				}
			})
			.catch(error => {
				console.log('❌ failed to check if user has voted', error);
			});
	}, [hasClaimedNFT, proposals, address]);

	const memberList = useMemo(() => {
		return memberAddresses.map((address) => {
			return {
				address,
				tokenAmount: ethers.utils.formatUnits(
					memberTokenAmounts[address] || 0,
					18,
				),
			};
		});
	}, [memberTokenAmounts, memberAddresses]);

	const mintNFT = () => {
		setIsClaiming(true);
		// call bundleDeopModule.claim("0", 1) to mint nft to user's waller
		bundleDropModule
			.claim("0", 1)
			.then(() => {
				setHasClaimedNFT(true);
				console.log(
					`🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
				);
			})
			.catch((error) => {
				console.log('failed to claim', error);	
			})
			.finally(() => {
				setIsClaiming(false);
			});
	}

	console.log('error', error);
	if (error && error.name === "UnsupportedChainIdError") {
		return (
			<div className="unsupported-network">
				<h2>Please connect to Rinkeby</h2>
				<p>
					This dapp only works on the Rinkeby network, please switch networks
					in your connected wallet.
				</p>
			</div>
		);
	}

	return (
		<>
			{renderContainer()}
		</>
	);
};

export default App;
