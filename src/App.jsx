import { useEffect, useMemo, useState } from "react";
import config from './utils/config';

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// here we initiate the sdk on rinkeby
const sdk = new ThirdwebSDK('rinkeby');

// we can grab a reference to our ERC-1155 contract
const bundleDropModule = sdk.getBundleDropModule(config.bundleDropAddress);

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

	const renderContainer = () => {
		if (!address) {
			return (
				<div className="landing">
					<h1>Welcome to 42DAO</h1>
					<button className="btn-hero" onClick={() => connectWallet("injected")}>
						Connect your wallet
					</button>
				</div>
			)
		}
		// This is the case where we have the user's address
		// which means they've connected their wallet to our site!
		if (hasClaimedNFT) {
			return (
				<div className="member-page">
					<h1>🍪DAO Member Page</h1>
					<p>Congratulations on being a member</p>
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

	return (
		<>
			{renderContainer()}
		</>
	);
};

export default App;
