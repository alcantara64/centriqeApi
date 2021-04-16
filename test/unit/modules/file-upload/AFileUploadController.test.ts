import sinon, { assert } from 'sinon'
const sandbox = sinon.createSandbox();
import AControllerBase from '../../../../src/interfaces/controllers/AControllerBase';
import AFileUploadController from '../../../../src/modules/file-upload/AFileUploadController';
import AFileUploadService from '../../../../src/modules/file-upload/AFileUploadService';
import proxyquire from 'proxyquire';
describe('AFileUploadController', () =>{
   const uploadServiceStub = {
   };
  const uploadService =  proxyquire('../../../../src/modules/file-upload/AFileUploadService',uploadServiceStub);
  //  const newCustomerFileUpload = new CustomerFileUploadService();
    beforeEach(() =>{
     sandbox.restore()
    })

  describe('constructor', () => {
   it('should extend the AFileUploadService', () =>{
     assert.pass( AFileUploadController.prototype instanceof AControllerBase);
   })
  })

})