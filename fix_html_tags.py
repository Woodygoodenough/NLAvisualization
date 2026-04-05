import os

files = [
    'src/app/four-qrs/householder/Scene3D.tsx',
    'src/app/four-qrs/givens/Scene3D.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace the Text component with Html component
    old_text_block = """        <Text
          position={[0, 0, 0]}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {label}
        </Text>"""

    new_html_block = """        <Html position={[0, 0, 0]} center>
          <div style={{ color: color, fontSize: '1.2rem', fontWeight: 'bold', textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white', userSelect: 'none' }}>
            {label === "a₁" ? "a₁" : label === "a₂" ? "a₂" : label === "a₃" ? "a₃" : label === "v" ? "v" : label}
          </div>
        </Html>"""

    content = content.replace(old_text_block, new_html_block)

    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed Html tags in Scene3D files.")
