import sys
sys.path.insert(0, r'C:/Users/LarsGyrupBrinkNielsE/.commandcode/skills/gsd-path/scripts')
from discussion_validate import plan_wave_depths, archived_wave_tasks, plan_wave_criteria
from pathlib import Path
archive = Path(r'D:\projects\sandbox\angular-ai-devtools\.project')
plan_text = (archive / 'plan' / 'PLAN.md').read_text()
wave_numbers, wave_depths = plan_wave_depths(plan_text)
print('Wave numbers:', list(wave_numbers))
print('Wave depths:', dict(wave_depths))
wave_tasks = archived_wave_tasks(archive, wave_numbers)
print('Wave tasks:', wave_tasks)
wave_criteria = plan_wave_criteria(archive, plan_text, wave_tasks)
for wave, criteria in wave_criteria.items():
    print(f'Wave {wave} criteria:', criteria)
