import io
import os
import re
import subprocess

repo = r"D:\projects\sandbox\angular-ai-devtools"

def out(*a):
    return subprocess.run(["git"] + list(a), cwd=repo, capture_output=True, text=True).stdout

subprocess.run(["git", "add", "-A"], cwd=repo)
subprocess.run(["git", "commit", "-m", "plan: T008 approved"], cwd=repo, capture_output=True)
head = out("rev-parse", "HEAD").strip()
print("base for T008", head[:8])

tf = ".project/tasks/T008-copy-the-fixture-install.md"
p = repo + "\\" + tf.replace("/", "\\")
t = io.open(p, encoding="utf-8").read()
t = re.sub(r"^status: .*$", "status: done", t, count=1, flags=re.M)
t = re.sub(r"^base: .*$", "base: " + head, t, count=1, flags=re.M)
t = re.sub(r"^agent: .*$", "agent: orchestrator-serial", t, count=1, flags=re.M)
t = re.sub(r"^worktree: .*$", "worktree: null", t, count=1, flags=re.M)
t = t.rstrip("\n") + (
    "\n- 2026-11-08 - implemented serially. `ensure-sidecar-deps.mjs` now copies the fixture install with "
    "`cpSync(..., { recursive: true, dereference: false })` instead of bridging it, so the fixture's own relative symlink "
    "survives and resolves inside the sidecar. T007's junction made every path below the fixture resolve into the primary, "
    "which is why three peer-resolution assertions compared two different roots. Guarded: only when the primary has the "
    "install and the sidecar does not, and never over an existing directory. Verified by the project Verify running in a real "
    "sidecar, which is the case that failed. Verdict: ready.\n"
)
io.open(p, "w", encoding="utf-8", newline="\n").write(t)

landing = [tf, "scripts/ensure-sidecar-deps.mjs"]
for q in landing:
    subprocess.run(["git", "add", "--", q], cwd=repo)
msg = (
    "T008: Copy the fixture install into a verify sidecar\n\n"
    "Task: " + tf + "\nBase: " + head + "\nFiles:\n"
    + "".join("- " + q + "\n" for q in landing)
)
f = os.path.join(os.environ["TEMP"], "t8m36.txt")
io.open(f, "w", encoding="utf-8", newline="\n").write(msg)
r = subprocess.run(["git", "commit", "-F", f], cwd=repo, capture_output=True, text=True)
print("landing rc", r.returncode)
subprocess.run(["git", "add", "-A"], cwd=repo)
subprocess.run(["git", "commit", "-m", "state: T008 landed"], cwd=repo, capture_output=True)

new_head = out("rev-parse", "HEAD").strip()
fp = repo + r"\.project\review\FINAL.md"
ft = io.open(fp, encoding="utf-8").read()
ft = re.sub(r"^Reviewed HEAD: .*$", "Reviewed HEAD: " + new_head, ft, count=1, flags=re.M)
io.open(fp, "w", encoding="utf-8", newline="\n").write(ft)
print("FINAL pinned to", new_head)
