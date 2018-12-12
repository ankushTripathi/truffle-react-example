import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(SimpleStorageContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  runExample = async () => {
    const { web3, accounts, instance } = this.state;

    const getMinnedTxPromise = (txHash) => {

      const AsyncTx = (resolve,reject) => {

          web3.eth.getTransactionReceipt(txHash, (err,receipt) => {

            if(err) reject(err);
            else if(receipt == null)

              setTimeout(
                () => AsyncTx(resolve,reject),
                500
              );
            else resolve(receipt);
          });
      };

      return new Promise(AsyncTx);
    };

    const tx = await instance.set.sendTransaction(999,{from : accounts[0]});
    console.log("tx created : ",tx);
    // txReceipt = await getMinnedTxPromise(tx);
    //console.log("tx minned !",txReceipt);
    const response = await instance.get.call({from : accounts[0]});
    console.log("the response is : ",response.toNumber());
    this.setState({storageValue : response.toNumber()});
  };
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}

export default App;
