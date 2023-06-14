#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

hugo

cd public || exit

git add .
git commit -m "Rebuilding site $(date)"
git push origin master --force-with-lease

cd ..

git add .
git commit -m "Add new post $(date)"
git push origin source --force-with-lease
