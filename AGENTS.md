# Agent instructions (maksit-webui)

Read **[maksit-webui](E:\Users\maksym\source\repos\private\homelab\ai\skills\common\maksit-webui\SKILL.md)** before changing `src/` library source or shared npm packages. It covers alignment with **MaksIT.Core**, **maksit-identity-hub**, **maksit-results**, and product backends.

Complementary skills (no precedence):

| Skill | Path |
|-------|------|
| maksit-webui | [SKILL.md](E:\Users\maksym\source\repos\private\homelab\ai\skills\common\maksit-webui\SKILL.md) |
| react-typescript | [SKILL.md](E:\Users\maksym\source\repos\private\homelab\ai\skills\common\react-typescript\SKILL.md) |
| maksit-repo-maintenance | [SKILL.md](E:\Users\maksym\source\repos\private\homelab\ai\skills\common\maksit-repo-maintenance\SKILL.md) |
| local-ollama | [SKILL.md](E:\Users\maksym\source\repos\private\homelab\ai\skills\local-ollama\SKILL.md) |

Manifest: `.cursor/maksit-skills.json`.

**Shortcuts:** `c:\Users\maksym\Desktop\maksit-core.lnk`, `c:\Users\maksym\Desktop\maksit-identity-hub.lnk`

**Build rule:** after editing `src/` library source (`contracts/`, `core/`, `components/`), run `npm run build` in `src/` before typechecking consumers.
