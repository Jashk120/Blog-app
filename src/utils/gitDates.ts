import { execSync } from 'child_process';
import path from 'path';

/**
 * Gets the creation date of a file from Git history.
 * Runs git log with --diff-filter=A to trace its first commit.
 * Returns an empty string if git fails or the file has no history
 * (e.g. untracked files, or submodule history unavailable).
 */
export function getCreatedDate(filePath: string): string {
  try {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);
    const stdout = execSync(
      `git log --diff-filter=A --follow --format=%aI -- "${filename}"`,
      { cwd: dir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const lines = stdout.trim().split('\n').filter(Boolean);
    if (lines.length === 0) {
      return '';
    }
    // The last line is the oldest commit (creation)
    return lines[lines.length - 1];
  } catch (error) {
    return '';
  }
}

/**
 * Gets the last updated date of a file from Git history.
 * Runs git log -1 to trace the most recent commit.
 * Falls back to getCreatedDate if git command fails/has no output.
 */
export function getUpdatedDate(filePath: string): string {
  try {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);
    const stdout = execSync(
      `git log -1 --format=%aI -- "${filename}"`,
      { cwd: dir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const result = stdout.trim();
    if (!result) {
      return getCreatedDate(filePath);
    }
    return result;
  } catch (error) {
    return getCreatedDate(filePath);
  }
}

