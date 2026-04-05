import os

files = [
    'src/app/four-qrs/householder/Scene3D.tsx',
    'src/app/four-qrs/givens/Scene3D.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    old_line = '{label === "a₁" ? "a₁" : label === "a₂" ? "a₂" : label === "a₃" ? "a₃" : label === "v" ? "v" : label}'
    new_line = '{label}'
    content = content.replace(old_line, new_line)

    with open(filepath, 'w') as f:
        f.write(content)

print("Simplified label rendering.")
