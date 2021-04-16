import sinon, { assert } from 'sinon'
const sandbox = sinon.createSandbox();
import CustomerFileUploadService from '../../../../src/modules/file-upload/CustomerFileUploadService';
import AFileUploadService from '../../../../src/modules/file-upload/AFileUploadService';
//import proxyquire from 'proxyquire';
describe('CustomerFileUploadService', () =>{
  // const uploadServiceStub = {};
 // const uploadService =  proxyquire(AFileUploadService,uploadServiceStub);
  //  const newCustomerFileUpload = new CustomerFileUploadService();
    beforeEach(() =>{
     sandbox.restore()
    })

  describe('constructor', () => {
   it('should extend the AFileUploadService', () =>{
     assert.pass( CustomerFileUploadService.prototype instanceof AFileUploadService);
   })
  });

})