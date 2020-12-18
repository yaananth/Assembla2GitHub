git init
git remote add origin git@github.com:ORG_NAME/%CD%.git
git lfs track "*.mp4"
git add .gitattributes
git add --all
git commit -am "changes"
git push -u origin main
