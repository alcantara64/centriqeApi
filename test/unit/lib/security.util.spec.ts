import 'mocha';
import { expect } from 'chai';
import IRowLevelSecurityData from '../../../src/interfaces/models/IRowLevelSecurityData';
import IRowLevelUserSecurity, { Secureable } from '../../../src/interfaces/models/IRowLevelUserSecurity';


import security from '../../../src/lib/security.util';
import { BuildAccessQueryLimiter } from '../../../src/lib/security.util';
import fixtures from '../../fixtures/unit/lib/security.fixture';
import Privilege from '../../../src/enums/Privilege';
import DataDomain from '../../../src/enums/DataDomain';


function generateUserSecurity(isAdmin: boolean, securable: Secureable): IRowLevelUserSecurity {
  const result: IRowLevelUserSecurity = {
    isAdmin: isAdmin,
    communication: securable,
    customer: { holdingOrgs: [], memberOrgs: [] }, product: { holdingOrgs: [], memberOrgs: [] }, revenue: { holdingOrgs: [], memberOrgs: [] }, cost: { holdingOrgs: [], memberOrgs: [] }, response: { holdingOrgs: [], memberOrgs: [] }, nps: { holdingOrgs: [], memberOrgs: [] }, profitEdge: { holdingOrgs: [], memberOrgs: [] }, marketPlace: { holdingOrgs: [], memberOrgs: [] },
  }

  return result;
}

function checkIsAccessAllowed(isAdmin: boolean, securable: Secureable, data: IRowLevelSecurityData | IRowLevelSecurityData[], expectedResult: boolean) {
  const userSecurity = generateUserSecurity(isAdmin, securable);
  const result = security.isRowLevelAccessAllowed(DataDomain.COMM, userSecurity, data);
  expect(result).to.equal(expectedResult);
}

function checkBuildAccessQuery(isAdmin: boolean, securable: Secureable, expectedResult: any, limiter?: BuildAccessQueryLimiter) {
  const userSecurity = generateUserSecurity(isAdmin, securable);
  const result = security.buildAccessQuery(DataDomain.COMM, userSecurity, limiter);
  //JSON stunt necessary because of ObjectId to String comparison
  expect(JSON.parse(JSON.stringify(result))).to.deep.equal(expectedResult);
}


function checkAttachAccessQueryRestriction(query: any, isAdmin: boolean, securable: Secureable, expectedResult: any) {
  const userSecurity = generateUserSecurity(isAdmin, securable);
  const result = security.attachAccessRestrictionToQuery(query, DataDomain.COMM, userSecurity);
  //JSON stunt necessary because of ObjectId to String comparison
  expect(JSON.parse(JSON.stringify(result))).to.deep.equal(expectedResult);
}

