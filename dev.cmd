@echo off
node "%~dp0scripts\free-port.mjs" 3000
call "%~dp0node_modules\.bin\next.cmd" dev -p 3000
