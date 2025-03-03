import { main as simulateTestCase } from '../src/blockchain/simulation';
import { terminateAnvil } from '../src/blockchain/fork-work';

async function main() {
    console.log('Starting simulation...');
    try {
        await simulateTestCase();
    } catch (error) {
        console.error('Simulation failed:', error);
    } finally {
        terminateAnvil();
    }
}

main().catch(console.error); 