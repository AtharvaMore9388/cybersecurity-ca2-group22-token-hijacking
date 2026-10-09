@echo off
REM Builds a Windows .exe of the simulator. Run this on a Windows PC with Python installed.
python -m pip install -r requirements.txt pyinstaller
python -m PyInstaller --onefile --name token_replay_sim src\token_replay_sim.py
echo.
echo Done. Your exe is in the dist folder: dist\token_replay_sim.exe
pause
