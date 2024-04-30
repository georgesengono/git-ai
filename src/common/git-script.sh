#!/bin/bash


# Get branch information
# echo "Branches and their last commit:"
# for branch in $(git branch --list | sed 's/* //'); do
#     echo "Branch: $branch"
#     echo "Last Commit: $(git log $branch -1 --pretty=format:'%H')"
#     echo "Last Commit Date: $(git log $branch -1 --pretty=format:'%aI')"
#     echo "Last Commit Author: $(git log $branch -1 --pretty=format:'%aN')"
#     echo "Last Commit Message: $(git log $branch -1 --pretty=format:'%s')"
# done

# echo ""
# echo "Commit History for each branch:"
# for branch in $(git branch --list | sed 's/* //'); do
#     echo "Commit History for $branch:"
#     git log $branch --pretty=format:'{"commit": "%H", "author": "%aN", "date": "%aI", "message": "%s"},' | awk '{print}' ORS=' '
#     echo ""
# done

## For now, we are only interested in the current branch because 
## the code above generate an output too big to be given to the LLM.
# echo ""
echo "Current Git Status:"
git status 
