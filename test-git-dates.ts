import { getCreatedDate, getUpdatedDate } from './src/utils/gitDates.ts';

const filePath = 'src/content/blog/hello-world.md';

console.log('Testing gitDates utility...');
console.log('File path:', filePath);

try {
  const createdDate = getCreatedDate(filePath);
  const updatedDate = getUpdatedDate(filePath);

  console.log('Created Date:', createdDate);
  console.log('Updated Date:', updatedDate);

  console.log('\nTesting fallback/uncommitted file...');
  const fallbackPath = 'src/content/blog/does-not-exist.md';
  const fallbackCreated = getCreatedDate(fallbackPath);
  const fallbackUpdated = getUpdatedDate(fallbackPath);
  console.log('Uncommitted/Non-existent File path:', fallbackPath);
  console.log('Fallback Created Date:', fallbackCreated);
  console.log('Fallback Updated Date:', fallbackUpdated);
} catch (error) {
  console.error('Error during testing:', error);
}
