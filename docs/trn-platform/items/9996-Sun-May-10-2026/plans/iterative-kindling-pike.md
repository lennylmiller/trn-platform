# Add nodejs_22 to shared packages

## Context
Node.js is currently commented out in the shared packages (line 124) with a note about per-project management. The user wants a system-wide default Node.js available. On macOS, nvm is installed via Homebrew, but on Linux/WSL2 there's no default Node.js at all.

## Change
In `flake.nix`, uncomment/replace the nodejs comment at line 124 with `nodejs_22`:

```nix
# Before:
# nodejs - managed per-project with shell.nix/direnv

# After:
nodejs_22    # Node.js 22 LTS (per-project versions via shell.nix/direnv)
```

## File
- `/home/nixos/code/nix-config/flake.nix` — line 124

## Verification
- `nix flake check` or rebuild to confirm no conflicts
- `node --version` should report v22.x after rebuild
