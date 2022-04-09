pragma solidity ^0.5.0;

contract DStorage {
  
  string public name = "DStorage";
  uint public fileCount = 0;
  mapping(uint => File) public files;
  mapping(uint => mapping(address => Action)) public allowances;

  struct File {
    uint fileId;
    string fileHash;
    uint fileSize;
    string fileType;
    string fileName;
    string fileDescription;
    uint uploadTime;
    bool isPublic;
    bool isPermanent;
    address payable uploader;
  }

  struct Action {
    bool viewPerm;
    bool deletePerm;
  }

  event FileUploaded (
    uint fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName,
    string fileDescription,
    uint uploadTime,
    bool isPublic,
    bool isPermanent,
    address payable uploader
  );

  event FileDeleted (
    uint fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName,
    string fileDescription,
    uint uploadTime,
    bool isPublic,
    bool isPermanent,
    address payable uploader,
    uint deletionTime;
    address deleter;
  );

  constructor() public { }

  function uploadFile(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription, bool isPublic, bool isPermanent, address[] memory viewPermissions, address[] memory deletePermissions) public {

    require(msg.sender != address(0x0));
    require(bytes(_fileHash).length > 0);
    require(bytes(_fileType).length > 0);
    require(bytes(_fileName).length > 0);
    require(bytes(_fileDescription).length > 0);
    require(_fileSize > 0);

    fileCount ++;

    files[fileCount] = File(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDescription, now, isPublic, isPermanent, msg.sender);

    setAllowances(fileCount, viewPermissions, deletePermissions);

    emit FileUploaded(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDescription, now, isPublic, isPermanent, msg.sender);
  }

  function deleteFile(uint _id) public _fileIdExists(_id) _deletable(_id) _deletePerm(_id, msg.sender) {

    File memory file = files[_id];
    
    delete files[_id];

    emit FileDeleted(_id, file.fileHash, file.fileSize, file.fileType, file.fileName, file.fileDescription, file.uploadTime, file.isPublic, file.isPermanent, file.uploader, now, msg.sender);
  }

  function setAllowances(uint _id, address[] memory _viewPermissions, address[] memory _deletePermissions) private {
    
    for (uint i = 0; i < _viewPermissions.length; i++) {
      
      address account = _viewPermissions[i];

      allowances[_id][account].viewPerm = true; 
    }

    for (uint i = 0; i < _deletePermissions.length; i++) {
      
      address account = _deletePermissions[i];

      allowances[_id][account].deletePerm = true;
    }
  }

  modifier _deletePerm(uint _id, address _sender) {
    
    require (
      _sender == files[_id].uploader
      ||
      allowances[_id][_sender].deletePerm == true
    );
    _;
  }

  modifier _deletable(uint _id) {

    require(!files[_id].isPermanent);
    _;
  }

  modifier _fileIdExists(uint _id) {
    require(_id > 0 && _id <= fileCount);
    _;
  }

}