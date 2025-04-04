import { TestCase } from '../../../types';
import { createEmptyStep } from '../types/EmptyStep';

/**
 * Creates a new empty test case with a single empty step
 * @param name The name for the test case file without extension
 * @param rpcUrl The RPC URL to use for the test case
 * @returns A new TestCase object
 */
export const createEmptyTestCase = (name: string, rpcUrl: string = 'http://localhost:8545'): TestCase => {
  return {
    config: {
      rpcUrl: rpcUrl
    },
    steps: [
      createEmptyStep(`Initial Step`)
    ]
  };
};

/**
 * Saves a new empty test case to a file
 * @param directoryPath The directory path to save the file to
 * @param fileName The name for the file without extension
 * @param rpcUrl Optional RPC URL (defaults to localhost:8545)
 * @returns The full path to the created file
 */
export const saveEmptyTestCaseFile = async (
  directoryPath: string,
  fileName: string,
  rpcUrl?: string
): Promise<string> => {
  // Make sure the filename has a .json extension
  const normalizedFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

  // Create the full file path
  const filePath = `${directoryPath}/${normalizedFileName}`;

  // Create the test case object
  const testCase = createEmptyTestCase(fileName, rpcUrl);

  // Save the file
  await window.electronAPI.writeFile(filePath, JSON.stringify(testCase, null, 2));

  return filePath;
}; 