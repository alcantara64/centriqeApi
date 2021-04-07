import sinon, { assert } from 'sinon'
const sandbox = sinon.createSandbox();
import CustomerFileUploadController from '../../../../src/modules/file-upload/CustomerFileUploadController';
import AFileUploadController from '../../../../src/modules/file-upload/AFileUploadController';
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
     assert.pass( CustomerFileUploadController.prototype instanceof AFileUploadController);
   })
  });

})