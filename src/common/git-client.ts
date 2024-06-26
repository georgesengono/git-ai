import { execFile, exec } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * This client will be used to get the current project status
 * and to execute git commands.
 * For now, lets only get the different branches of the repository 
 * and the commits of each branch.
 */
export class GitClient {
    private gitScriptPath: string;
    constructor() {
        this.gitScriptPath = path.resolve(__dirname, 'git-script.sh').replace("dist", "src/common");
        fs.chmodSync(this.gitScriptPath, '755');
    }

    executeGitScript(): Promise<string> {
        // Ensure the script is executable
        return new Promise((resolve, reject) => {
            execFile(this.gitScriptPath, (error, stdout, stderr) => {
                if (error) {
                  console.log(`error: ${error.message}`);
                  return;
                }
                if (stderr) {
                  console.log(`stderr: ${stderr}`);
                  return;
                }
                this.updateProjectStatus(stdout);
                return resolve(stdout);
              });
        });
    }

    updateProjectStatus(status: string): void {
        const FILE_PATH = path.resolve(__dirname, 'project-status.txt');
        fs.writeFileSync(FILE_PATH, status);
    }
}
