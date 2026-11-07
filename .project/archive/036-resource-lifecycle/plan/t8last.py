import io
import os
import re
import subprocess

repo = r"D:\projects\sandbox\angular-ai-devtools"

def git(*a):
    return subprocess.run(["git"] + list(a), cwd=repo, capture_output=True, text=True)

def out(*a):
    return git(*a).stdout

head = out("rev-parse", "HEAD").strip()
print("HEAD", head[:8], out("log", "-1", "--format=%s").strip())

tf = ".project/tasks/T008-copy-the-fixture-install.md"
tp = repo + "\\" + tf.replace("/", "\\")
current = io.open(tp, encoding="utf-8").read()

log_line = (
    "- 2026-11-08 - implemented serially. `ensure-sidecar-deps.mjs` copies the fixture install with "
    "`cpSync(..., { recursive: true, dereference: false })` instead of bridging it, so the fixture's own relative "
    "symlink survives and resolves inside the sidecar. T007's junction made every path below the fixture resolve into "
    "the primary, which is why three peer-resolution assertions compared two different roots. Guarded: only when the "
    "primary has the install and the sidecar does not. Verify: facade 8/8, ng-context 10/10, recorded. Verdict: ready.\n"
)
t = re.sub(r"^status: .*$", "status: done", current, count=1, flags=re.M)
t = re.sub(r"^base: .*$", "base: " + head, t, count=1, flags=re.M)
t = re.sub(r"^agent: .*$", "agent: orchestrator-serial", t, count=1, flags=re.M)
t = re.sub(r"^worktree: .*$", "worktree: null", t, count=1, flags=re.M)
if "2026-11-08 - implemented serially" not in t:
    t = t.rstrip("\n") + "\n" + log_line
io.open(tp, "w", encoding="utf-8", newline="\n").write(t)

# The implementation reached an earlier commit, so this landing commit carries the task record only.
landing = [tf]
git("add", "--", tf)
staged = [q for q in out("diff", "--cached", "--name-only").splitlines() if q.strip()]
print("staged:", staged)
assert staged == [tf], staged
msg = (
    "T008: Copy the fixture install into a verify sidecar\n\n"
    "Task: " + tf + "\nBase: " + head + "\nFiles:\n"
    + "".join("- " + q + "\n" for q in landing)
)
f = os.path.join(os.environ["TEMP"], "t8fin2.txt")
io.open(f, "w", encoding="utf-8", newline="\n").write(msg)
print("landing rc", git("commit", "-F", f).returncode)

git("add", "-A")
print("state rc", git("commit", "-m", "state: T008 landed and M036 at ship").returncode)

new_head = out("rev-parse", "HEAD").strip()
fp = repo + r"\.project\review\FINAL.md"
ft = io.open(fp, encoding="utf-8").read()
ft = re.sub(r"^Reviewed HEAD: .*$", "Reviewed HEAD: " + new_head, ft, count=1, flags=re.M)
io.open(fp, "w", encoding="utf-8", newline="\n").write(ft)
print("FINAL pinned to", new_head)
