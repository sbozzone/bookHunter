---
description: Test, build, commit, push, and open a draft PR in one step.
---

Ship the current working changes safely. Do NOT skip the checks.

1. Run `npm run typecheck`, then `npm run build`. If either fails, STOP
   immediately and report the errors — do not commit or push.
2. Make sure you are on a feature branch, not `worked`. If on `worked`, create
   a branch named `claude/<short-description>` first.
3. Stage all changes and commit. Use this commit message: $ARGUMENTS
   (If no message was provided, write a concise message summarizing the diff.)
4. Push with `git push -u origin <current-branch>` (retry on transient network
   errors).
5. If there is no open pull request for this branch yet, open one as a **draft**
   against `worked`, with a short description of what changed and how it was
   verified.
6. Report the pull request link.
