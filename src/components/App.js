import DStorage from '../abis/DStorage.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_requestAccounts" });
      window.web3 = new Web3(window.ethereum);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    
    const web3 = window.web3
    
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });                   

    const networkId = await web3.eth.net.getId();
    const networkData = DStorage.networks[networkId];
    
    if (networkData) {

      const { account } = this.state; 
    
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address);
      const fileCount = await dstorage.methods.fileCount().call();
      this.setState({ dstorage, fileCount });

      for (let i = fileCount; i >= 1; i--) {

        const file = await dstorage.methods.files(i).call();                                                      

        const allowances = await dstorage.methods.allowances(i, account).call();                              
        
        if (file.fileHash !== "" && (file.isPublic || allowances.viewPerm || account === file.uploader)) {
          this.setState({ files: [...this.state.files, file] });
        }

        if (file.fileHash !== "" && !file.isPermanent && (allowances.deletePerm || account === file.uploader)) {
          this.setState({ deletables: [...this.state.deletables, file] });
        }
      }                                                                                                     

    } else {
      window.alert("DVideo contract is not deployed to the detected network.")
    }

    this.setState({ loading: false });
  }

  captureFile = (event) => {

    event.preventDefault();

    const file = event.target.files[0];

    const reader = new window.FileReader();
    
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ 
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name 
      });
    }
  }
  
  uploadFile = (description, isPublic, isPermanent, viewingAddressesArray, deletingAddressesArray) => {

    ipfs.add(this.state.buffer, (error, result) => { 
      
      if (error) {
        console.log(error);
        return;
      }

      this.setState({ loading: true });

      if (this.state.type === "") {
        this.setState({ type: "none" });
      }

      this.state.dstorage.methods.uploadFile(result[0].hash, result[0].size, this.state.type, this.state.name, description, isPublic, isPermanent, viewingAddressesArray, deletingAddressesArray)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          setTimeout(() => {
            window.location.reload(false);
            this.setState({ loading: false, type: null, name: null });            
          }, 1000);
        })
        .on("error", (err) => {
          window.alert("Error");
          this.setState({ loading: false });            
        });
    });
  }

  deleteFile = (deletionId) => {

    const deletable = this.state.deletables.some(file => file.fileId === deletionId);

    if (!deletable) {
      window.alert("This file cannot be deleted.");
      return;
    }

    this.state.dstorage.methods.deleteFile(deletionId)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        setTimeout(() => {
          window.location.reload(false);
          this.setState({ loading: false, type: null, name: null });            
        }, 1000);
      })
      .on("error", (err) => {
        window.alert("Error");
        this.setState({ loading: false });            
      });
  }

  constructor(props) {
    super(props)
    this.state = {
      account: "",
      dstorage: null,
      files: [],
      deletables: [],
      loading: false,
      type: null,
      name: null
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              files={this.state.files}
              captureFile={this.captureFile}
              uploadFile={this.uploadFile}
              deleteFile={this.deleteFile}
            />
        }
      </div>
    );
  }
}

export default App;