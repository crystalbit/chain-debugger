import { simulateTestCase } from '../src/blockchain/simulation';
import { terminateAnvil } from '../src/blockchain/fork-work';

simulateTestCase(
    'cases/test.json',
)
  .then(() => {
    console.log('Simulation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Simulation failed:', error);
    process.exit(1);
  }); 