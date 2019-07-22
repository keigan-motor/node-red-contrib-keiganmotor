const should = require("should");
const helper = require("node-red-node-test-helper");

const node = require("../km-motor-ble");

describe("motor Node", () => {
    before((done) => {
        helper.startServer(done);
    });

    after((done) => {
        helper.stopServer(done);
    });

    afterEach(() => {
        helper.unload();
    });

    it("should be loaded", (done) => {
        let flow = [{id:"n1", type:"km-motor", name: "test" }];
        helper.load(node, flow, () => {
            const n1 = helper.getNode("n1");
            n1.should.have.property("name", "test");
            done();
        });
    });
});
