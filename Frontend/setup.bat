@echo off
echo Starting setup...
call npx -y create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
echo Setup Complete > setup_done.txt
