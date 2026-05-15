# Start backend and frontend in parallel for local development
Write-Host "Starting Kickoff dev servers..." -ForegroundColor Cyan

$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; pip install -r requirements.txt -q; uvicorn main:app --reload --port 8000" -PassThru
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev" -PassThru

Write-Host "Backend  → http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend → http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

Wait-Process -Id $backend.Id, $frontend.Id
