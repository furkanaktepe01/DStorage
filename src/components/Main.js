import React, { Component } from 'react';
import { convertBytes } from './helpers';
import moment from 'moment'

class Main extends Component {

  state = {
    description: "",
    isPublic: false,
    isPermanent: false,
    viewingAddresses: "",
    deletingAddresses: "",
    deletionId: null
  }

  uploadFileHandler = (e) => {
    
    e.preventDefault()
    
    const { description, isPublic, isPermanent, viewingAddresses, deletingAddresses } = this.state;  

    let viewingAddressesArray = [];
    let deletingAddressesArray = [];

    if (viewingAddresses) {
      viewingAddressesArray = viewingAddresses.split(",").map(address => address.trim()); 
    }
     
    if (deletingAddresses) {
      deletingAddressesArray = deletingAddresses.split(",").map(address => address.trim());
    }

    this.props.uploadFile(description, isPublic, isPermanent, viewingAddressesArray, deletingAddressesArray);
  }

  deleteFileHandler = (e) => {

    e.preventDefault();

    this.props.deleteFile(this.state.deletionId);
  }

  render() {
    return (
      <div className="container-fluid mt-5 text-center">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '1024px' }}>
            <div className="content">
              <p>&nbsp;</p>
              <div className="card mb-3 mx-auto bg-dark" style={{ maxWidth: '512px' }}>
                <h2 className="text-white text-monospace bg-dark"><b><ins>Share File</ins></b></h2>
                  <form onSubmit={this.uploadFileHandler} >
                      <div className="form-group">
                        <br></br>
                        <input
                          type="text"
                          value={this.state.description}
                          onChange={(e) => this.setState({ description: e.target.value })}
                          className="form-control text-monospace"
                          placeholder="Description..."
                          required 
                        />
                        <br></br>
                        <input
                          type="text"
                          value={this.state.viewingAddresses}
                          onChange={(e) => this.setState({ viewingAddresses: e.target.value })}
                          className="form-control text-monospace"
                          placeholder="Comma-delimited list of addresses allowed to view..." 
                        />
                        <br></br>
                        <input
                          type="text"
                          value={this.state.deletingAddresses}
                          onChange={(e) => this.setState({ deletingAddresses: e.target.value })}
                          className="form-control text-monospace"
                          placeholder="Comma-delimited list of addresses allowed to delete..." 
                        />
                        <br></br>
                        <input
                          name="isPublic" 
                          type="checkbox"
                          label="is public"
                          onClick={(e) => this.setState({ isPublic: !this.state.isPublic })}
                        />
                        <label for="isPublic" style={{ color: "white", marginLeft: "10px" }}>Public File: everyone is allowed to view the file.</label>
                        <br></br>
                        <input
                          name="isPermanent" 
                          type="checkbox"
                          label="is public"
                          onClick={(e) => this.setState({ isPermanent: !this.state.isPermanent })}
                        />
                        <label for="isPermanent" style={{ color: "white", marginLeft: "10px" }}>Permanent File: nobody can delete the file, including the uploader.</label>
                      </div>
                    <input type="file" onChange={this.props.captureFile} className="text-white text-monospace"/>
                    <button type="submit" className="btn-primary btn-block" style={{ marginTop: "10px"}}><b>Upload</b></button>
                  </form>
              </div>
              <p>&nbsp;</p>
              <table className="table-sm table-bordered text-monospace" style={{ width: '1000px', maxHeight: '450px'}}>
                <thead style={{ 'fontSize': '15px' }}>
                  <tr className="bg-dark text-white">
                    <th scope="col" style={{ width: '10px'}}>Id</th>
                    <th scope="col" style={{ width: '200px'}}>Name</th>
                    <th scope="col" style={{ width: '230px'}}>Description</th>
                    <th scope="col" style={{ width: '120px'}}>Type</th>
                    <th scope="col" style={{ width: '90px'}}>Size</th>
                    <th scope="col" style={{ width: '90px'}}>Public</th>
                    <th scope="col" style={{ width: '90px'}}>Permanent</th>
                    <th scope="col" style={{ width: '140px'}}>Upload Date</th>
                    <th scope="col" style={{ width: '120px'}}>Uploader</th>
                    <th scope="col" style={{ width: '120px'}}>File Hash</th>
                  </tr>
                </thead>
                { this.props.files.map((file, key) => {
                  return(
                    <thead style={{ 'fontSize': '12px' }} key={key}>
                      <tr>
                        <td>{file.fileId}</td>
                        <td>{file.fileName}</td>
                        <td>{file.fileDescription}</td>
                        <td>{file.fileType}</td>
                        <td>{convertBytes(file.fileSize)}</td>
                        <td>{file.isPublic ? "True" : "False"}</td>
                        <td>{file.isPermanent ? "True" : "False"}</td>
                        <td>{moment.unix(file.uploadTime).format('h:mm:ss A M/D/Y')}</td>
                        <td>
                          <a
                            href={"https://etherscan.io/address/" + file.uploader}
                            rel="noopener noreferrer"
                            target="_blank">
                            {file.uploader.substring(0,10)}...
                          </a>
                         </td>
                        <td>
                          <a
                            href={"https://ipfs.infura.io/ipfs/" + file.fileHash}
                            rel="noopener noreferrer"
                            target="_blank">
                            {file.fileHash.substring(0,10)}...
                          </a>
                        </td>
                      </tr>
                    </thead>
                  )
                })}
              </table>
              <br></br>
              <br></br>
              <br></br>
              <div className="card mb-3 mx-auto bg-dark" style={{ maxWidth: '512px' }}>
                <h4 className="text-white text-monospace bg-dark"><b><ins>Remove File</ins></b></h4>
                  <form onSubmit={this.deleteFileHandler} >
                      <div className="form-group">
                        <br></br>
                          <input
                            type="text"
                            value={this.state.deletionId}
                            onChange={(e) => this.setState({ deletionId: e.target.value })}
                            className="form-control text-monospace"
                            placeholder="File Id" 
                            required
                          />
                      </div>
                    <button type="submit" className="btn-danger btn-block"><b>Delete</b></button>
                  </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;