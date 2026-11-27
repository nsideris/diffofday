"""Stop a commit or push that contains private words or secrets.

Private words come from a file outside this repository (DIFFOFDAY_GUARD or
~/.config/diffofday/guard-patterns.txt). Without that file the guard fails.
"""
import os
import re
import subprocess
import sys
from pathlib import Path

SECRET_PATTERNS = [
    r"gh[pousr]_[A-Za-z0-9]{20,}",
    r"github_pat_[A-Za-z0-9_]{20,}",
    r"xox[abprs]-[A-Za-z0-9-]{10,}",
    r"AKIA[0-9A-Z]{16}",
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
    r"AccountKey=",
    r"SharedAccessSignature|[?&]sig=[A-Za-z0-9%]{20,}",
    r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.",
    r"(?i)(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['\"][^'\"]{6,}",
]
CHANNEL = re.compile(r"(?<![\w&/;])#(?!x[0-9a-f]+;)[a-z][a-z0-9_-]{2,}")
SKIP = {"guard.py"}


def private_patterns():
    path = Path(os.environ.get("DIFFOFDAY_GUARD", Path.home() / ".config/diffofday/guard-patterns.txt"))
    if not path.is_file():
        sys.exit(f"guard: pattern file {path} is missing; refusing to continue")
    lines = [l.strip() for l in path.read_text(encoding="utf-8").splitlines()]
    return [re.compile(l, re.I) for l in lines if l and not l.startswith("#")]


def files_to_check():
    out = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard"],
                         capture_output=True, text=True, check=True).stdout
    return [f for f in out.splitlines() if f and f not in SKIP]


def main():
    rules = private_patterns() + [re.compile(p) for p in SECRET_PATTERNS]
    problems = []
    for name in files_to_check():
        try:
            text = Path(name).read_text(encoding="utf-8")
        except (UnicodeDecodeError, FileNotFoundError):
            continue
        for n, line in enumerate(text.splitlines(), 1):
            hits = [r.pattern for r in rules if r.search(line)]
            if name.endswith((".json", ".xml")) and CHANNEL.search(line):
                hits.append("channel name")
            if hits:
                problems.append(f"{name}:{n}: matches {len(hits)} rule(s)")
    if problems:
        print("guard: blocked\n" + "\n".join(problems))
        sys.exit(1)
    print(f"guard: ok ({len(files_to_check())} files)")


if __name__ == "__main__":
    main()
