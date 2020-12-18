for %%I in (.) do set CurrDirName=%%~nxI
git init
git remote add origin git@github.com:ORGNAME/%CurrDirName%.git
git lfs track "*.mp4"
git lfs track "*.zip"
git add .gitattributes
git add --all
git commit -am "changes"
git branch -M main
git push -u origin main
