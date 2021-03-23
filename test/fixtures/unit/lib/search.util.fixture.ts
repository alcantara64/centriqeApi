import cctcTest1 from './search.util.fixture.cctc.test1.json';


import cctmqTest1 from './search.util.fixture.cctmq.test1.json';
import cctcTest1_result from './search.util.fixture.cctmq.test1r.json';

import cctmqTest2 from './search.util.fixture.cctmq.test2.json';
import cctmqTest2_result from './search.util.fixture.cctmq.test2r.json';

import cctmqTest3 from './search.util.fixture.cctmq.test3.json';
import cctmqTest3_result from './search.util.fixture.cctmq.test3r.json';

import cctmqTest4 from './search.util.fixture.cctmq.test4.json';
import cctmqTest4_result from './search.util.fixture.cctmq.test4r.json';

import fiocpTest1 from './search.util.fixture.fiocp.test1.json';


export default {
  convertCriterionToCondition: {
    test1: cctcTest1,
  },

  convertCriteriaToMongooseQuery: {
    test1: cctmqTest1,
    test1_result: cctcTest1_result,
    test2: cctmqTest2,
    test2_result: cctmqTest2_result,
    test3: cctmqTest3,
    test3_result: cctmqTest3_result,
    test4: cctmqTest4,
    test4_result: cctmqTest4_result,
  },

  findIdxOfClosingParenthesis: {
    test1: fiocpTest1
  }
}
