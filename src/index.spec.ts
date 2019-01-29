import { createStoreProxy, createStoreServer, StoreProxy, StoreServer } from './index';

describe('Public API Endpoint' , () => {
    it('should export "createStoreProxy"', () => {
        expect(createStoreProxy).toBeTruthy();
    });
    
    it('should export "StoreProxy"', () => {
        expect(StoreProxy).toBeTruthy();
    });
    
    it('should export "createStoreServer"', () => {
        expect(createStoreServer).toBeTruthy()
    });
    
    it('should export "StoreServer"', () => {
        expect(StoreServer).toBeTruthy()
    });
});
