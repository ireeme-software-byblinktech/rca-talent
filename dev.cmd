@echo off
node "%~dp0scripts\free-port.mjs" 3001
call "%~dp0node_modules\.bin\next.cmd" dev -p 3001
