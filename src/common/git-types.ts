/**
 * Git branch
 */
export interface Branch {
    name: string;
    updatedAt: Date;
    behind: number;
    ahead: number;
    isDefault: boolean;
    isActive: boolean;
    commits: Commit[];
}

/**
 * Git commit
 */
export interface Commit {
    hash: string;
    message: string;
    author: string;
    date: Date;
}

/**
 * Git repository
 */
export interface Repository {
    name: string;
    description: string;
    path: string;
    branches: Branch[];
    currentBranch: Branch;
    remotes: Remote[];
    status: string;
    contributors: string[];
}

/**
 * Git remote
 */
export interface Remote {
    name: string;
    url: string;
}

/**
 * Git status
 */
export interface Status {
    branch: string;
    ahead: number;
    behind: number;
    files: string[];
    changes: string[];
    untracked: string[];
    conflicts: string[];
    stashes: number;
    commits: number; 
}