import baqTest1 from './security.fixture.baq.test1.json';
import baqTest2 from './security.fixture.baq.test2.json';
import baqTest3 from './security.fixture.baq.test3.json';

import aartqTest1 from './security.fixture.aartq.test1.json';

export default {
  buildAccessQuery: {
    test1: baqTest1,
    test2: baqTest2,
    test3: baqTest3
  },

  attachAccessRestrictionToQuery: {
    test1: aartqTest1
  }
}
