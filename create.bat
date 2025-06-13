mkdir src\app\projects\all
mkdir src\app\projects\new
mkdir src\app\projects\starred
mkdir src\app\projects\tags

mkdir src\app\docs\auto-gen
mkdir src\app\docs\manual
mkdir src\app\docs\export

mkdir src\app\snippets\all
mkdir src\app\snippets\reusable
mkdir src\app\snippets\scripts
mkdir src\app\snippets\pinned

mkdir src\app\search

mkdir src\app\ai\ask
mkdir src\app\ai\suggestions

mkdir src\app\tools\sandbox
mkdir src\app\tools\templates
mkdir src\app\tools\starters

mkdir src\app\planner\tasks
mkdir src\app\planner\modules
mkdir src\app\planner\timeline

mkdir src\app\settings\auth
mkdir src\app\settings\snippets
mkdir src\app\settings\ai
mkdir src\app\settings\backups

type nul > src\app\layout.tsx

@REM Create page.tsx files in each directory
for /r src\app %%F in (.) do (
    type nul > "%%F\page.tsx"
)