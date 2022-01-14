import { useEffect, useMemo, useState } from "react";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";


const App = () => {
	
	const { connectWallet, address, error, provider } = useWeb3();
	console.log('Address: ', address);

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
		return (
			<div className="landing">
				<h1>👀 wallet connected, now what!</h1>
			</div>);	
	};

	return (
		<>
			{renderContainer()}
		</>
	);
};

export default App;
