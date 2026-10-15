#!/usr/bin/env python3
"""Витягує зображення з assets.js оригінального React-проєкту (base64) у файли
resources/img/** і генерує resources/mandat.qrc.

Використання:
    python3 tools/extract_assets.py <шлях до mandate-react/src/assets.js>
"""
import base64
import os
import re
import sys

DATA = r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+'


def split_exports(text):
    """assets.js = кілька `export const NAME=...` блоків."""
    out = {}
    parts = re.split(r'^export const (\w+)=', text, flags=re.M)
    for i in range(1, len(parts), 2):
        out[parts[i]] = parts[i + 1]
    return out


def save(dst_no_ext, data_uri):
    head, b64 = data_uri.split(',', 1)
    kind = head.split('/')[1].split(';')[0]
    ext = {'jpeg': 'jpg', 'png': 'png', 'webp': 'webp'}[kind]
    path = dst_no_ext + '.' + ext
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(base64.b64decode(b64))
    return path


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.normpath(os.path.join(here, '..', 'resources'))
    blocks = split_exports(open(sys.argv[1], encoding='utf-8').read())
    files = []

    # IMG: плоский словник name -> data URI
    for m in re.finditer(r'"([\w\-]+)"\s*:\s*"(' + DATA + ')"', blocks['IMG']):
        files.append(save(os.path.join(root, 'img', m.group(1)), m.group(2)))

    # CHARS: m0..f4 -> масив портретів
    for km in re.finditer(r'"?([mf]\d)"?\s*:\s*\[(.*?)\]', blocks['CHARS'], re.S):
        key = km.group(1)
        for n, im in enumerate(re.finditer(r'"(' + DATA + ')"', km.group(2))):
            files.append(save(os.path.join(root, 'img', 'chars', '%s_%02d' % (key, n)), im.group(1)))

    # CHAR_HQ: m0 -> { podium: ..., ... }
    for km in re.finditer(r'\b([mf]\d)\s*:\s*\{(.*?)\}', blocks['CHAR_HQ'], re.S):
        key = km.group(1)
        for im in re.finditer(r'"([\w\-]+)"\s*:\s*"(' + DATA + ')"', km.group(2)):
            files.append(save(os.path.join(root, 'img', 'hq', '%s_%s' % (key, im.group(1))), im.group(2)))

    rels = sorted(os.path.relpath(p, root).replace(os.sep, '/') for p in files)
    with open(os.path.join(root, 'mandat.qrc'), 'w', encoding='utf-8') as q:
        q.write('<RCC>\n  <qresource prefix="/">\n')
        for r in rels:
            q.write('    <file>%s</file>\n' % r)
        q.write('  </qresource>\n</RCC>\n')
    total = sum(os.path.getsize(os.path.join(root, r)) for r in rels)
    print('files: %d, bytes: %d' % (len(rels), total))


if __name__ == '__main__':
    main()
