import yaml, re, json
from pathlib import Path

primary = Path('D:/projects/sandbox/angular-ai-devtools')
project = primary / '.project' / 'archive' / '006-signal-provenance'

# Read INTENT.md to extract success criteria
intent_text = (project / 'intent' / 'INTENT.md').read_text(encoding='utf-8')

# Parse success criteria from INTENT.md
criteria = {}
in_sc = False
for line in intent_text.splitlines():
    m = re.match(r'^(\d+)\.\s+(.+)$', line)
    if m and in_sc:
        num = int(m.group(1))
        text = m.group(2).strip()
        criteria[num] = text
    if line.strip() == '## Success criteria':
        in_sc = True
    elif line.startswith('## ') and in_sc and line.strip() != '## Success criteria':
        in_sc = False

# Read PLAN.md Intent coverage table
plan_text = (project / 'plan' / 'PLAN.md').read_text(encoding='utf-8')
coverage = []
for line in plan_text.splitlines():
    m = re.match(r'^\|\s*(SC\d+)\s*\|\s*(T\d+)\s*\|\s*([^|]+?)\s*\|$', line)
    if m:
        coverage.append((m.group(1), m.group(2), m.group(3).strip()))

# Read task files
tasks = {}
for path in sorted((project / 'tasks').glob('*.md')):
    text = path.read_text(encoding='utf-8')
    fm_match = re.match(r'^---\n(.*?)\n---', text, re.DOTALL)
    if fm_match:
        fm = yaml.safe_load(fm_match.group(1))
        task_id = fm['id']
        # Extract acceptance criteria
        ac_match = re.search(r'## Acceptance criteria\n(.*?)(?=\n## |\Z)', text, re.DOTALL)
        ac_text = ac_match.group(1).strip() if ac_match else ''
        ac_items = []
        for line in ac_text.splitlines():
            m = re.match(r'^\d+\.\s+(.+)$', line.strip())
            if m:
                ac_items.append(m.group(1).strip())
        tasks[task_id] = {
            'title': fm['title'],
            'wave': fm['wave'],
            'status': fm['status'],
            'files': fm.get('files', []),
            'acceptance': ac_items,
        }

# Write output to file
out = []
out.append('=== Success Criteria ===')
for num in sorted(criteria):
    out.append(f'SC{num}: {criteria[num]}')

out.append('\n=== Intent Coverage (PLAN.md) ===')
for sc, task, ac in coverage:
    out.append(f'{sc} -> {task} (AC: {ac})')

out.append('\n=== Tasks ===')
for tid in sorted(tasks):
    t = tasks[tid]
    out.append(f'{tid}: title="{t["title"]}" wave={t["wave"]} status={t["status"]}')
    out.append(f'  files: {t["files"]}')
    out.append(f'  acceptance: {t["acceptance"]}')

out.append('\n=== Wave -> SC mapping ===')
wave_sc = {}
for sc, task, ac in coverage:
    task_info = tasks[task]
    wave = task_info['wave']
    if wave not in wave_sc:
        wave_sc[wave] = []
    wave_sc[wave].append((sc, criteria[int(sc[2:])]))

for wave in sorted(wave_sc):
    out.append(f'Wave {wave}:')
    for sc, crit in wave_sc[wave]:
        out.append(f'  {sc}: {crit[:80]}...')

Path('D:/projects/sandbox/angular-ai-devtools/scratchpad/analysis_result.txt').write_text('\n'.join(out), encoding='utf-8')
print('Done')
