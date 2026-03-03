import re
import sys

def clean_jsx(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace HTML comments with JSX comments
    content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content, flags=re.DOTALL)
    
    # Fix stroke-width to strokeWidth
    content = content.replace('stroke-width', 'strokeWidth')
    
    # Fix for= to htmlFor=
    content = content.replace('for=', 'htmlFor=')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

clean_jsx('/Users/nor/Documents/BDU/Năm 2/HK2/Lâp trình web/web-du-lich/client/src/Home.jsx')
