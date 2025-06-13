$template = @'
export default function Page() {
  return (
    <div>
      <h1>Page</h1>
    </div>
  );
}
'@

Get-ChildItem -Path "src\app" -Filter "page.tsx" -Recurse | ForEach-Object {
    Set-Content -Path $_.FullName -Value $template
}