//var correctedFixtures = {}
describe('security.util', function () {

  before(() => {
    // Object
  });

  describe('isRowLevelAccessAllowed', function () {

    it('should return true for admin', function () {
      checkIsAccessAllowed(
        true,
        {
          holdingOrgs: [],
          memberOrgs: []
        },
        {
          holdingOrgId: '00000000000000000000a100',
          memberOrgId: '00000000000000000000b100'
        },
        true
      );
    });


    it('should return false for no access at all', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: [],
          memberOrgs: []
        },
        {
          holdingOrgId: '00000000000000000000a100',
          memberOrgId: '00000000000000000000b100'
        },
        false
      );
    });


    it('should return true for access to all elements', function () {
      checkIsAccessAllowed(
        true,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        {
          holdingOrgId: '00000000000000000000a100',
          memberOrgId: '00000000000000000000b200'
        },
        true
      );
    });

    it('should return false for missing memberOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        {
          holdingOrgId: '00000000000000000000a100',
          memberOrgId: '00000000000000000000b300'
        },
        false
      );
    });

    it('should return true for holdingOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        {
          holdingOrgId: '00000000000000000000a200'
        },
        true
      );
    });

    it('should return true for memberOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        {
          memberOrgId: '00000000000000000000b200'
        },
        true
      );
    });


    it('should return true for array of holdingOrgId and memberOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200', '00000000000000000000a300'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        [{ holdingOrgId: '00000000000000000000a100', memberOrgId: '00000000000000000000b200' }, { holdingOrgId: '00000000000000000000a200', memberOrgId: '00000000000000000000b100' }],
        true
      );
    });

    it('should return true for array of holdingOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200', '00000000000000000000a300'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        [{ holdingOrgId: '00000000000000000000a100' }, { holdingOrgId: '00000000000000000000a200' }],
        true
      );
    });

    it('should return true for array of memberOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        [{ memberOrgId: '00000000000000000000b100' }, { memberOrgId: '00000000000000000000b200' }],
        true
      );
    });


    it('should return false for array of holdingOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200', '00000000000000000000a300'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        [{ holdingOrgId: '00000000000000000000a100' }, { holdingOrgId: '00000000000000000000a200' }, { holdingOrgId: '00000000000000000000a400' }],
        false
      );
    });

    it('should return false for array of memberOrgId', function () {
      checkIsAccessAllowed(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        [{ memberOrgId: '00000000000000000000b100' }, { memberOrgId: '00000000000000000000b200' }, { memberOrgId: '00000000000000000000b400' }],
        false
      );
    });


  });




  describe('buildAccessQuery', function () {
    it('is admin', function () {
      checkBuildAccessQuery(
        true,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        null
      )
    });

    it('holdingOrgIds and memberOrgIds', function () {
      checkBuildAccessQuery(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        fixtures.buildAccessQuery.test1
      )
    });

    it('only holdingOrgIds', function () {
      checkBuildAccessQuery(
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: []
        },
        fixtures.buildAccessQuery.test2
      )
    });

    it('only memberOrgIds', function () {
      checkBuildAccessQuery(
        false,
        {
          holdingOrgs: [],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        fixtures.buildAccessQuery.test3
      )
    });

    it('no access', function () {
      checkBuildAccessQuery(
        false,
        {
          holdingOrgs: [],
          memberOrgs: []
        },
        { memberOrg: "000000000000000000000000" }
      )
    });


    it('Using limiter for holdingOrg', function () {
      checkBuildAccessQuery(
        false,
        {
          holdingOrgs: ['00000000000000000000a100'],
          memberOrgs: ['00000000000000000000b100'],
        },
        { holdingOrg: { $in: ["00000000000000000000a100"] } },
        'holdingOrg'
      )
    });

    it('Using limiter for memberOrg', function () {
      checkBuildAccessQuery(
        false,
        {
          holdingOrgs: ['00000000000000000000a100'],
          memberOrgs: ['00000000000000000000b100'],
        },
        { memberOrg: { $in: ["00000000000000000000b100"] } },
        'memberOrg'
      )
    });
  });

  describe('attachAccessRestrictionToQuery', function () {
    it('is admin', function () {
      checkAttachAccessQueryRestriction({ name: '00000000000000000000ffff' },
        true,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        { name: '00000000000000000000ffff' }
      );

    });

    it('holdingOrgIds and memberOrgIds', function () {
      checkAttachAccessQueryRestriction({ name: '00000000000000000000ffff' },
        false,
        {
          holdingOrgs: ['00000000000000000000a100', '00000000000000000000a200'],
          memberOrgs: ['00000000000000000000b100', '00000000000000000000b200']
        },
        fixtures.attachAccessRestrictionToQuery.test1
      );
    });
  });


  describe('extractRowLevelSecurityData', function () {
    it('should return the correct object', function () {
      const result = security.extractRowLevelSecurityData({ holdingOrg: '00000000000000000000a100', memberOrg: '00000000000000000000b100' })[0];
      expect(result).to.deep.equal({ holdingOrgId: '00000000000000000000a100', memberOrgId: '00000000000000000000b100' });
    });

    it('should return the correct array', function () {
      const result = security.extractRowLevelSecurityData([{ holdingOrg: '00000000000000000000a100', memberOrg: '00000000000000000000b100' }, { holdingOrg: '00000000000000000000a200', memberOrg: '00000000000000000000b200' }]);
      expect(result).to.deep.equal([{ holdingOrgId: '00000000000000000000a100', memberOrgId: '00000000000000000000b100' }, { holdingOrgId: '00000000000000000000a200', memberOrgId: '00000000000000000000b200' }]);
    });

    it('should throw an AppException', function () {
      expect(function () {
        security.extractRowLevelSecurityData([{ holdingOrg: '00000000000000000000a100', memberOrg: '00000000000000000000b100' }, { holdingOrg1: '00000000000000000000a200', memberOrg1: '00000000000000000000b200' }]);
      }).to.throw('Expecting holdingOrg and memberOrg attributes.');
    });
  });


  describe('isRoleBasedAccessAllowed', function () {
    it('should return true', function () {
      const result = security.isRoleBasedAccessAllowed({ privileges: [Privilege.ASK_BUDDY_ANALYTICS, Privilege.BILLING_VIEW] }, [Privilege.ASK_BUDDY_EDIT, Privilege.BILLING_VIEW]);
      expect(result).to.equal(true);
    });

    it('should return false', function () {
      const result = security.isRoleBasedAccessAllowed({ privileges: [Privilege.ASK_BUDDY_ANALYTICS, Privilege.BILLING_VIEW] }, [Privilege.ASK_BUDDY_EDIT, Privilege.BILLING_EDIT]);
      expect(result).to.equal(false);
    });
  });





});



