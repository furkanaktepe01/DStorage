const DStorage = artifacts.require('./DStorage.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('DStorage', ([deployer, uploader]) => {
  
  let dstorage

  before(async () => {
    dstorage = await DStorage.deployed()
  })

  describe('deployment', async () => {
    
    it('deploys successfully', async () => {
      const address = await dstorage.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await dstorage.name()
      assert.equal(name, 'DStorage')
    })
  })

  describe('file', async () => {
    
    let result, fileCount
    
    const fileHash = 'QmV8cfu6n4NT5xRr2AHdKxFMTZEJrA44qgrBCr739BN9Wb'
    const fileSize = '1'
    const fileType = 'TypeOfTheFile'
    const fileName = 'NameOfTheFile'
    const fileDescription = 'DescriptionOfTheFile'
    const viewPermissions = [uploader];
    const deletePermissions = [uploader];

    before(async () => {
      result = await dstorage.uploadFile(fileHash, fileSize, fileType, fileName, fileDescription, true, false, viewPermissions, deletePermissions, { from: uploader })
      fileCount = await dstorage.fileCount()
    })

    //check event
    it('upload file', async () => {
      // SUCESS
      assert.equal(fileCount, 1)
      const event = result.logs[0].args
      assert.equal(event.fileId.toNumber(), fileCount.toNumber(), 'Id is correct')
      assert.equal(event.fileHash, fileHash, 'Hash is correct')
      assert.equal(event.fileSize, fileSize, 'Size is correct')
      assert.equal(event.fileType, fileType, 'Type is correct')
      assert.equal(event.fileName, fileName, 'Name is correct')
      assert.equal(event.fileDescription, fileDescription, 'Description is correct')
      assert.equal(event.uploader, uploader, 'Uploader is correct')

      const viewPermissions = [uploader];
      const deletePermissions = [uploader];

      //FAILURE: File must have hash
      await dstorage.uploadFile('', fileSize, fileType, fileName, fileDescription, true, false, viewPermissions, deletePermissions, { from: uploader }).should.be.rejected;

      // FAILURE: File must have size
      await dstorage.uploadFile(fileHash, '', fileType, fileName, fileDescription, true, false, viewPermissions, deletePermissions, { from: uploader }).should.be.rejected;
      
      // FAILURE: File must have type
      await dstorage.uploadFile(fileHash, fileSize, '', fileName, fileDescription, true, false, viewPermissions, deletePermissions, { from: uploader }).should.be.rejected;

      // FAILURE: File must have name
      await dstorage.uploadFile(fileHash, fileSize, fileType, '', fileDescription, true, false, viewPermissions, deletePermissions, { from: uploader }).should.be.rejected;

      // FAILURE: File must have description
      await dstorage.uploadFile(fileHash, fileSize, fileType, fileName, '', true, false, viewPermissions, deletePermissions, { from: uploader }).should.be.rejected;
    })

    //check from Struct
    it('lists file', async () => {
      
      const file = await dstorage.files(fileCount, { from: uploader });
      
      assert.equal(file.fileId.toNumber(), fileCount.toNumber(), 'id is correct')
      assert.equal(file.fileHash, fileHash, 'Hash is correct')
      assert.equal(file.fileSize, fileSize, 'Size is correct')
      assert.equal(file.fileName, fileName, 'Size is correct')
      assert.equal(file.fileDescription, fileDescription, 'description is correct')
      assert.equal(file.uploader, uploader, 'uploader is correct')
    })


    it('deletes file', async () => {
      
      await dstorage.deleteFile(fileCount, { from: uploader });

      const file = await dstorage.files(fileCount);
      
      assert.equal(file.fileId.toNumber(), 0, 'id is correct')
      assert.equal(file.fileHash, "", 'Hash is correct')
      assert.equal(file.fileSize, 0, 'Size is correct')
      assert.equal(file.fileName, "", 'Size is correct')
      assert.equal(file.fileDescription, "", 'description is correct')
      assert.notEqual(file.uploader, uploader, 'uploader is correct')
    })

    it('cannot delete permanent files', async () => {

      await dstorage.uploadFile(fileHash, fileSize, fileType, fileName, 'Description', true, true, viewPermissions, deletePermissions, { from: uploader });

      await dstorage.deleteFile(fileCount + 1, { from: uploader }).should.be.rejected;

    })
  })
})