/** The search schema method is not used anymore */


// import 'mocha';
// import { expect } from 'chai';
// //import sinon from 'sinon';

// import { getMongooseModelAttributes } from '../../../src/lib/mongoose.util';
// import mongoose from 'mongoose'
// import CustomerModel from '../../../src/models/org/customer.model'


// //var CustomerModelMock: sinon.SinonMock

// function checkBuildSearchSchema(model: mongoose.Model<any>, fieldNames: Array<string>, expectedResult: any) {
//   const result = getMongooseModelAttributes(model, fieldNames);

//   expect(result).to.deep.equal(expectedResult);
// }

// describe('mongoose.util', function () {

//   beforeEach(function () {
//     //CustomerModelMock = sinon.mock(CustomerModel);
//   });

//   afterEach(function () {
//     //CustomerModelMock.restore();
//     //mongoose.models = {}; //models is readonly now
//     //mongoose.modelSchemas = {};
//     return mongoose.connection.close();
//   });


//   describe('getMongooseModelAttributes', function () {

//     it('should retrieve an ObjectID member', function () {

//       checkBuildSearchSchema(
//         CustomerModel,
//         ['memberOrg'],
//         {
//           "memberOrg": {
//             "type": "ObjectID"
//           }
//         }
//       );
//     });


//     it('should retrieve a Date member', function () {

//       checkBuildSearchSchema(
//         CustomerModel,
//         ['birthdate'],
//         {
//           "birthdate": {
//             "type": "Date"
//           }
//         }
//       );
//     });


//     it('should retrieve a Number member', function () {

//       checkBuildSearchSchema(
//         CustomerModel,
//         ['status'],
//         {
//           "status": {
//             "type": "Number",
//             "data": [1, 0]
//           }
//         }
//       );
//     });

//     it('should retrieve a string member', function () {

//       checkBuildSearchSchema(
//         CustomerModel,
//         ['indCorp'],
//         {
//           "indCorp": {
//             "type": "String",
//             "data": ['ind', 'corp']
//           }
//         }
//       );
//     });


//     it('should retrieve an ObjectID, date and number member', function () {

//       checkBuildSearchSchema(
//         CustomerModel,
//         ['memberOrg', 'birthdate', 'status'],
//         {
//           "memberOrg": {
//             "type": "ObjectID"
//           },

//           "birthdate": {
//             "type": "Date"
//           },

//           "status": {
//             "type": "Number",
//             "data": [1, 0]
//           }
//         }

//       );
//     });


//     it('should throw an exception for unknown fieldName', function () {

//       expect(function () {
//         getMongooseModelAttributes(CustomerModel, ['yada'])
//       }).to.throw("Internal server error");
//     });


//   });

// });
