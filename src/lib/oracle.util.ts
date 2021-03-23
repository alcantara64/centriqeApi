import { objectstorage, common } from 'oci-sdk';
import fs, { statSync } from "fs";
const { NodeFSBlob } = objectstorage;
export class OracleCloud {
    private provider: common.ConfigFileAuthenticationDetailsProvider = new common.ConfigFileAuthenticationDetailsProvider();
    private client = new objectstorage.ObjectStorageClient({ authenticationDetailsProvider: this.provider });
    private async getNamespace() {
        const request: objectstorage.requests.GetNamespaceRequest = {};
        const response = await this.client.getNamespace(request);
        const namespace = response.value;
        return namespace;
    }
    public async uploadToBucket(bucket: string, objectName: string, fileLocation: string) {
        const stats = statSync(fileLocation);
        const nodeFsBlob = new NodeFSBlob(fileLocation, stats.size);
        const objectData = await nodeFsBlob.getData();

        const putObjectRequest: objectstorage.requests.PutObjectRequest = {
            namespaceName: await this.getNamespace(),
            bucketName: bucket,
            putObjectBody: objectData,
            objectName: objectName,
            contentLength: stats.size,
        };
        const putObjectResponse = await this.client.putObject(putObjectRequest);
        if (putObjectResponse) {
            fs.unlink(fileLocation, () => {

            })
        }
        return putObjectResponse;
    }
}
