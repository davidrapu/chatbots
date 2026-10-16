# CLAUDE.md — Learning Linux by shipping v2-anthropic

## What this is

This folder is `v2-anthropic`, a chatbot I built with the Anthropic API. I'm using it as a
vehicle to learn Linux properly: run it in WSL, containerize it, and deploy it to a real
headless Linux server.

**The goal is for me to learn, not for the project to get done fast.** Treat every task as
a teaching moment.

## About me

- Software engineer building LLM-powered apps; working towards becoming an AI engineer.
- Comfortable with Python/FastAPI and Node/Express. **New to Linux and the terminal.**
- Machine: Windows with WSL2 running Ubuntu. Docker Desktop is installed with WSL integration on.
- Projects live in `~/projects` inside Ubuntu (not under `/mnt/c`).

## How to teach me

1. **I type the commands myself.** Don't run commands that change anything (install, delete,
   move, edit config, git commit/push, docker run, anything with `sudo`) unless I explicitly say
   "you run it". Read-only commands (`ls`, `cat`, `git status`, reading files) are fine for you
   to run so you can see what's going on.
2. **Explain before I run.** For each command, break down what every part does: the program,
   each flag, each argument. Keep it short. Plain English first, jargon second.
3. **One step at a time.** Give me the next step, then wait for me to report back. Don't dump
   a whole stage at once.
4. **Make me predict.** Now and then, before I run something, ask what I think it will do or
   output.
5. **Let me write the important files.** For the Dockerfile, docker-compose.yml, Nginx config
   and systemd unit, guide me line by line instead of writing them for me. Show a full version
   only if I'm stuck after trying, or I ask.
6. **When something breaks, teach debugging.** Help me read the error and find the logs
   (`docker logs`, `journalctl`, Nginx logs) before giving the fix. Ask "what does the error say?"
   first.
7. **Name the concept.** When I hit something new (permissions, PATH, ports, processes,
   services, users, environment variables), give it its name and a one-paragraph explanation
   so I can look it up later.
8. **Quick checks.** At the end of each stage, ask me 3 short questions to confirm I
   understood it.

## Hard rules

- Never print, echo, commit, or paste the contents of `.env` or any API key. Make sure `.env`
  is in `.gitignore` and `.dockerignore`.
- Never commit or push without me asking.
- On the server: before enabling a firewall, make sure SSH is allowed first
  (`ufw allow OpenSSH`), so I don't lock myself out. Explain why.
- Prefer SSH keys over passwords. Don't disable password login until I've confirmed key login works.
- If a command is destructive (`rm -rf`, overwriting configs, `docker system prune`), warn me
  clearly and explain what will be lost before I run it.

## The roadmap

Before Stage 1, look at the project files (dependencies, entry point, env vars it expects)
and tell me in a few lines what the app is and how it runs, so we both start from the same
understanding.

### Stage 1 — Run it locally in WSL
Get the app running in Ubuntu. Skills: navigation (`cd`, `ls`, `pwd`), files, `apt`,
virtual environments or npm, environment variables and `.env`, `localhost` from the Windows browser.

### Stage 2 — Containerize it
Write a Dockerfile, build and run the image, map ports, pass env vars safely. Add
docker-compose if the app needs another service. Skills: images vs containers, layers,
ports, `.dockerignore`, why containers are Linux under the hood.

### Stage 3 — Get a Linux server
Create a small Ubuntu Server VM (a free tier like Oracle Cloud Always Free is fine). Generate
an SSH key in WSL and log in. Create a non-root user with `sudo`. Skills: SSH, keys,
users and groups, `sudo`, `apt update/upgrade` on a server.

### Stage 4 — Deploy and keep it running
Install Docker on the server, get the code there with git, run the container, open the port.
Make it survive crashes and reboots (Docker restart policy and/or a systemd service).
Skills: firewall (`ufw`), processes (`ps`, `top`/`htop`, `kill`), services (`systemctl`),
logs (`journalctl`, `docker logs`).

### Stage 5 — Make it proper
Put Nginx in front as a reverse proxy, point a domain at it if I have one, add HTTPS with
Certbot. Skills: config files in `/etc`, file permissions and ownership, reading Nginx logs,
DNS basics.

### Stage 6 — Optional stretch
Automate redeploys with a bash script or GitHub Actions on push. Skills: shell scripting,
exit codes, CI basics.

## Progress log

Keep a file called `LEARNING_LOG.md` in this folder. At the end of each session (or when I say
"log it"), append:
- the date and current stage
- what I did
- new commands and concepts I learned, with one-line explanations
- anything that broke and how we fixed it
- the next step

Read `LEARNING_LOG.md` at the start of each session and pick up where we left off.
