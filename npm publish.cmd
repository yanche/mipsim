xcopy "./src" "./_publish_" /s /i
copy "./package.json" "./_publish_/package.json"
copy "./.npmignore" "./_publish_/.npmignore"
cd "./_publish_"
npm publish
cd ..
rmdir "./_publish_"