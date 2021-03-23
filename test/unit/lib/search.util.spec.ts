import { expect } from 'chai';
import 'mocha';
import { convertCriteriaToMongooseQuery, Criteria, findIdxOfClosingParenthesis, findNextIdxOfStartingParenthesisOrEnd } from '../../../src/lib/search.util';
import fixtures from '../../fixtures/unit/lib/search.util.fixture';





function checkFindIdxOfClosingParenthesis(criteria: Criteria, expectedResult: number | null) {
  const result = findIdxOfClosingParenthesis(criteria);
  expect(result).to.equal(expectedResult);
}

function checkFindNextIdxOfStartingParenthesisOrEnd(criteria: Criteria, expectedResult: number) {
  const result = findNextIdxOfStartingParenthesisOrEnd(criteria);
  expect(result).to.equal(expectedResult);
}

/*
function checkConvertCriterionToCondition(criterion: Criterion, expectedResult: any) {
  const result = su.convertCriterionToCondition(criterion);

  expect(result).to.deep.equal(expectedResult);
}
*/

function checkConvertCriteriaToMongooseQuery(criteria: Criteria, expectedResult: any) {
  const result = convertCriteriaToMongooseQuery(criteria);
  expect(result).to.deep.equal(expectedResult);
}

describe('search.util', function () {


  describe('findIdxOfClosingParenthesis', function () {

    it('should find index 0 for no parentheses', function () {
      checkFindIdxOfClosingParenthesis(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test2,
        0
      );
    });

    it('should find index 4', function () {

      checkFindIdxOfClosingParenthesis(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test3,
        4
      );
    });

    it('should return null for malformed criteria', function () {
      checkFindIdxOfClosingParenthesis(
        <Criteria>fixtures.findIdxOfClosingParenthesis.test1,
        null
      );
    });
  });


  describe('findNextIdxOfStartingParenthesisOrEnd', function () {

    it('should find index 4 for no parentheses', function () {
      checkFindNextIdxOfStartingParenthesisOrEnd(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test2,
        4
      );
    });

    it('should find index 0 for first parenthesis', function () {

      checkFindNextIdxOfStartingParenthesisOrEnd(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test3,
        0
      );
    });

    it('should find index 0 for malformed criteria', function () {
      checkFindNextIdxOfStartingParenthesisOrEnd(
        <Criteria>fixtures.findIdxOfClosingParenthesis.test1,
        0
      );
    });
  });

/*
  describe('convertCriterionToCondition', function () {

    it('should assemble "=" criteria', function () {

      checkConvertCriterionToCondition(
        <Criterion>fixtures.convertCriterionToCondition.test1,
        { country: "India" }
      );
    });


  });

*/






  describe('convertCriteriaToMongooseQuery', function () {

    it('should assemble an empty query', function () {

      checkConvertCriteriaToMongooseQuery(
        [],
        {"logicalConcatenation":null,"logicalGroups":[],"criteria":[],"level":0,"query":{}}
      );
    });

    it('should assemble a query, only one condition', function () {

      checkConvertCriteriaToMongooseQuery(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test1,
        fixtures.convertCriteriaToMongooseQuery.test1_result
      );
    });

    it('should assemble a query, no paranthesis used', function () {

      checkConvertCriteriaToMongooseQuery(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test2,
        fixtures.convertCriteriaToMongooseQuery.test2_result
      );
    });

    it('should assemble a query, with paranthesis used, one level', function () {

      //(IN and BE or NL and PL and US) and (DE or UK) or (IT or FR) and BE
      checkConvertCriteriaToMongooseQuery(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test3,
        fixtures.convertCriteriaToMongooseQuery.test3_result
      );
    });

    it('should assemble a query, with paranthesis used, multi-level', function () {

      //(((IN and BE or NL and PL and US) and (DE or UK)) or (IT or FR)) and BE
      //this is actually the same end-result as test3 -- due to mongodb queries they always
      //end up as if there were parentheses
      //however, the steps leading to that end-result are different
      checkConvertCriteriaToMongooseQuery(
        <Criteria>fixtures.convertCriteriaToMongooseQuery.test4,
        fixtures.convertCriteriaToMongooseQuery.test4_result
      );
    });

  });

});
