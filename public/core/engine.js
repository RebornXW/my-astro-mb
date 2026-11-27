/**
 * LumenBox Core Engine (Pure Logic Layer - Zero DOM Dependencies)
 * Compatible with Browser (<script src="./core/engine.js">) and CommonJS / WeChat / Douyin / Xiaohongshu Mini-Programs.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LumenBoxEngine = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function () {
  "use strict";

  const SPOT_DIRS = { "^": [-1, 0], "v": [1, 0], "<": [0, -1], ">": [0, 1] };
  const TARGET_BOXES = new Set(["B", "C", "F"]);
  const DYNAMIC_KINDS = new Set(["B", "C", "F", "L", "\\", "/", "^", "v", "<", ">"]);
  const DIRS4 = [
    { dr: -1, dc: 0, dir: "up", sym: "↑" },
    { dr: 1, dc: 0, dir: "down", sym: "↓" },
    { dr: 0, dc: -1, dir: "left", sym: "←" },
    { dr: 0, dc: 1, dir: "right", sym: "→" }
  ];
  const optimalCache = new Map();

  function parseMap(gridRows) {
    const rows = gridRows.length;
    const cols = gridRows[0].length;
    const walls = [], suns = [], iceWalls = [], treeWalls = [], goals = [], entities = [];
    let player = null, eid = 1;

    for (let r = 0; r < rows; r++) {
      const wRow = [];
      for (let c = 0; c < cols; c++) {
        const ch = gridRows[r][c] || ".";
        wRow.push(ch === "#");
        if (ch === "S") suns.push({ r, c });
        else if (ch === "I") iceWalls.push({ r, c });
        else if (ch === "V") treeWalls.push({ r, c });
        else if (ch === "X") goals.push({ r, c });
        else if (ch === "P") player = { r, c, dir: "right" };
        else if (DYNAMIC_KINDS.has(ch)) entities.push({ id: eid++, kind: ch, r, c });
      }
      walls.push(wRow);
    }
    return { staticMap: { rows, cols, walls, suns, iceWalls, treeWalls, goals }, dynState: { player, entities } };
  }

  function cloneDyn(dyn) {
    return {
      player: dyn.player ? { r: dyn.player.r, c: dyn.player.c, dir: dyn.player.dir } : null,
      entities: dyn.entities.map(e => ({ id: e.id, kind: e.kind, r: e.r, c: e.c }))
    };
  }

  function isEntitySuppressed(dyn, ent) {
    if (dyn.player && dyn.player.r === ent.r && dyn.player.c === ent.c) return true;
    return dyn.entities.some(o => {
      if (o.id === ent.id || o.r !== ent.r || o.c !== ent.c) return false;
      const alwaysSolid = o.kind === "B" || o.kind === "L" || o.kind === "\\" || o.kind === "/" || Boolean(SPOT_DIRS[o.kind]);
      return alwaysSolid || (o.kind === ent.kind && o.id < ent.id);
    });
  }

  function isEntitySolid(dyn, lit, ent) {
    if (ent.kind === "B" || ent.kind === "L" || ent.kind === "\\" || ent.kind === "/" || SPOT_DIRS[ent.kind]) return true;
    if (isEntitySuppressed(dyn, ent)) return false;
    if (ent.kind === "C") return !lit[ent.r][ent.c];
    if (ent.kind === "F") return lit[ent.r][ent.c];
    return false;
  }

  function isTerrainSuppressed(dyn, lit, r, c) {
    if (dyn.player && dyn.player.r === r && dyn.player.c === c) return true;
    return dyn.entities.some(e => e.r === r && e.c === c && ((e.kind !== "C" && e.kind !== "F") || isEntitySolid(dyn, lit, e)));
  }

  function solidEntityAt(dyn, lit, r, c) {
    return dyn.entities.find(e => e.r === r && e.c === c && isEntitySolid(dyn, lit, e)) || null;
  }

  function computeLighting(staticMap, dyn, includeVisuals = false, disabledMirrorId = null) {
    const { rows, cols, walls, suns, treeWalls } = staticMap;
    const lit = Array.from({ length: rows }, () => Array(cols).fill(false));
    const beams = includeVisuals ? [] : null;
    const hitMirrors = includeVisuals ? new Set() : null;
    const blockers = includeVisuals ? [] : null;
    const effectiveMirrorHits = includeVisuals ? new Map() : null;

    function trace(sr, sc, dr, dc, depth) {
      if (depth > 14) return;
      let r = sr + dr, c = sc + dc, er = sr, ec = sc, moved = false;
      let endType = "edge";

      while (r >= 0 && r < rows && c >= 0 && c < cols) {
        if (walls[r][c] || suns.some(s => s.r === r && s.c === c)) {
          endType = "wall";
          break;
        }
        lit[r][c] = true;
        er = r; ec = c; moved = true;

        if (dyn.player && dyn.player.r === r && dyn.player.c === c) {
          if (includeVisuals) blockers.push({ r, c, dr, dc, kind: "P" });
          endType = "blocker";
          break;
        }

        let blocked = false, blockKind = null, mirror = null;
        for (let i = 0; i < dyn.entities.length; i++) {
          const e = dyn.entities[i];
          if (e.r !== r || e.c !== c) continue;
          if (e.kind === "B" || e.kind === "L" || SPOT_DIRS[e.kind]) {
            blocked = true; blockKind = e.kind; break;
          }
          if (e.kind === "F" && !isEntitySuppressed(dyn, e)) {
            blocked = true; blockKind = "F"; break;
          }
          if (e.kind === "\\" || e.kind === "/") {
            if (disabledMirrorId !== null && e.id === disabledMirrorId) {
              blocked = true; blockKind = "B"; break;
            }
            mirror = e;
          }
        }
        if (blocked) {
          if (includeVisuals) blockers.push({ r, c, dr, dc, kind: blockKind });
          endType = "blocker";
          break;
        }

        if (mirror) {
          const ndr = mirror.kind === "\\" ? dc : -dc;
          const ndc = mirror.kind === "\\" ? dr : -dr;
          if (includeVisuals) {
            hitMirrors.add(mirror.id);
            beams.push({ r1: sr, c1: sc, r2: r, c2: c, endType: "mirror" });
            const nr1 = r + ndr, nc1 = c + ndc;
            if (nr1 >= 0 && nr1 < rows && nc1 >= 0 && nc1 < cols && !walls[nr1][nc1] && !suns.some(s => s.r === nr1 && s.c === nc1)) {
              if (!effectiveMirrorHits.has(mirror.id)) effectiveMirrorHits.set(mirror.id, new Set());
              effectiveMirrorHits.get(mirror.id).add(`${r},${c}->${ndr},${ndc}`);
            }
          }
          trace(r, c, ndr, ndc, depth + 1);
          return;
        }
        if (treeWalls.some(w => w.r === r && w.c === c)) {
          if (includeVisuals) blockers.push({ r, c, dr, dc, kind: "V" });
          endType = "blocker";
          break;
        }
        r += dr; c += dc;
      }
      if (includeVisuals && moved) {
        const ext = endType === "wall" ? 0.56 : (endType === "edge" ? 0.5 : 0);
        beams.push({ r1: sr, c1: sc, r2: er + dr * ext, c2: ec + dc * ext, endType });
      }
    }

    for (let i = 0; i < suns.length; i++) {
      const s = suns[i];
      lit[s.r][s.c] = true;
      for (let d = 0; d < 4; d++) trace(s.r, s.c, DIRS4[d].dr, DIRS4[d].dc, 0);
    }

    for (let i = 0; i < dyn.entities.length; i++) {
      const e = dyn.entities[i];
      if (e.kind === "L") {
        lit[e.r][e.c] = true;
        for (let d = 0; d < 4; d++) trace(e.r, e.c, DIRS4[d].dr, DIRS4[d].dc, 0);
      } else if (SPOT_DIRS[e.kind]) {
        lit[e.r][e.c] = true;
        const [sdr, sdc] = SPOT_DIRS[e.kind];
        trace(e.r, e.c, sdr, sdc, 0);
      }
    }

    return { lit, beams, hitMirrors, blockers, effectiveMirrorHits };
  }

  function isCellBlocked(staticMap, dyn, lit, r, c) {
    if (r < 0 || r >= staticMap.rows || c < 0 || c >= staticMap.cols) return true;
    if (staticMap.walls[r][c]) return true;
    if (staticMap.suns.some(s => s.r === r && s.c === c)) return true;
    if (staticMap.iceWalls.some(w => w.r === r && w.c === c) && !lit[r][c] && !isTerrainSuppressed(dyn, lit, r, c)) return true;
    if (staticMap.treeWalls.some(w => w.r === r && w.c === c) && lit[r][c] && !isTerrainSuppressed(dyn, lit, r, c)) return true;
    return false;
  }

  function stepState(staticMap, dyn, lit, dr, dc, dir, disabledMirrorId = null) {
    if (!dyn.player) return null;
    const nr = dyn.player.r + dr, nc = dyn.player.c + dc;
    if (isCellBlocked(staticMap, dyn, lit, nr, nc)) return null;

    const ent = solidEntityAt(dyn, lit, nr, nc);
    if (ent) {
      const br = nr + dr, bc = nc + dc;
      if (isCellBlocked(staticMap, dyn, lit, br, bc) || solidEntityAt(dyn, lit, br, bc)) return null;
      if ((ent.kind === "C" || ent.kind === "F") && dyn.entities.some(o => o.r === br && o.c === bc && o.kind === ent.kind)) return null;
    }

    const nextDyn = cloneDyn(dyn);
    nextDyn.player.r = nr; nextDyn.player.c = nc; nextDyn.player.dir = dir;
    if (ent) {
      const target = nextDyn.entities.find(x => x.id === ent.id);
      target.r = nr + dr; target.c = nc + dc;
    }

    const nextLight = computeLighting(staticMap, nextDyn, false, disabledMirrorId);
    return {
      dyn: nextDyn,
      lit: nextLight.lit,
      pushed: Boolean(ent),
      pushedId: ent ? ent.id : null,
      pushedKind: ent ? ent.kind : null
    };
  }

  function countLockedGoals(staticMap, dyn, lit) {
    let cnt = 0;
    for (let i = 0; i < staticMap.goals.length; i++) {
      const g = staticMap.goals[i];
      const e = solidEntityAt(dyn, lit, g.r, g.c);
      if (e && TARGET_BOXES.has(e.kind)) cnt++;
    }
    return cnt;
  }

  function isWon(staticMap, dyn, lit) {
    return staticMap.goals.length > 0 && countLockedGoals(staticMap, dyn, lit) === staticMap.goals.length;
  }

  function encodeState(dyn) {
    const parts = dyn.entities.map(e => `${e.kind}${e.r},${e.c}`);
    parts.sort();
    return `${dyn.player.r},${dyn.player.c}|${parts.join(";")}`;
  }

  function nowMs() {
    return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  }

  /* =========================================================================
     Game Runtime Solvers (Deadlock Check / Hint / Optimal Steps)
     ========================================================================= */
  function solveFromState(staticMap, initDyn, maxStates = 45000, maxMs = 400) {
    const t0 = nowMs();
    const initLit = computeLighting(staticMap, initDyn, false).lit;
    if (isWon(staticMap, initDyn, initLit)) return { solved: true, path: [], timedOut: false };
    const visited = new Set([encodeState(initDyn)]);
    const queue = [{ dyn: initDyn, lit: initLit, parent: -1, mvIdx: -1 }];
    let head = 0;
    while (head < queue.length && visited.size < maxStates) {
      if ((head & 63) === 0 && nowMs() - t0 > maxMs) return { solved: false, timedOut: true };
      const cur = queue[head];
      for (let d = 0; d < 4; d++) {
        const mv = DIRS4[d];
        const res = stepState(staticMap, cur.dyn, cur.lit, mv.dr, mv.dc, mv.dir);
        if (!res) continue;
        const k = encodeState(res.dyn);
        if (visited.has(k)) continue;
        visited.add(k);
        const idx = queue.length;
        queue.push({ dyn: res.dyn, lit: res.lit, parent: head, mvIdx: d });
        if (isWon(staticMap, res.dyn, res.lit)) {
          const path = [];
          let p = idx;
          while (p > 0) { path.push(DIRS4[queue[p].mvIdx]); p = queue[p].parent; }
          path.reverse();
          return { solved: true, path, timedOut: false };
        }
      }
      head++;
    }
    return { solved: false, timedOut: visited.size >= maxStates };
  }

  function getOptimalSteps(levelObj) {
    if (typeof levelObj.optimalSteps === "number" && levelObj.optimalSteps > 0) return levelObj.optimalSteps;
    const key = levelObj.map.join("|");
    if (optimalCache.has(key)) return optimalCache.get(key);
    const { staticMap, dynState } = parseMap(levelObj.map);
    const res = solveFromState(staticMap, dynState, 60000, 500);
    const steps = res.solved ? res.path.length : null;
    optimalCache.set(key, steps);
    return steps;
  }

  function checkDeadlock(staticMap, dyn, maxMs = 6) {
    const res = solveFromState(staticMap, dyn, 7000, maxMs);
    return !res.solved && !res.timedOut;
  }

  function findNextBestMoveEx(staticMap, dyn) {
    const res = solveFromState(staticMap, dyn, 35000, 260);
    if (res.solved && res.path.length > 0) return { status: "ok", move: res.path[0] };
    if (res.timedOut) return { status: "timeout", move: null };
    return { status: "deadlock", move: null };
  }

  function findNextBestMove(staticMap, dyn) {
    const r = findNextBestMoveEx(staticMap, dyn);
    return r.move;
  }

  function evaluateClear(steps, opt) {
    return { cleared: true, platinum: Boolean(opt && steps <= opt) };
  }

  /* =========================================================================
     Editor & PCG 5.0 Solvers (Optical Purity & Elegance Evaluation 4.0)
     ========================================================================= */
  function minGoalDistance(staticMap, dyn) {
    const goals = staticMap.goals;
    if (!goals.length) return 0;
    const boxes = [];
    for (let i = 0; i < dyn.entities.length; i++) {
      if (TARGET_BOXES.has(dyn.entities[i].kind)) boxes.push(dyn.entities[i]);
    }
    if (!boxes.length) return 0;
    if (goals.length === 1) {
      let best = 999;
      for (let i = 0; i < boxes.length; i++) {
        const d = Math.abs(boxes[i].r - goals[0].r) + Math.abs(boxes[i].c - goals[0].c);
        if (d < best) best = d;
      }
      return best;
    }
    if (goals.length <= 3 && boxes.length <= 4) {
      let best = 999;
      const dfs = (gi, usedMask, acc) => {
        if (acc >= best) return;
        if (gi === goals.length) { best = acc; return; }
        const g = goals[gi];
        for (let bi = 0; bi < boxes.length; bi++) {
          if (!(usedMask & (1 << bi))) {
            dfs(gi + 1, usedMask | (1 << bi), acc + Math.abs(boxes[bi].r - g.r) + Math.abs(boxes[bi].c - g.c));
          }
        }
      };
      dfs(0, 0, 0);
      return best;
    }
    const used = new Set();
    let total = 0;
    for (let gi = 0; gi < goals.length; gi++) {
      let bestIdx = -1, bestD = 999;
      for (let bi = 0; bi < boxes.length; bi++) {
        if (used.has(bi)) continue;
        const d = Math.abs(boxes[bi].r - goals[gi].r) + Math.abs(boxes[bi].c - goals[gi].c);
        if (d < bestD) { bestD = d; bestIdx = bi; }
      }
      if (bestIdx >= 0) { used.add(bestIdx); total += bestD; }
    }
    return total;
  }

  function encodeEntitiesOnly(dyn) {
    const parts = dyn.entities.map(e => `${e.kind}${e.r},${e.c}`);
    parts.sort();
    return parts.join(";");
  }

  function isQuicklyDeadlocked(staticMap, dyn) {
    const res = solveFromState(staticMap, dyn, 2200, 5);
    return !res.solved && !res.timedOut;
  }

  // 推箱级贪心直觉 AI：模拟普通玩家「优先把最近的目标箱往终点推 / 能入槽先入槽」的默认直觉
  function simulateGreedyPlayer(staticMap, initDyn, maxTurns = 14) {
    let curDyn = cloneDyn(initDyn);
    let curLit = computeLighting(staticMap, curDyn, false).lit;
    if (isWon(staticMap, curDyn, curLit)) return { status: "won", pushes: 0 };

    const apparentH = (dyn, lit) => {
      const lk = countLockedGoals(staticMap, dyn, lit);
      const ds = minGoalDistance(staticMap, dyn);
      let solidT = 0;
      for (let i = 0; i < dyn.entities.length; i++) {
        const e = dyn.entities[i];
        if (TARGET_BOXES.has(e.kind) && isEntitySolid(dyn, lit, e)) solidT++;
      }
      return lk * 120 - ds * 14 + solidT * 3;
    };

    const visitedEntities = new Set([encodeEntitiesOnly(curDyn)]);
    let pushes = 0;

    for (let turn = 0; turn < maxTurns; turn++) {
      // 纯步行 BFS 找出当前可达的所有「单次推箱动作」以及空手通关机会
      const walkSeen = new Set([`${curDyn.player.r},${curDyn.player.c}`]);
      const wq = [{ dyn: curDyn, lit: curLit, wd: 0 }];
      let wHead = 0;
      const pushCands = [];
      let handsFreeWin = false;

      while (wHead < wq.length && wq.length < 180) {
        const node = wq[wHead++];
        for (let d = 0; d < 4; d++) {
          const mv = DIRS4[d];
          const r = stepState(staticMap, node.dyn, node.lit, mv.dr, mv.dc, mv.dir);
          if (!r) continue;
          if (!r.pushed) {
            if (isWon(staticMap, r.dyn, r.lit)) { handsFreeWin = true; break; }
            const pk = `${r.dyn.player.r},${r.dyn.player.c}`;
            if (!walkSeen.has(pk)) {
              walkSeen.add(pk);
              wq.push({ dyn: r.dyn, lit: r.lit, wd: node.wd + 1 });
            }
          } else {
            const ek = encodeEntitiesOnly(r.dyn);
            if (visitedEntities.has(ek)) continue;
            const winNow = isWon(staticMap, r.dyn, r.lit);
            const hVal = apparentH(r.dyn, r.lit);
            const score = (winNow ? 10000 : hVal) - node.wd * 0.6 + (TARGET_BOXES.has(r.pushedKind) ? 2.0 : 0);
            pushCands.push({ score, dyn: r.dyn, lit: r.lit, ek, winNow });
          }
        }
        if (handsFreeWin) break;
      }

      if (handsFreeWin) return { status: "won", pushes };
      if (!pushCands.length) {
        return { status: isQuicklyDeadlocked(staticMap, curDyn) ? "trapped" : "stalled", pushes };
      }

      pushCands.sort((a, b) => b.score - a.score);
      const best = pushCands[0];
      const curH = apparentH(curDyn, curLit);

      if (best.score >= curH - 12 || turn === 0) {
        curDyn = best.dyn;
        curLit = best.lit;
        visitedEntities.add(best.ek);
        pushes++;
        if (best.winNow) return { status: "won", pushes };
        if (isQuicklyDeadlocked(staticMap, curDyn)) return { status: "trapped", pushes };
      } else {
        return { status: "stalled", pushes };
      }
    }

    return { status: isQuicklyDeadlocked(staticMap, curDyn) ? "trapped" : "stalled", pushes };
  }

  function evaluateElegance(staticMap, initDyn, path, explored, externalWarnings, evalOpts = {}) {
    const openStyle = Boolean(evalOpts && evalOpts.openStyle);
    const skipGreedy = Boolean(evalOpts && evalOpts.skipGreedy);
    const steps = path.length;
    let curDyn = cloneDyn(initDyn);
    let curLight = computeLighting(staticMap, curDyn, true);
    let curLit = curLight.lit;

    const warnings = [...(externalWarnings || [])];
    const timeline = [{ dyn: cloneDyn(curDyn), lit: curLit, lightObj: curLight }];

    const entityUsed = new Map();
    const entityRoles = new Map();
    initDyn.entities.forEach(e => {
      entityUsed.set(e.id, false);
      entityRoles.set(e.id, new Set());
    });
    const addRole = (id, role) => {
      if (entityRoles.has(id)) entityRoles.get(id).add(role);
    };

    const snapshotPhases = (dyn, lit) => {
      const arr = [];
      for (let i = 0; i < staticMap.iceWalls.length; i++) {
        const w = staticMap.iceWalls[i];
        arr.push({ key: `I_${i}`, tag: "I", id: -1, r: w.r, c: w.c, solid: !lit[w.r][w.c] && !isTerrainSuppressed(dyn, lit, w.r, w.c) ? 1 : 0 });
      }
      for (let i = 0; i < staticMap.treeWalls.length; i++) {
        const w = staticMap.treeWalls[i];
        arr.push({ key: `V_${i}`, tag: "V", id: -1, r: w.r, c: w.c, solid: lit[w.r][w.c] && !isTerrainSuppressed(dyn, lit, w.r, w.c) ? 1 : 0 });
      }
      for (let i = 0; i < dyn.entities.length; i++) {
        const e = dyn.entities[i];
        if (e.kind === "C" || e.kind === "F") {
          arr.push({ key: `E_${e.id}`, tag: e.kind, id: e.id, r: e.r, c: e.c, solid: isEntitySolid(dyn, lit, e) ? 1 : 0 });
        }
      }
      return arr;
    };

    const suppressedWallKeys = new Set();
    const hasTrueSuppression = (dyn, lit, justWalkedThroughAmber) => {
      let found = false;
      for (let i = 0; i < staticMap.iceWalls.length; i++) {
        const w = staticMap.iceWalls[i];
        if (!lit[w.r][w.c] && isTerrainSuppressed(dyn, lit, w.r, w.c)) {
          suppressedWallKeys.add(`I_${i}`);
          found = true;
        }
      }
      for (let i = 0; i < staticMap.treeWalls.length; i++) {
        const w = staticMap.treeWalls[i];
        if (lit[w.r][w.c]) {
          const objOnV = dyn.entities.some(e => e.r === w.r && e.c === w.c && ((e.kind !== "C" && e.kind !== "F") || isEntitySolid(dyn, lit, e)));
          const playerOnV = dyn.player && dyn.player.r === w.r && dyn.player.c === w.c;
          if (objOnV || (playerOnV && !justWalkedThroughAmber)) {
            suppressedWallKeys.add(`V_${i}`);
            found = true;
          }
        }
      }
      for (let i = 0; i < dyn.entities.length; i++) {
        const e = dyn.entities[i];
        if (e.kind === "C" && !lit[e.r][e.c] && isEntitySuppressed(dyn, e)) {
          found = true;
        } else if (e.kind === "F" && lit[e.r][e.c]) {
          const objOnF = dyn.entities.some(o => {
            if (o.id === e.id || o.r !== e.r || o.c !== e.c) return false;
            const alwaysSolid = o.kind === "B" || o.kind === "L" || o.kind === "\\" || o.kind === "/" || Boolean(SPOT_DIRS[o.kind]);
            return alwaysSolid || (o.kind === e.kind && o.id < e.id);
          });
          const playerOnF = dyn.player && dyn.player.r === e.r && dyn.player.c === e.c;
          if (objOnF || (playerOnF && !justWalkedThroughAmber)) {
            found = true;
          }
        }
      }
      return found;
    };

    // 检查某帧中被光束击中的遮挡实体是否真正为后方光敏元件(I/V/C/F)撑起了阴影（捕获 1-5 木箱提前站岗撑伞）
    const markShieldRoles = (dyn, lightObj) => {
      if (!lightObj || !lightObj.blockers || !lightObj.blockers.length) return;
      for (let bi = 0; bi < lightObj.blockers.length; bi++) {
        const blk = lightObj.blockers[bi];
        if (blk.kind === "P" || blk.kind === "V") continue;
        const ent = dyn.entities.find(e => e.r === blk.r && e.c === blk.c && e.kind === blk.kind);
        if (!ent) continue;
        let rr = blk.r + blk.dr, cc = blk.c + blk.dc;
        while (rr >= 0 && rr < staticMap.rows && cc >= 0 && cc < staticMap.cols && !staticMap.walls[rr][cc]) {
          const hitReactive = staticMap.iceWalls.some(w => w.r === rr && w.c === cc) ||
            staticMap.treeWalls.some(w => w.r === rr && w.c === cc) ||
            dyn.entities.some(e => e.id !== ent.id && e.r === rr && e.c === cc && (e.kind === "C" || e.kind === "F"));
          if (hitReactive) { addRole(ent.id, "optical"); break; }
          rr += blk.dr; cc += blk.dc;
        }
      }
    };

    const PUSH_LABEL = { B: "推木箱", C: "推雪箱", F: "推暖珀", L: "推提灯", M: "推折光镜", SP: "推射灯" };
    const mechEvents = [];
    const mechLabels = [];
    const pushEvent = (code, label) => {
      if (mechEvents[mechEvents.length - 1] !== code) {
        mechEvents.push(code);
        if (label && mechLabels[mechLabels.length - 1] !== label) mechLabels.push(label);
      }
    };

    const activeCells = new Set();
    const markCells = (dyn, lit) => {
      if (dyn.player) activeCells.add(`${dyn.player.r},${dyn.player.c}`);
      for (let i = 0; i < dyn.entities.length; i++) activeCells.add(`${dyn.entities[i].r},${dyn.entities[i].c}`);
      for (let r = 0; r < staticMap.rows; r++) {
        for (let c = 0; c < staticMap.cols; c++) {
          if (lit[r][c]) activeCells.add(`${r},${c}`);
        }
      }
    };
    markCells(curDyn, curLit);
    markShieldRoles(curDyn, curLight);

    let prevPhases = snapshotPhases(curDyn, curLit);
    let prevSup = hasTrueSuppression(curDyn, curLit, false);
    let prevLockedGoals = countLockedGoals(staticMap, curDyn, curLit);
    let prevDist = minGoalDistance(staticMap, curDyn);
    let bestHProg = prevLockedGoals * 10 - prevDist;
    let maxProgressDip = 0;
    let detourPushCount = 0;
    let rawSleepEvents = []; // { segIdx, entId, onGoal }
    let remoteWakeWin = false;

    const itemFlipCounts = new Map();
    const pushSegments = [];
    const amberPushAxes = new Map();
    let pushes = 0, phaseFlips = 0, bodyShadowFlips = 0, woodShadowFlips = 0, multiFlipSteps = 0;
    let amberShadowFlips = 0, ghostPassCount = 0, amberGatePasses = 0;
    let suppressionCount = 0, goalUnseats = 0, swapCount = 0;
    let curWalkStreak = 0, maxWalkStreak = 0;
    let lastStepPushed = true;

    const isLightToolNorm = k => k === "L" || k === "M" || k === "SP";

    for (let i = 0; i < path.length; i++) {
      const mv = path[i];
      const nr = curDyn.player.r + mv.dr;
      const nc = curDyn.player.c + mv.dc;

      const steppingOnGhostF = curDyn.entities.find(
        e => e.kind === "F" && e.r === nr && e.c === nc && !isEntitySolid(curDyn, curLit, e)
      );
      const steppingOnGhostC = curDyn.entities.find(
        e => e.kind === "C" && e.r === nr && e.c === nc && !isEntitySolid(curDyn, curLit, e)
      );
      const steppingOnGhostV = staticMap.treeWalls.some(w => w.r === nr && w.c === nc && !curLit[nr][nc]);

      const hadDormantOnGoal = staticMap.goals.some(g =>
        curDyn.entities.some(e => (e.kind === "C" || e.kind === "F") && e.r === g.r && e.c === g.c && !isEntitySolid(curDyn, curLit, e))
      );

      const res = stepState(staticMap, curDyn, curLit, mv.dr, mv.dc, mv.dir);
      if (!res) break;
      lastStepPushed = Boolean(res.pushedKind);

      let walkedThroughAmber = false;
      if (!res.pushedKind && steppingOnGhostF) {
        ghostPassCount++;
        entityUsed.set(steppingOnGhostF.id, true);
        addRole(steppingOnGhostF.id, "ghost");
        walkedThroughAmber = true;
        pushEvent("GHOST_F", "虚化穿身");
      }
      if (!res.pushedKind && steppingOnGhostC) {
        addRole(steppingOnGhostC.id, "ghost");
      }
      if (steppingOnGhostV) {
        amberGatePasses++;
        if (!res.pushedKind) walkedThroughAmber = true;
        pushEvent("V_PASS", "影开珀门");
      }

      if (res.pushedKind) {
        pushes++;
        entityUsed.set(res.pushedId, true);
        const br = nr + mv.dr, bc = nc + mv.dc;
        if (staticMap.treeWalls.some(w => w.r === br && w.c === bc && !curLit[br][bc])) {
          amberGatePasses++;
          pushEvent("V_PASS", "影开珀门");
        }
        const normKind = (res.pushedKind === "\\" || res.pushedKind === "/")
          ? "M"
          : (SPOT_DIRS[res.pushedKind] ? "SP" : res.pushedKind);
        if (!pushSegments.length || pushSegments[pushSegments.length - 1].id !== res.pushedId) {
          pushSegments.push({ id: res.pushedId, kind: res.pushedKind, normKind, steps: 1 });
        } else {
          pushSegments[pushSegments.length - 1].steps++;
        }
        if (res.pushedKind === "F") {
          if (!amberPushAxes.has(res.pushedId)) amberPushAxes.set(res.pushedId, new Set());
          amberPushAxes.get(res.pushedId).add(mv.dc !== 0 ? "H" : "V");
        }
        pushEvent(`P:${normKind}`, PUSH_LABEL[normKind] || `推${normKind}`);
      }

      curDyn = res.dyn;
      curLight = computeLighting(staticMap, curDyn, true);
      curLit = curLight.lit;
      timeline.push({ dyn: cloneDyn(curDyn), lit: curLit, lightObj: curLight });
      markCells(curDyn, curLit);
      markShieldRoles(curDyn, curLight);

      const nextPhases = snapshotPhases(curDyn, curLit);
      let stepFlips = 0;
      let otherFlippedByPushed = 0;
      const flippedBoxes = [];
      for (let k = 0; k < nextPhases.length; k++) {
        if (nextPhases[k].solid !== prevPhases[k].solid) {
          phaseFlips++;
          stepFlips++;
          itemFlipCounts.set(nextPhases[k].key, (itemFlipCounts.get(nextPhases[k].key) || 0) + 1);
          const tg = nextPhases[k].tag;
          const toSolid = nextPhases[k].solid === 1;
          if (tg === "C" || tg === "F") flippedBoxes.push({ r: nextPhases[k].r, c: nextPhases[k].c, tag: tg, toSolid });
          if (res.pushedId !== null && nextPhases[k].id !== res.pushedId) {
            otherFlippedByPushed++;
          }
          if (tg === "I") pushEvent(toSolid ? "I+" : "I-", toSolid ? "冰墙结冰" : "冰墙融水");
          else if (tg === "V") pushEvent(toSolid ? "V+" : "V-", toSolid ? "琥珀凝实" : "琥珀归虚");
          else if (tg === "C") pushEvent(toSolid ? "C+" : "C-", toSolid ? "雪箱凝结" : "雪箱化水");
          else if (tg === "F") pushEvent(toSolid ? "F+" : "F-", toSolid ? "暖珀凝实" : "暖珀归虚");
        }
      }
      prevPhases = nextPhases;

      if (otherFlippedByPushed > 0 && res.pushedId !== null) {
        addRole(res.pushedId, "optical");
        if (res.pushedKind === "F") {
          amberShadowFlips++;
          pushEvent("F_SHD", "以珀挡光");
        }
      }

      if (stepFlips >= 2) {
        multiFlipSteps++;
        pushEvent("CHAIN", "连锁相变");
      }

      if (flippedBoxes.length >= 2) {
        for (let a = 0; a < flippedBoxes.length; a++) {
          for (let b = a + 1; b < flippedBoxes.length; b++) {
            if (flippedBoxes[a].r === flippedBoxes[b].r && flippedBoxes[a].c === flippedBoxes[b].c && flippedBoxes[a].toSolid !== flippedBoxes[b].toSolid) {
              swapCount++;
              pushEvent("SWAP", "冰珀互换");
            }
          }
        }
      }

      if (!res.pushedKind && stepFlips > 0) {
        bodyShadowFlips++;
        pushEvent("BODY", "自身成荫");
      } else if (res.pushedKind === "B" && stepFlips > 0) {
        woodShadowFlips++;
        pushEvent("B_SHD", "借物遮阳");
      }

      if (!res.pushedKind && stepFlips === 0) {
        curWalkStreak++;
        if (curWalkStreak > maxWalkStreak) maxWalkStreak = curWalkStreak;
      } else {
        curWalkStreak = 0;
      }

      const curSup = hasTrueSuppression(curDyn, curLit, walkedThroughAmber);
      if (curSup && !prevSup) {
        suppressionCount++;
        pushEvent("SUP", "占格压制");
      }
      prevSup = curSup;

      const nowLockedGoals = countLockedGoals(staticMap, curDyn, curLit);
      if (nowLockedGoals < prevLockedGoals) {
        goalUnseats++;
        if (res.pushedId !== null) addRole(res.pushedId, "unseat");
        pushEvent("UNSEAT", "退槽借位");
      }

      // 进度曲线「先退后进」低谷 & 刻意休眠检测
      if (res.pushedKind) {
        if (res.pushedKind === "C" || res.pushedKind === "F") {
          const movedEnt = curDyn.entities.find(e => e.id === res.pushedId);
          if (movedEnt && !isEntitySolid(curDyn, curLit, movedEnt)) {
            const onGoal = staticMap.goals.some(g => g.r === movedEnt.r && g.c === movedEnt.c);
            rawSleepEvents.push({ segIdx: pushSegments.length - 1, entId: movedEnt.id, onGoal });
          }
        }
        const nowDist = minGoalDistance(staticMap, curDyn);
        if (nowDist > prevDist || nowLockedGoals < prevLockedGoals) {
          detourPushCount++;
        }
        const curHProg = nowLockedGoals * 10 - nowDist;
        if (curHProg > bestHProg) bestHProg = curHProg;
        const dip = bestHProg - curHProg;
        if (dip > maxProgressDip) maxProgressDip = dip;
        prevDist = nowDist;
      }

      if (i === path.length - 1 && hadDormantOnGoal && isWon(staticMap, curDyn, curLit)) {
        remoteWakeWin = true;
        pushEvent("R_WAKE", "远程唤醒");
      }

      prevLockedGoals = nowLockedGoals;
    }

    const handsFreeVictory = steps > 0 && !lastStepPushed;
    if (handsFreeVictory) pushEvent("HANDSFREE", "空手点睛");

    staticMap.goals.forEach(g => {
      const e = solidEntityAt(curDyn, curLit, g.r, g.c);
      if (e) {
        entityUsed.set(e.id, true);
        addRole(e.id, "goal");
      }
    });

    // ★ 机械护送审计（识破「推灯/镜1格 → 推珀/雪1格 → 再推灯/镜1格」的刷分水图！）
    let escortCycles = 0;
    const escortSegIndices = new Set();
    for (let i = 0; i < pushSegments.length - 2; i++) {
      const a = pushSegments[i], b = pushSegments[i + 1], c = pushSegments[i + 2];
      const isPairAB = (isLightToolNorm(a.normKind) && (b.normKind === "F" || b.normKind === "C")) ||
                       (isLightToolNorm(b.normKind) && (a.normKind === "F" || a.normKind === "C"));
      if (isPairAB && a.id === c.id && a.steps <= 2 && b.steps <= 2) {
        escortCycles++;
        escortSegIndices.add(i);
        escortSegIndices.add(i + 1);
        escortSegIndices.add(i + 2);
      }
    }
    if (escortCycles >= 2) {
      warnings.push(`存在机械跟随光束挪箱（伴随护送 ×${escortCycles}，套路较单调）`);
    }

    // 过滤护送段内的伪休眠，只保留真正有战术价值的刻意休眠（如推入暗终点休眠）
    let intentionalSleepCount = 0;
    for (let i = 0; i < rawSleepEvents.length; i++) {
      const ev = rawSleepEvents[i];
      if (escortCycles >= 2 && !ev.onGoal && escortSegIndices.has(ev.segIdx)) continue;
      intentionalSleepCount++;
      addRole(ev.entId, "sleep");
    }

    let amberHandoffCount = 0;
    amberPushAxes.forEach(axes => {
      if (axes.size >= 2 && escortCycles < 2) {
        amberHandoffCount++;
        pushEvent("HANDOFF", "跨光接力");
      }
    });

    // ★ 严格审计 1（反事实光学剥离）：折光镜必须真正服务于冰/珀相变且不可退化为障碍物
    const reactiveCellsOf = dyn => {
      const pts = [];
      for (let i = 0; i < staticMap.iceWalls.length; i++) pts.push([staticMap.iceWalls[i].r, staticMap.iceWalls[i].c]);
      for (let i = 0; i < staticMap.treeWalls.length; i++) pts.push([staticMap.treeWalls[i].r, staticMap.treeWalls[i].c]);
      for (let i = 0; i < dyn.entities.length; i++) {
        const en = dyn.entities[i];
        if (en.kind === "C" || en.kind === "F") pts.push([en.r, en.c]);
      }
      return pts;
    };

    let mirrorAsObstacleCount = 0;
    let mirrorDualRefractCount = 0;
    initDyn.entities.forEach(e => {
      if (e.kind !== "\\" && e.kind !== "/") return;

      let cfDyn = cloneDyn(initDyn);
      let cfLit = computeLighting(staticMap, cfDyn, false, e.id).lit;
      let cfStillWins = true;
      for (let s = 0; s < path.length; s++) {
        const mv = path[s];
        const rStep = stepState(staticMap, cfDyn, cfLit, mv.dr, mv.dc, mv.dir, e.id);
        if (!rStep) { cfStillWins = false; break; }
        cfDyn = rStep.dyn;
        cfLit = rStep.lit;
      }
      if (cfStillWins && !isWon(staticMap, cfDyn, cfLit)) cfStillWins = false;

      const trueSpots = new Set();
      for (let t = 0; t < timeline.length; t++) {
        const st = timeline[t];
        const hitSet = st.lightObj && st.lightObj.effectiveMirrorHits ? st.lightObj.effectiveMirrorHits.get(e.id) : null;
        if (!hitSet || hitSet.size === 0) continue;
        const litWithout = computeLighting(staticMap, st.dyn, false, e.id).lit;
        const rCells = reactiveCellsOf(st.dyn);
        let affectedReactive = false;
        for (let ci = 0; ci < rCells.length; ci++) {
          const [rr, cc] = rCells[ci];
          if (st.lit[rr][cc] !== litWithout[rr][cc]) {
            affectedReactive = true;
            break;
          }
        }
        if (affectedReactive) hitSet.forEach(sp => trueSpots.add(sp));
      }

      if (cfStillWins || trueSpots.size === 0) {
        mirrorAsObstacleCount++;
        warnings.push("不优雅：折光镜退化为障碍物（关闭折光后原路线仍可通关，或折光未作用于任何冰/珀元件）");
      } else if (trueSpots.size >= 2 && escortCycles < 2) {
        mirrorDualRefractCount++;
        addRole(e.id, "refract2");
        pushEvent("M_REUSE", "镜子双位折光");
      }
    });

    // ★ 统计「一物多角」实体数（同一物体承担 ≥2 种截然不同的战术角色）
    let multiRoleCount = 0;
    if (escortCycles < 2) {
      entityRoles.forEach(roleSet => {
        if (roleSet.size >= 2) multiRoleCount++;
      });
    }

    // ★ 贪心直觉 AI 踩坑模拟（量化反直觉度）
    const greedyRes = (steps > 0 && !skipGreedy)
      ? simulateGreedyPlayer(staticMap, initDyn, Math.min(14, steps + 4))
      : { status: "won", pushes: 0 };
    const greedyStatus = greedyRes.status; // "trapped" | "stalled" | "won"
    const greedyPushes = greedyRes.pushes;

    // ★ 严格审计 2：闲置道具 & 装饰性冰/珀墙
    let unusedItemCount = 0;
    initDyn.entities.forEach(e => {
      if (e.kind === "\\" || e.kind === "/") return;
      if (!entityUsed.get(e.id)) {
        unusedItemCount++;
        warnings.push(`存在毫无意义的闲置道具「${e.kind}」（全程未参与解题）`);
      }
    });

    let unusedReactiveWallCount = 0;
    staticMap.iceWalls.forEach((w, idx) => {
      const k = `I_${idx}`;
      if (!itemFlipCounts.get(k) && !suppressedWallKeys.has(k)) unusedReactiveWallCount++;
    });
    staticMap.treeWalls.forEach((w, idx) => {
      const k = `V_${idx}`;
      if (!itemFlipCounts.get(k) && !suppressedWallKeys.has(k)) unusedReactiveWallCount++;
    });
    if (unusedReactiveWallCount > 0) {
      warnings.push(`存在 ${unusedReactiveWallCount} 块装饰性冰/珀墙（全程未触发融化/凝实或压制）`);
    }

    const totalReactiveCount = staticMap.iceWalls.length + staticMap.treeWalls.length +
      initDyn.entities.filter(e => e.kind === "C" || e.kind === "F").length;
    if (totalReactiveCount > 0 && phaseFlips === 0 && suppressionCount === 0 && ghostPassCount === 0 && amberGatePasses === 0) {
      warnings.push("光影元件全程未发生相变（退化为普通推箱子）");
    }

    const idAppearances = new Map();
    for (let i = 0; i < pushSegments.length; i++) {
      if (escortSegIndices.has(i)) continue;
      const segId = pushSegments[i].id;
      idAppearances.set(segId, (idAppearances.get(segId) || 0) + 1);
    }
    let interleavedReuses = 0;
    idAppearances.forEach(cnt => { if (cnt >= 2) interleavedReuses += (cnt - 1); });

    let pingPongFlips = 0;
    itemFlipCounts.forEach(cnt => { if (cnt >= 2) pingPongFlips++; });
    const effectivePingPong = escortCycles >= 2 ? 0 : pingPongFlips;

    let floorCount = 0, wasteFloors = 0, innerWallCount = 0;
    for (let r = 0; r < staticMap.rows; r++) {
      for (let c = 0; c < staticMap.cols; c++) {
        const isBorder = r === 0 || c === 0 || r === staticMap.rows - 1 || c === staticMap.cols - 1;
        if (staticMap.walls[r][c]) {
          if (!isBorder) innerWallCount++;
        } else if (!staticMap.suns.some(s => s.r === r && s.c === c)) {
          floorCount++;
          const isStaticFeature = staticMap.goals.some(g => g.r === r && g.c === c)
            || staticMap.iceWalls.some(w => w.r === r && w.c === c)
            || staticMap.treeWalls.some(w => w.r === r && w.c === c);
          if (!isStaticFeature && !activeCells.has(`${r},${c}`)) wasteFloors++;
        }
      }
    }

    let redundantWallLayers = 0;
    const isRowAllDeadWall = r => {
      for (let c = 0; c < staticMap.cols; c++) {
        if (!staticMap.walls[r][c]) return false;
      }
      return true;
    };
    const isColAllDeadWall = c => {
      for (let r = 0; r < staticMap.rows; r++) {
        if (!staticMap.walls[r][c]) return false;
      }
      return true;
    };
    if (staticMap.rows > 5 && isRowAllDeadWall(0) && isRowAllDeadWall(1)) redundantWallLayers++;
    if (staticMap.rows > 5 && isRowAllDeadWall(staticMap.rows - 1) && isRowAllDeadWall(staticMap.rows - 2)) redundantWallLayers++;
    if (staticMap.cols > 5 && isColAllDeadWall(0) && isColAllDeadWall(1)) redundantWallLayers++;
    if (staticMap.cols > 5 && isColAllDeadWall(staticMap.cols - 1) && isColAllDeadWall(staticMap.cols - 2)) redundantWallLayers++;
    if (redundantWallLayers > 0) {
      warnings.push(`存在 ${redundantWallLayers} 处多余外层死墙`);
    }

    // ---------------------------------------------------------------------
    // 新四维 100 分量化评价体系：反直觉度(30) + 巧思复用(30) + 思维深度(25) + 空间纯净(15)
    // ---------------------------------------------------------------------
    // 1) 反直觉度（满分 30）：贪心 AI 踩坑死锁 / 进度先退后进低谷 / 远程唤醒 / 刻意休眠
    const greedyPts = greedyStatus === "trapped" ? 15 : (greedyStatus === "stalled" ? 9 : 0);
    const dipPts = Math.min(9, maxProgressDip * 4 + detourPushCount * 3);
    const wakePts = (remoteWakeWin ? 6 : 0) + (handsFreeVictory ? 4 : 0) + (intentionalSleepCount > 0 ? 4 : 0);
    const ahaScore = Math.min(30, Math.round(greedyPts + dipPts + Math.min(10, wakePts)));

    // 2) 巧思复用（满分 30）：一物多角 + 琥珀/冰雪/折光专属技巧（护送刷分清零）
    const emergentTotal = suppressionCount + swapCount + goalUnseats;
    const amberCleverPts =
      Math.min(10, ghostPassCount * 8) +
      Math.min(12, amberShadowFlips * 10) +
      Math.min(10, amberHandoffCount * 10) +
      Math.min(8, amberGatePasses * 5);
    const cleverScore = Math.min(
      30,
      Math.round(
        Math.min(14, multiRoleCount * 7) +
        amberCleverPts +
        mirrorDualRefractCount * 11 +
        interleavedReuses * 7 +
        effectivePingPong * 6 +
        Math.min(8, bodyShadowFlips * 4) +
        Math.min(8, woodShadowFlips * 5) +
        Math.min(7, multiFlipSteps * 4) +
        emergentTotal * 7
      )
    );

    // 3) 思维深度（满分 25）：搜索分支陷阱密度 + 步数体量
    const trapDensity = steps > 0 ? explored / steps : 1;
    const depthScore = Math.min(
      25,
      Math.round(Math.min(17, Math.log10(Math.max(1, trapDensity)) * 9.5) + Math.min(8, steps * 0.45))
    );

    // 4) 空间纯净（满分 15）：高决策效率、低冗余走步、无厚墙
    const walkPenalty = Math.max(0, maxWalkStreak - (openStyle ? 5 : 4)) * 2;
    const wastePenalty = openStyle ? Math.max(0, wasteFloors - 8) : wasteFloors * 2;
    const clutterPenalty = innerWallCount > 6 ? (innerWallCount - 6) * 2 : 0;
    const purityScore = Math.max(0, 15 - wastePenalty - clutterPenalty - redundantWallLayers * 4 - walkPenalty);
    const compactScore = purityScore; // 保持字段向后兼容

    const noFlipPenalty = (totalReactiveCount > 0 && phaseFlips === 0 && suppressionCount === 0 && ghostPassCount === 0 && amberGatePasses === 0) ? 30 : 0;
    const escortPenalty = escortCycles >= 2 ? Math.min(42, (escortCycles - 1) * 18) : 0;
    const penalty = mirrorAsObstacleCount * 45 + unusedItemCount * 25 + unusedReactiveWallCount * 20 + noFlipPenalty + escortPenalty + (externalWarnings ? externalWarnings.length * 25 : 0);
    const score = Math.max(0, Math.min(100, ahaScore + cleverScore + depthScore + purityScore - penalty));

    let grade = "C", label = "C 级教学";
    if (score >= 80) { grade = "S"; label = "S 级典藏"; }
    else if (score >= 62) { grade = "A"; label = "A 级精品"; }
    else if (score >= 42) { grade = "B"; label = "B 级进阶"; }

    const highlights = [];
    if (greedyStatus === "trapped") highlights.push({ text: `🎯 直觉陷阱`, cls: "gold" });
    else if (greedyStatus === "stalled") highlights.push({ text: `🧩 破局思考`, cls: "ice" });
    if (maxProgressDip > 0 || detourPushCount > 0) highlights.push({ text: `📉 先退后进`, cls: "gold" });
    if (remoteWakeWin) highlights.push({ text: `💤 远程唤醒`, cls: "jade" });
    else if (intentionalSleepCount > 0) highlights.push({ text: `💤 离光休眠`, cls: "jade" });
    if (multiRoleCount > 0) highlights.push({ text: `🎭 一物多角 ×${multiRoleCount}`, cls: "gold" });
    if (ghostPassCount > 0) highlights.push({ text: `👻 虚化穿身 ×${ghostPassCount}`, cls: "gold" });
    if (amberShadowFlips > 0) highlights.push({ text: `🛡️ 以珀挡光 ×${amberShadowFlips}`, cls: "gold" });
    if (amberHandoffCount > 0) highlights.push({ text: `🔀 跨光接力`, cls: "jade" });
    if (amberGatePasses > 0) highlights.push({ text: `🚪 影开珀门`, cls: "gold" });
    if (mirrorDualRefractCount > 0) highlights.push({ text: `🪞 双位折光 ×${mirrorDualRefractCount}`, cls: "gold" });
    if (handsFreeVictory) highlights.push({ text: `✋ 空手点睛`, cls: "jade" });
    if (woodShadowFlips > 0) highlights.push({ text: `☂️ 借物遮阳`, cls: "jade" });
    if (multiFlipSteps > 0) highlights.push({ text: `💥 连锁相变`, cls: "gold" });
    if (interleavedReuses > 0) highlights.push({ text: `🔁 交错复用 ×${interleavedReuses}`, cls: "gold" });
    if (effectivePingPong > 0) highlights.push({ text: `🌗 来回拉扯 ×${effectivePingPong}`, cls: "ice" });
    if (bodyShadowFlips > 0) highlights.push({ text: `👤 自身成荫`, cls: "jade" });
    if (swapCount > 0) highlights.push({ text: `✨ 冰珀互换`, cls: "gold" });
    if (goalUnseats > 0) highlights.push({ text: `🔄 退槽反直觉`, cls: "gold" });
    if (suppressionCount > 0) highlights.push({ text: `⚡ 占格压制`, cls: "ice" });
    if (escortCycles >= 2) highlights.push({ text: `🐢 机械护送 ×${escortCycles}`, cls: "danger" });

    const mechanicSig = mechEvents.length ? mechEvents.join(">") : "INIT";
    const mechanicFlow = mechLabels.length
      ? (mechLabels.length > 5 ? mechLabels.slice(0, 4).join(" → ") + " → … → " + mechLabels[mechLabels.length - 1] : mechLabels.join(" → "))
      : "开局即通关";

    return {
      steps, pushes, phaseFlips, interleavedReuses, pingPongFlips: effectivePingPong, bodyShadowFlips, woodShadowFlips, multiFlipSteps,
      ghostPassCount, amberShadowFlips, amberHandoffCount, amberGatePasses, escortCycles,
      greedyStatus, greedyPushes, maxProgressDip, detourPushCount, intentionalSleepCount, remoteWakeWin, multiRoleCount,
      suppressionCount, goalUnseats, swapCount, handsFreeVictory, floorCount, wasteFloors, innerWallCount, redundantWallLayers,
      mirrorAsObstacleCount, mirrorDualRefractCount, unusedItemCount, unusedReactiveWallCount,
      maxWalkStreak, trapDensity: Math.round(trapDensity),
      ahaScore, cleverScore, compactScore, depthScore, purityScore,
      score, grade, label, highlights, mechanicSig, mechanicFlow, activeCells
    };
  }

  function solveBFS(gridRows, maxStates = 80000, evalOpts = {}) {
    const t0 = nowMs();
    const { staticMap, dynState } = parseMap(gridRows);

    if (!dynState.player) return { status: "invalid", reason: "地图缺少主角「P」", ms: 0 };
    if (staticMap.goals.length === 0) return { status: "invalid", reason: "地图缺少终点「X」", ms: 0 };
    const targetBoxCount = dynState.entities.filter(e => TARGET_BOXES.has(e.kind)).length;
    if (targetBoxCount < staticMap.goals.length) {
      return { status: "invalid", reason: `目标箱数量(${targetBoxCount})少于终点数量(${staticMap.goals.length})`, ms: 0 };
    }

    const initLight = computeLighting(staticMap, dynState, false);
    if (isWon(staticMap, dynState, initLight.lit)) {
      return {
        status: "solved", steps: 0, path: [], explored: 1,
        ms: Math.max(1, Math.round(nowMs() - t0)),
        cheeseWarnings: [], redundantSuns: 0,
        metrics: evaluateElegance(staticMap, dynState, [], 1, [], evalOpts)
      };
    }

    const toolKindsInMap = new Set(
      dynState.entities
        .filter(e => e.kind === "L" || e.kind === "\\" || e.kind === "/" || SPOT_DIRS[e.kind])
        .map(e => e.kind)
    );

    const visited = new Set([encodeState(dynState)]);
    const queue = [{ dyn: dynState, lit: initLight.lit, parent: -1, moveIdx: -1, pushedKind: null, depth: 0 }];
    let head = 0;

    while (head < queue.length && visited.size < maxStates) {
      const cur = queue[head];
      for (let d = 0; d < 4; d++) {
        const mv = DIRS4[d];
        const res = stepState(staticMap, cur.dyn, cur.lit, mv.dr, mv.dc, mv.dir);
        if (!res) continue;

        const key = encodeState(res.dyn);
        if (visited.has(key)) continue;
        visited.add(key);

        const nodeIdx = queue.length;
        queue.push({ dyn: res.dyn, lit: res.lit, parent: head, moveIdx: d, pushedKind: res.pushedKind, depth: cur.depth + 1 });

        if (isWon(staticMap, res.dyn, res.lit)) {
          const path = [];
          const movedKinds = new Set();
          let ptr = nodeIdx;
          while (ptr > 0) {
            const n = queue[ptr];
            path.push(DIRS4[n.moveIdx]);
            if (n.pushedKind) movedKinds.add(n.pushedKind);
            ptr = n.parent;
          }
          path.reverse();

          const extWarnings = [];
          if ((toolKindsInMap.has("\\") || toolKindsInMap.has("/")) && !movedKinds.has("\\") && !movedKinds.has("/")) {
            extWarnings.push("地图中的「折光镜」在最优解中未被推动");
          }
          if (toolKindsInMap.has("L") && !movedKinds.has("L")) {
            extWarnings.push("地图中的「可推太阳灯」在最优解中未被推动");
          }
          const hasSpot = ["^", "v", "<", ">"].some(k => toolKindsInMap.has(k));
          const movedSpot = ["^", "v", "<", ">"].some(k => movedKinds.has(k));
          if (hasSpot && !movedSpot) {
            extWarnings.push("地图中的「单向射灯」在最优解中未被推动");
          }

          let redundantSuns = 0;
          if (staticMap.suns.length > 0) {
            for (let si = 0; si < staticMap.suns.length; si++) {
              const sunPos = staticMap.suns[si];
              const testRows = gridRows.map((rowStr, rIdx) =>
                rIdx === sunPos.r ? rowStr.slice(0, sunPos.c) + "#" + rowStr.slice(sunPos.c + 1) : rowStr
              );
              const testParsed = parseMap(testRows);
              let tDyn = testParsed.dynState;
              let tLit = computeLighting(testParsed.staticMap, tDyn, false).lit;
              let ok = true;
              for (let stepIdx = 0; stepIdx < path.length; stepIdx++) {
                const mv2 = path[stepIdx];
                const rStep = stepState(testParsed.staticMap, tDyn, tLit, mv2.dr, mv2.dc, mv2.dir);
                if (!rStep) { ok = false; break; }
                tDyn = rStep.dyn; tLit = rStep.lit;
              }
              if (ok && isWon(testParsed.staticMap, tDyn, tLit)) redundantSuns++;
            }
            if (redundantSuns > 0) extWarnings.push(`存在 ${redundantSuns} 颗对解题无影响的冗余太阳`);
          }

          const metrics = evaluateElegance(staticMap, dynState, path, visited.size, extWarnings, evalOpts);
          const allWarnings = [...extWarnings];
          if (metrics.mirrorAsObstacleCount > 0) allWarnings.push("折光镜退化为障碍物（关闭折光后仍可通关，或折光未作用于冰/珀元件）");
          if (metrics.escortCycles >= 2) allWarnings.push(`存在机械跟随光束挪箱（伴随护送 ×${metrics.escortCycles}）`);
          if (metrics.unusedItemCount > 0) allWarnings.push(`存在 ${metrics.unusedItemCount} 个未参与解题的闲置道具`);
          if (metrics.unusedReactiveWallCount > 0) allWarnings.push(`存在 ${metrics.unusedReactiveWallCount} 块装饰性冰/珀墙（全程未变相）`);
          if (metrics.redundantWallLayers > 0) allWarnings.push(`存在 ${metrics.redundantWallLayers} 处外围冗余死墙`);

          return {
            status: "solved",
            steps: path.length,
            path,
            explored: visited.size,
            ms: Math.max(1, Math.round(nowMs() - t0)),
            cheeseWarnings: [...new Set(allWarnings)],
            redundantSuns,
            metrics
          };
        }
      }
      head++;
    }

    return {
      status: visited.size >= maxStates ? "timeout" : "unsolvable",
      explored: visited.size,
      ms: Math.max(1, Math.round(nowMs() - t0))
    };
  }

  return {
    SPOT_DIRS, TARGET_BOXES, DYNAMIC_KINDS, DIRS4,
    parseMap, cloneDyn, isEntitySuppressed, isEntitySolid, isTerrainSuppressed,
    solidEntityAt, computeLighting, isCellBlocked, stepState, countLockedGoals, isWon, encodeState,
    solveFromState, getOptimalSteps, checkDeadlock, findNextBestMoveEx, findNextBestMove, evaluateClear,
    simulateGreedyPlayer, evaluateElegance, solveBFS
  };
});
