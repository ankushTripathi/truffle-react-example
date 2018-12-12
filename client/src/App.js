import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import "./App.css";

class App extends Component {

  constructor(props){

    super(props);
    this.state = {

        web3 : null,
        accounts : null,
        instance : null,
        data : 0,
        msg : ""
    };
  }

  componentDidMount = async () => {

    const web3 = await getWeb3();
    const contract = truffleContract(SimpleStorageContract);
    contract.setProvider(web3.currentProvider);
    const accounts = await web3.eth.getAccounts();
    const instance = await contract.deployed();

    this.setState({
      web3,
      accounts,
      instance
    },
    this.getValue);

    this.addEventListener(this)
  }

  getValue = async () => {

    const {instance} = this.state;

    return instance.get()
    .then(response => {
      console.log("response is : "+response.toNumber());
      this.setState({data : response.toNumber()});
    })
    .catch(err => console.log(err));
  }

  updateValue = async (val) => {

    const {accounts, instance} = this.state;

    instance.set.sendTransaction(val, {from : accounts[0]})
    .on('transactionHash', hash => this.setState({msg : "tx is on the way : "+hash}))
    .on('receipt', receipt => this.setState({msg : "tx mined! receipt status :"+receipt.status}))
    .on('error',error => console.log(error));
    
  }

  addEventListener(component){

    const web3Instance = this.state.instance.contract;
    
    web3Instance.events.LogChangedValue((err,event) => {

      if(err){
        console.log("error in event log",err);
        return ;
      }

      this.setState({msg : "event revceived :"+event.event, data : event.returnValues.newValue});
      console.log("event received : "+event.returnValues.newValue);
    });
   
  }


  render() {
    
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <h1>Smart Contract Example</h1>
        <p>
          set a  value to the contracts storage
        </p>
        <div> <input type="number" id="value"/>
        <button id="sendValue" onClick={ () => this.updateValue(document.getElementById('value').value)}>Store</button></div>
        <div>The stored value is: {this.state.data}</div>
        <div>{this.state.msg}</div>
      </div>
    );

  }
}

export default App;
