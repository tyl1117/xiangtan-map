import re, io, sys
p = r'D:\金种子2\h5\assets\js\data.js'
s = io.open(p, encoding='utf-8').read()
geo = {
 'guju': (27.91160, 112.48948, 120),
 'tongxiang': (27.90802, 112.48475, 220),
 'jinianguan': (27.90840, 112.48691, 200),
 'nanan': (27.91204, 112.48849, 100),
 'maoshi': (27.90826, 112.48599, 150),
 'tezhi': (27.91330, 112.48790, 250),
 'dishui': (27.92170, 112.45880, 900),
 'beilin': (27.89800, 112.46450, 300),
 'daotian': (27.91135, 112.48900, 90),
}
count = 0
for pid, (lat, lng, r) in geo.items():
    pat = re.compile(r"(id: '" + pid + r"',[\s\S]*?\n(\s*)x: \d+, y: \d+, mapLabel: '[^']*',\n)")
    m = pat.search(s)
    if not m:
        print('MISS', pid); continue
    indent = m.group(2)
    line = indent + "geo: { lat: %.5f, lng: %.5f, r: %d },\n" % (lat, lng, r)
    s = s[:m.end(1)] + line + s[m.end(1):]
    count += 1
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('inserted', count)
