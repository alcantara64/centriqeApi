

/** 2021-01-12 - Frank - commented out due to should-sinon issue */

// import sinon from 'sinon';
// import auth from '../../../src/middleware/auth.middleware'
// // import HttpBadRequestException from '../../../src/exceptions/http/HttpBadRequestException'
// import should from 'should';
// import 'should-sinon';
// import UserService from '../../../src/modules/user/UserService';

// describe.skip('Auth Middleware', () => {
//   let sandbox = sinon.createSandbox();
//   const resObj = {
//     json: sandbox.spy(),
//     send: sandbox.spy(),
//   };


//   const res: any = {
//     status: sandbox.stub().returns(resObj),
//   };
//   beforeEach(() => {
//     sandbox.restore();
//   })
//   describe('resetPassword', () => {
//     let req: any = {
//       body: {

//       }
//     }
//     afterEach(() => {
//       req = {
//         body: {
//           email: 'test@gmail.com'
//         }
//       }
//     })


//     it('should call return error if email is not available', async () => {
//       // const authSpy =  sandbox.stub(auth, 'resetPassword')
//       should(auth.resetPassword(req, res)).rejected()

//     })
//     it('should throw a not found exception if user email is not in db', async () => {
//       sandbox.stub(UserService.prototype, 'findUserForAuthByIdOrEmailWithPassword').resolves(false);
//       should(auth.resetPassword(req, res)).rejected()

//     })
//     it('should throw an error if update failed', async () => {
//       const dbuser = sandbox.stub(UserService.prototype, 'findUserForAuthByIdOrEmailWithPassword').resolves(true)
//       const updateStub = sandbox.stub(UserService.prototype, 'updateOneById').resolves(false);

//       await auth.resetPassword(req, res);
//       sandbox.assert.calledOnce(dbuser);
//       sandbox.assert.calledOnce(updateStub);

//     })
//     it('it should create new password and return 200 status code', async () => {
//       const dbuser = sandbox.stub(UserService.prototype, 'findUserForAuthByIdOrEmailWithPassword').resolves(true)
//       const updateStub = sandbox.stub(UserService.prototype, 'updateOneById').resolves(true);

//       await auth.resetPassword(req, res);
//       sandbox.assert.calledOnce(dbuser);
//       sandbox.assert.calledOnce(updateStub);

//     })
//   })
// })
