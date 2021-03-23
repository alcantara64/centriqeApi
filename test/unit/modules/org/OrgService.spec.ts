
import { DashboardConfigItem, DashboardModule } from './../../../../src/models/org/org.types';
import sinon, { assert } from 'sinon';
import OrgService, { DashboardResultItem } from '../../../../src/modules/org/OrgService';
import AServiceBase from '../../../../src/interfaces/services/AServiceBase';
import MemberOrgModel from '../../../../src/models/org/member-org.model';
import securityUtil from '../../../../src/lib/security.util';
import HoldingOrgModel from '../../../../src/models/org/holding-org.model';


describe('Org Service', () => {
    const sandbox = sinon.createSandbox();
    const newOrgService = new OrgService();
    const appUser = {
        id: 'oopp'
    }
    beforeEach(() => {
        sandbox.restore();
    })
    describe('Base Class', () => {
        it('Should call base controller on init ', () => {
            assert.match(OrgService.prototype instanceof AServiceBase, true);
        })
    })

    describe('upsertOrgConfig', () => {
        let memberOrg: { save: any, dashboardConfig: DashboardConfigItem[] } = {
            dashboardConfig: [],
            save: sandbox.stub().resolves(true),
        }

        const dashBoardConfig: DashboardConfigItem[] = [{
            module: DashboardModule.HOME,
        }];
        const payload: DashboardResultItem = {
            holdingOrgName: 'holding org',
            holdingOrgCode: '34555',
            dashboardConfig: dashBoardConfig,
            holdingOrgId: '245667788',
            memberOrgId: '3455667'
        }
        const _id = 'itooyo45'
        it('should set dashboard config array to new payload if no config', async () => {
            MemberOrgModel.findById = sandbox.stub().resolves(memberOrg);
            securityUtil.isRoleBasedAccessAllowed = sandbox.stub().returns(true);
            const result = await newOrgService.upsertDashboardConfig(appUser as any, _id, payload);
            assert.match(result, dashBoardConfig)
            assert.calledOnce(memberOrg.save);
            assert.calledWith(MemberOrgModel.findById as any, payload.memberOrgId);

        })
        it('should update the array if module is the same', async () => {
            memberOrg.dashboardConfig = dashBoardConfig
            MemberOrgModel.findById = sandbox.stub().resolves(memberOrg);
            securityUtil.isRoleBasedAccessAllowed = sandbox.stub().returns(true);
            const result = await newOrgService.upsertDashboardConfig(appUser as any, _id, payload);
            assert.match(result, dashBoardConfig)
            assert.calledOnce(memberOrg.save);
            assert.calledWith(MemberOrgModel.findById as any, payload.memberOrgId);

        })
        it('should add to the array if module is not in an existing array', async () => {
            memberOrg.dashboardConfig = [{
                module: DashboardModule.INSIGHT
            }]
            const expectedResult = [{ module: "insight" }, { module: "home" }]
            MemberOrgModel.findById = sandbox.stub().resolves(memberOrg);
            securityUtil.isRoleBasedAccessAllowed = sandbox.stub().returns(true);
            const result = await newOrgService.upsertDashboardConfig(appUser as any, _id, payload);
            assert.match(result, expectedResult)
            // assert.calledOnce(memberOrg.save);
            assert.calledWith(MemberOrgModel.findById as any, payload.memberOrgId);

        })
    })
    describe("Enrich Dashbaord", () => {
        it('it should populate missing modules', async () => {
            const dashBoardConfig: DashboardConfigItem[] = [{
                module: DashboardModule.HOME,
            }];
             const sortedArray = [{ module: "askBuddy" }, { module: "comm" }, { module: "home" }, { module: "insight" }, { module: "nps" }, { module: "profitEdge" }, { module: "resp" }]
            const result = await newOrgService.enrichDashboardConfig(dashBoardConfig);
            assert.match(result, sortedArray);
        })

    })
    describe('readDashboardConfig', () => {
        const holdingOrgData = [{
            _id: '67888',
            code: 'codeHol',
            name: 'testName',
            dashboardConfig: [],
        }]
        const memberOrgData = [{
            _id: '67888',
            code: 'codeHol',
            name: 'testName',
            dashboardConfig: [],
            holdingOrg:holdingOrgData[0]
        }]

    it('should return aggregated dashboard config', async () => {
       const id = 'rrretuu67'
       const opts = {
           _id: '57768yue',
           memberOrg: '5678frtr'
       };
       
      const expectedResult:any = [{
        holdingOrgCode: "codeHol",
        holdingOrgId: "67888",
        holdingOrgName: "testName",
        dashboardConfig: newOrgService.enrichDashboardConfig([])
      },
      {
        holdingOrgCode: "codeHol",
        holdingOrgId: "67888",
        holdingOrgName: "testName",
        memberOrgCode: "codeHol",
        memberOrgId: "67888",
        memberOrgName: "testName",
        dashboardConfig: newOrgService.enrichDashboardConfig([])
      }
    ]
      const populateMemberOrg = {populate:sandbox.stub().returns(memberOrgData)}
      const selectStub = {select:sandbox.stub().returns(holdingOrgData)}
      const selectMemStub = {select: sandbox.stub().returns(populateMemberOrg)}
       HoldingOrgModel.find = sandbox.stub().returns(selectStub)
       MemberOrgModel.find = sandbox.stub().returns(selectMemStub)
       const results =  await newOrgService.readDashboardConfig(appUser as any, id,  opts);
       assert.calledWith(HoldingOrgModel.find as any, {_id:'57768yue'})
       assert.calledWith(MemberOrgModel.find as any, {_id:'57768yue', memberOrg:'5678frtr'})
       assert.match(results, expectedResult)
    })
    })

})