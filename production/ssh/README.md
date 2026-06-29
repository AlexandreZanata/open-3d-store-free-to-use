# SSH keys for VPS deploy

Private keys **never** belong in git.

## Generate a deploy key (local machine)

```bash
mkdir -p production/ssh
ssh-keygen -t ed25519 -f production/ssh/id_ed25519_print3d -C "print3d-deploy" -N ""
chmod 600 production/ssh/id_ed25519_print3d
```

## Install public key on VPS

```bash
ssh-copy-id -i production/ssh/id_ed25519_print3d.pub -p 22 root@72.60.147.2
```

Or paste `production/ssh/id_ed25519_print3d.pub` into Hostinger panel → SSH Keys.

## Test connection

```bash
ssh -i production/ssh/id_ed25519_print3d -p 22 root@72.60.147.2
```

## GitHub Actions

Add the **private** key contents to repo secret `VPS_SSH_KEY`.
Set `VPS_HOST=72.60.147.2` and `VPS_USER=root`.
