import os

files = [
    'src/app/four-qrs/householder/Scene3D.tsx',
    'src/app/four-qrs/givens/Scene3D.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace subscript characters with standard numbers
    content = content.replace('label="a₁"', 'label="a1"')
    content = content.replace('label="a₂"', 'label="a2"')
    content = content.replace('label="a₃"', 'label="a3"')

    content = content.replace('label="e₁"', 'label="e1"')
    content = content.replace('label="e₂"', 'label="e2"')
    content = content.replace('label="e₃"', 'label="e3"')

    with open(filepath, 'w') as f:
        f.write(content)

print("Replaced subscript labels.")
