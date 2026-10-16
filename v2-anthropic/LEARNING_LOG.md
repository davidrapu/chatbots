# Learning Log

## 2026-10-15 — Stage 1: Run it locally in WSL ✅

### What I did
- Moved `.env` (recreated by hand, since it's gitignored) from `v2-anthropic/` into `chatbot/`, next to
  `compose.yaml`, and locked it down with `chmod 600`
- Installed `python3-venv` with apt, created `chatbot/.venv`, activated it
- Wrote `chatbot/requirements.txt` (there wasn't one) from the project's imports, with CPU-only torch
- Updated Docker Desktop 4.55.0 → 4.95.0 (was ~10 months / ~40 releases behind, missing security fixes)
- Started Postgres with `docker compose up -d`; it reused the `chatbot_pgdata` volume from Windows, and
  all 46 FAQ chunks were still there
- Ran the backend with `fastapi dev main.py` and tested `/chat/stream` from `/docs`
- Installed nvm and Node v26.12.0, created `frontend/.env`, ran `npm install` and `npm run dev`
- Full app working: widget at `http://localhost:5173` streams replies from the backend

### Commands
- `pwd`: print the current directory
- `cd <dir>`, `cd ..`: change directory / go up one level
- `ls -la`: list all files (including hidden dotfiles) in long format
- `mv <src> <dest>`: move or rename. If dest is an existing folder, the file goes inside it. Overwrites
  silently
- `chmod 600 <file>`: owner read/write, nobody else. `chmod +x` adds execute
- `cat <file>`: print a file. `cat -A` shows hidden chars (`$` line end, `^M` Windows CR, `^I` tab)
- `sudo <cmd>`: run one command as root (asks for my own password, typing is invisible)
- `sudo apt update`: refresh the package list (`Hit:` unchanged, `Get:` downloaded). Installs nothing
- `sudo apt install <pkg>`: install a package plus its dependencies
- `python3 -m venv .venv` / `source .venv/bin/activate`: create / activate a virtual environment
- `which <cmd>`: show which file on PATH a command name runs
- `pip install -r requirements.txt [--resume-retries 5]`: install from a file, resuming dropped downloads
- `docker version`: shows Client (CLI) and Server (daemon)
- `docker compose up -d`: create and start services in the background
- `docker compose exec db psql -U postgres -d "vector db" -c "..."`: run SQL inside the DB container
- `docker compose down` removes containers. `down -v` **also deletes volumes (all data)**
- `du -sh <dir>`: total size of a folder
- `curl -o- <url> | bash`: download a script and run it (only for URLs I trust)
- `npm install`, `npm run dev`: install from package.json/lock; run a script from package.json

### Concepts
- **Absolute vs relative paths**: `/` starts at the filesystem root; otherwise it's from where I am.
  `.` = here, `..` = up one
- **Hidden files**: names starting with `.`
- **Permissions**: `-rw-r--r--` = type + owner/group/others × read/write/execute. Digits: r=4 w=2 x=1
- **Environment variables**: named values a process reads at runtime. `.env` is a convenience that
  `load_dotenv()` reads. Linux itself doesn't know about it
- **Package manager (apt)**: installs from Ubuntu's repositories and resolves dependencies
  (`python3-venv` pulled in 3 packages)
- **Virtual env**: per-project Python + packages. Ubuntu blocks pip on the system Python
  (`externally-managed-environment`)
- **PATH**: folders the shell searches for commands. Activating a venv puts `.venv/bin` first. It only
  lasts for that terminal session
- **requirements.txt is read by pip, not the shell**: no quotes around `pkg[extra]`. Quotes are only
  needed in shell commands
- **`--index-url` replaces PyPI, `--extra-index-url` adds to it**. CPU torch (`+cpu`) comes from
  PyTorch's own index. Later: pin versions so it can't fall back to the CUDA build
- **Caches**: `~/.cache/pip` and `~/.cache/huggingface` are per user and shared across projects. Each
  venv still gets its own unpacked copy
- **Binaries are OS-specific**: the Windows `uv.exe` can't build a Linux venv
- **Docker daemon vs CLI**: Docker Desktop runs one daemon. Windows and WSL are both clients, so they
  see the same containers and volumes
- **Compose project name** = folder name, which is why WSL reused `chatbot-db-1` and `chatbot_pgdata`
- **Containers are disposable, volumes persist**. Changing a mount recreates the container. Init scripts
  only run on an empty data directory
- **Port mapping**: `0.0.0.0:5433->5432` = host port → container port
- **CVE**: public ID for a known security flaw. Updates that fix CVEs are the ones that matter most
- **WSL localhost forwarding**: Windows can reach servers in Ubuntu via `localhost`
- **fastapi dev runs two processes**: reloader + server, which is why the model loads twice
- **apt vs nvm**: apt = one system-wide version, patched by Ubuntu, needs sudo. nvm = per user, any
  version, no sudo. nvm is a shell function loaded by `~/.bashrc`, so `which nvm` finds nothing and
  scripts/services can't see it
- **LTS**: even Node versions become long-term support. Prefer LTS for projects
- **`curl | bash`**: runs a downloaded script unseen, so only do it with trusted URLs
- **`VITE_` variables are public**: they are copied into the browser bundle. Never put secrets there
- **CORS preflight**: cross-origin JSON + credentials → browser sends `OPTIONS` first, and
  `CORSMiddleware` answers it

### What broke and how we fixed it
- `.env` missing after cloning: it's gitignored by design. Recreated it by hand
- `.env` in the wrong folder: Python would find it (`load_dotenv` searches upward), but Compose only
  reads `.env` next to `compose.yaml`. Moved it
- `python3 -m venv` unavailable: installed `python3-venv`
- Quotes in requirements.txt: removed them
- Torch install pulled the CUDA build from PyPI and timed out: the edit to requirements.txt hadn't been
  saved. Spotted it from `(from sentence-transformers ... line 6)` and the PyPI URL. Re-added the CPU
  index and used `--resume-retries`
- `docker` not found in WSL: enabled WSL integration in Docker Desktop
- `frontend/.env` missing: created it with `VITE_CHATBOT_API=http://localhost:8000`

### Loose ends
- Add `.env.example` files (variable names, no values)
- Pin versions in requirements.txt (`pip freeze`)
- `sendUserMessage()` in `frontend/src/services/sendUserMessage.ts` still calls the deleted `/chat`
  endpoint (dead code?)
- Before deploying: consider `fastembed` (ONNX) instead of sentence-transformers + torch to cut size/RAM
- The MiniLM model downloads at runtime: decide where that happens in Docker

### Next step
Stage 2: containerize. Start with `chatbot/.dockerignore` (must include `.env` and `.venv`), then write
the backend Dockerfile line by line.

## 2026-10-16 — Stage 2: Containerize it ✅

### What I did
- Wrote `chatbot/.dockerignore` (secrets `.env*`, `.venv`, `__pycache__`, tests/judge/results, docs, Dockerfile)
- Wrote the backend `Dockerfile`: `python:3.14-slim` → requirements → `pip install --no-cache-dir` → bake
  the MiniLM model in with a `RUN python -c ...` step → `COPY . .` → `ENV HF_HUB_OFFLINE=1` →
  `CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0"]`. Image ~2.3 GB (mostly torch)
- Added the backend to Compose, talking to Postgres at `db:5432` via `DOCKER_DATABASE_URL`
- Made CORS origins configurable: `ALLOWED_ORIGINS` env var (comma-separated, default localhost:5173)
- Wrote `frontend/.dockerignore` and a multi-stage `frontend/Dockerfile`: `node:26-alpine AS build`
  (`npm ci`, `ARG VITE_CHATBOT_API`, `npm run build`) → `nginx:1.30.6-alpine` serving `dist/`. Final
  image ~100 MB on disk / ~29 MB compressed
- Moved `compose.yaml` and `.env` to the repo root, pinned `name: chatbot` so the `chatbot_pgdata`
  volume (and the 46 chunks) are reused. All three services start with `docker compose up -d --build`
- Updated Docker Desktop earlier in the session; site works at `http://localhost:8080`

### Commands
- `docker build -t <name> .`: build an image from the Dockerfile in `.` (the build context)
- `docker build --build-arg NAME=value ...`: supply a value for an `ARG`
- `docker build --progress=plain`: full build output instead of the collapsed view
- `docker run --rm -p 8000:8000 --env-file .env <image>`: run, publish port, load env, remove on exit
- `docker images [name]`, `docker ps -a`: list images / all containers
- `docker logs --tail 20 <container>`, `docker compose logs -f <service>`: read / follow logs
- `docker compose up -d --build`: rebuild changed images and (re)create what changed
- `docker compose start` / `stop`: start / stop existing containers without recreating
- `docker compose ps`: status of this project's services
- `docker compose config --quiet`: validate compose.yaml (never without `--quiet`: it prints secrets)
- `docker stats --no-stream`: CPU / memory / network of running containers
- `ss -ltn`: list listening TCP ports

### Concepts
- **Image vs container**: read-only template vs running instance (class vs object)
- **Containers are Linux processes** isolated by the kernel. The nginx log showed the WSL2 kernel:
  containers share the host kernel
- **Build context**: the folder sent to Docker; `COPY` can only see it. `..` can't escape it
- **`.dockerignore`**: same syntax as .gitignore. Typos fail silently (`Dokerfile`)
- **Layers and the build cache**: each `RUN`/`COPY` makes a layer; a change rebuilds that step and
  everything after. Order from least to most frequently changed. Cache is keyed by content, not image
  name, and keeps older builds too
- **`ENV` invalidates every `RUN` after it** (pip reran for 10 min twice). Runtime-only `ENV` goes near
  `CMD`. `CMD`, `ENV`, `WORKDIR` are metadata, not filesystem layers
- **Base image variants**: full (~1 GB, compilers) vs `-slim` vs `-alpine` (musl, breaks manylinux
  Python wheels). Pin at least the minor version; `latest`/`alpine` float
- **Registry**: Docker Hub is the default; pulled images are cached locally
- **Exec-form `CMD ["prog", "arg"]`**: each argument its own string; no shell, so signals reach the app
- **PID 1**: the app is PID 1 in its container; when it exits the container stops; `docker stop`
  sends SIGTERM to it
- **Bind address**: `127.0.0.1` = loopback only (unreachable from outside a container); `0.0.0.0` = all
  interfaces
- **Docker networks**: Compose creates one per project; containers reach each other by service name on
  the container port (`db:5432`). Published ports are only for traffic from outside. Container IPs
  (172.18.x.x) are private and change
- **`localhost` depends on where the code runs**: WSL → laptop; container → itself; browser → the
  visitor's machine
- **Env vars are set at container creation**: `restart` keeps the old env; `up -d` recreates
- **`environment:` overrides `env_file:`** in Compose; `${VAR}` substitution reads `.env` next to
  compose.yaml
- **Compose project name** = folder name unless `name:` is set (moving the file would have created an
  empty volume)
- **Output buffering**: Python buffers stdout when it isn't a TTY → `ENV PYTHONUNBUFFERED=1`
- **TTY**: an interactive terminal; progress bars and colours only appear on one
- **"Up" ≠ ready**: the process can run before the app is listening (health checks solve this)
- **Bake runtime downloads into the image**: model downloaded at build, `HF_HUB_OFFLINE=1` at runtime
  → 16 s startup, no Hugging Face dependency, embeddings can't silently change model version
- **Chained exceptions**: "direct cause of the following exception" → read the end of the first traceback
- **Multi-stage builds**: build with Node, `COPY --from=build` into Nginx; only the last stage ships
- **Build time vs run time**: `VITE_` values are text-substituted into JS at build. `--env-file`/restart
  can't change them; a new value needs a rebuild
- **`ARG` (Dockerfile, the parameter + default) and `build.args` (compose, the argument)** are two halves
  of one mechanism. An explicitly passed empty value overrides the default
- **CORS origin** = scheme + host + port; `:5173` and `:8080` are different origins
- **Config at runtime, not in code**: `ALLOWED_ORIGINS` env var instead of a hard-coded list
- **No warnings is the bar**, not "valid"
- **`npm ci`** installs exactly from package-lock.json; `npm i` may change it

### What broke and how we fixed it
- `COPY ..` (missing space) → "COPY needs a destination"; then `COPY .. .` → should be `COPY . .`
- Built from `frontend/` → "open Dockerfile: no such file or directory": wrong current directory
- Backend container → `Connection refused` to `localhost:5433`: localhost is the container itself.
  Used `db`, then fixed the port from 5433 to 5432
- `build: ./chatbot` inside chatbot/ → paths are relative to compose.yaml (correct again after the move)
- `/docs` "Failed to fetch": the app wasn't listening yet while the model downloaded
- No "startup complete" in logs: output buffering → `PYTHONUNBUFFERED=1`
- `HF_HUB_OFFLINE=1` above the model step → build failed ("outgoing traffic has been disabled") and pip
  reran. Moved it above `CMD`
- `CMD ["python", "fastapi dev"]` → one string per argument, `fastapi run`, no `python`
- CORS error from `:8080` → `ALLOWED_ORIGINS`
- Compose frontend: `args` outside `build`, wrong ARG name, runtime env for a build-time value, port
  `5173:5173` / `8080:8080` instead of `8080:80`, empty `${VITE_CHATBOT_API}` overriding the default

### Loose ends
- Before Stage 4: `VITE_CHATBOT_API` and `ALLOWED_ORIGINS` must change to the server's address
  (rebuild the frontend with the new arg)
- Optional hardening: `.strip()` and drop empty items when parsing `ALLOWED_ORIGINS`
- Remove the debug `print("Allowed origins: ...")` from main.py
- `nginx:1.30.6-alpine` is pinned to a patch: bump it by hand, or use `1.30-alpine`
- Optional: pip cache mount (`RUN --mount=type=cache,target=/root/.cache/pip ...`)
- Backend image is 2.3 GB: consider fastembed/ONNX instead of torch before deploying
- Still open from Stage 1: `.env.example`, pin requirements, dead `sendUserMessage()` /chat call
- Later (Stage 5): Nginx proxies `/api` to the backend → no absolute URL and no CORS
- Health checks, so "Up" means "ready"

### Next step
Stage 3: create a small Ubuntu Server VM (e.g. Oracle Cloud Always Free), generate an SSH key in WSL,
log in, and create a non-root sudo user.
