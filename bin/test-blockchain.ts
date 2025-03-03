import { simulateTestCase } from '../src/blockchain/simulation';
import { terminateAnvil } from '../src/blockchain/fork-work';

simulateTestCase('cases/test.json').finally(() => {
    terminateAnvil();
}); 