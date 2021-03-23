import sinon, { assert } from 'sinon';
import OrgController from '../../../../src/modules/org/OrgController';
import OrgService, { DashboardResultItem } from '../../../../src/modules/org/OrgService';
import AControllerBase from '../../../../src/interfaces/controllers/AControllerBase';
import HttpStatus from '../../../../src/enums/HttpStatus';

describe('OrgController', () => {
    let sandbox = sinon.createSandbox();
    const req: any = {
        user: {
            email: 'test@gmail.com'
        },
        params: {
            id: '5996888'

        },
        body: {
        }

    }

    const resObj = {
        json: sandbox.spy(),
        send: sandbox.spy(),
    };

    const res: any = {
        status: sandbox.stub().returns(resObj),
    };
    const newOrgController = new OrgController();
    const expressRoute: any = {
        get: sandbox.spy(),
        put: sandbox.spy(),
    }
    beforeEach(() => {
        sandbox.restore();
    })
    describe('Base Class', () => {
        it('Should call base controller on init ', () => {
            assert.match(OrgController.prototype instanceof AControllerBase, true);
        })
    })
    describe('initRoutes', () => {

        newOrgController.initRoutes(expressRoute);
        it('should register initial routes', () => {
            assert.calledWith(expressRoute.get, '/dashboardConfig');
            assert.calledWith(expressRoute.put, '/dashboardConfig');
        })

    })
    describe('readDashboardConfig', () => {
        const dashboardConfig: DashboardResultItem[] = [{
            holdingOrgName: '',
            holdingOrgCode: '',
            holdingOrgId: 'string',
            memberOrgName: 'string',
            dashboardConfig: []
        }]

        it('should read dashboard config', async () => {
            sinon.stub(OrgService.prototype, 'readDashboardConfig').returns(dashboardConfig as any)
            await newOrgController.readDashboardConfig(req, res);
            assert.calledWith(res.status, HttpStatus.OK.CODE)
            assert.calledWith(resObj.json, dashboardConfig);
        })
    })
    describe('updateDashboardConfig', () => {
        const dashboardConfig: DashboardResultItem[] = [{
            holdingOrgName: '',
            holdingOrgCode: '',
            holdingOrgId: 'string',
            memberOrgName: 'string',
            dashboardConfig: []
        }]

        it('should update dashboard config', async () => {
            sinon.stub(OrgService.prototype, 'upsertDashboardConfig').returns(dashboardConfig as any)
            await newOrgController.updateDashboardConfig(req, res);
            assert.calledWith(res.status, HttpStatus.OK.CODE)
            assert.calledWith(resObj.json, dashboardConfig);
        })
    })
});