import re
import sys

def convert_to_jsx(html_content):
    # Change class to className
    jsx = re.sub(r'\bclass=', 'className=', html_content)
    # Change for to htmlFor
    jsx = re.sub(r'\bfor=', 'htmlFor=', jsx)
    # Auto-close tags like <img ...>, <input ...>, <br>, <hr>
    jsx = re.sub(r'<(img|input|br|hr)([^>]*?)(?<!/)>', r'<\1\2 />', jsx)
    # Convert onclick to onClick
    jsx = re.sub(r'\bonclick=', 'onClick=', jsx, flags=re.IGNORECASE)
    # Convert inline styles (simplistic)
    def style_replacer(match):
        style_str = match.group(1)
        styles = style_str.split(';')
        style_obj = []
        for s in styles:
            s = s.strip()
            if not s: continue
            if ':' not in s: continue
            k, v = s.split(':', 1)
            k = k.strip()
            v = v.strip().replace("'", "\\'")
            # camelCase conversion
            k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
            style_obj.append(f"{k}: '{v}'")
        return 'style={{' + ', '.join(style_obj) + '}}'
    jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)
    
    # We strip the document structure and just take the <div class="relative flex min-h-screen..."> ... and modals
    # So we'll find <div class="relative ... and </body>
    start = jsx.find('<div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">')
    end = jsx.find('<!-- Load Data -->')
    if start != -1 and end != -1:
        body_content = jsx[start:end]
    else:
        body_content = jsx # fallback

    # Add React Component template
    template = """import React, { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        // Any specific React initialization if needed
        // Note: Modal logic is still in <script> in index.html, but ideally should be managed by React state.
    }, []);

    return (
        <>
            """ + body_content + """
        </>
    );
}
"""
    return template

with open('/Users/nor/Documents/BDU/Năm 2/HK2/Lâp trình web/web-du-lich/thietkeweb_cuoiki/home.html', 'r', encoding='utf-8') as f:
    html = f.read()

jsx = convert_to_jsx(html)

with open('/Users/nor/Documents/BDU/Năm 2/HK2/Lâp trình web/web-du-lich/client/src/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)
