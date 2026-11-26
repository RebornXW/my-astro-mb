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

  function computeLighting(staticMap, dyn, includeVisuals = false) {
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
          if (e.kind === "\\" || e.kind === "/") mirror = e;
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

  function stepState(staticMap, dyn, lit, dr, dc, dir) {
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

    const nextLight = computeLighting(staticMap, nextDyn, false);
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
  function evaluateElegance(staticMap, initDyn, path, explored, externalWarnings) {
    const steps = path.length;
    let curDyn = cloneDyn(initDyn);
    let curLight = computeLighting(staticMap, curDyn, true);
    let curLit = curLight.lit;

    const warnings = [...(externalWarnings || [])];

    const mirrorRefractSpots = new Map();
    const recordMirrorHits = lightObj => {
      if (!lightObj || !lightObj.effectiveMirrorHits) return;
      lightObj.effectiveMirrorHits.forEach((spotSet, mid) => {
        if (!mirrorRefractSpots.has(mid)) mirrorRefractSpots.set(mid, new Set());
        spotSet.forEach(s => mirrorRefractSpots.get(mid).add(s));
      });
    };
    recordMirrorHits(curLight);

    const entityUsed = new Map();
    initDyn.entities.forEach(e => entityUsed.set(e.id, false));

    const snapshotPhases = (dyn, lit) => {
      const arr = [];
      for (let i = 0; i < staticMap.iceWalls.length; i++) {
        const w = staticMap.iceWalls[i];
        arr.push({ key: `I_${i}`, tag: "I", r: w.r, c: w.c, solid: !lit[w.r][w.c] && !isTerrainSuppressed(dyn, lit, w.r, w.c) ? 1 : 0 });
      }
      for (let i = 0; i < staticMap.treeWalls.length; i++) {
        const w = staticMap.treeWalls[i];
        arr.push({ key: `V_${i}`, tag: "V", r: w.r, c: w.c, solid: lit[w.r][w.c] && !isTerrainSuppressed(dyn, lit, w.r, w.c) ? 1 : 0 });
      }
      for (let i = 0; i < dyn.entities.length; i++) {
        const e = dyn.entities[i];
        if (e.kind === "C" || e.kind === "F") {
          arr.push({ key: `E_${e.id}`, tag: e.kind, r: e.r, c: e.c, solid: isEntitySolid(dyn, lit, e) ? 1 : 0 });
        }
      }
      return arr;
    };

    const hasSuppression = (dyn, lit) => {
      for (let i = 0; i < staticMap.iceWalls.length; i++) {
        const w = staticMap.iceWalls[i];
        if (!lit[w.r][w.c] && isTerrainSuppressed(dyn, lit, w.r, w.c)) return true;
      }
      for (let i = 0; i < staticMap.treeWalls.length; i++) {
        const w = staticMap.treeWalls[i];
        if (lit[w.r][w.c] && isTerrainSuppressed(dyn, lit, w.r, w.c)) return true;
      }
      for (let i = 0; i < dyn.entities.length; i++) {
        const e = dyn.entities[i];
        if (((e.kind === "C" && !lit[e.r][e.c]) || (e.kind === "F" && lit[e.r][e.c])) && isEntitySuppressed(dyn, e)) return true;
      }
      return false;
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

    let prevPhases = snapshotPhases(curDyn, curLit);
    let prevSup = hasSuppression(curDyn, curLit);
    let prevLockedGoals = countLockedGoals(staticMap, curDyn, curLit);

    const itemFlipCounts = new Map();
    const pushSeqIds = [];
    let pushes = 0, phaseFlips = 0, bodyShadowFlips = 0;
    let suppressionCount = 0, goalUnseats = 0, swapCount = 0;
    let curWalkStreak = 0, maxWalkStreak = 0;
    let lastStepPushed = true;

    for (let i = 0; i < path.length; i++) {
      const mv = path[i];
      const res = stepState(staticMap, curDyn, curLit, mv.dr, mv.dc, mv.dir);
      if (!res) break;
      lastStepPushed = Boolean(res.pushedKind);

      if (res.pushedKind) {
        pushes++;
        entityUsed.set(res.pushedId, true);
        if (pushSeqIds[pushSeqIds.length - 1] !== res.pushedId) pushSeqIds.push(res.pushedId);
        const normKind = (res.pushedKind === "\\" || res.pushedKind === "/")
          ? "M"
          : (SPOT_DIRS[res.pushedKind] ? "SP" : res.pushedKind);
        pushEvent(`P:${normKind}`, PUSH_LABEL[normKind] || `推${normKind}`);
      }

      curDyn = res.dyn;
      curLight = computeLighting(staticMap, curDyn, true);
      curLit = curLight.lit;
      recordMirrorHits(curLight);
      markCells(curDyn, curLit);

      const nextPhases = snapshotPhases(curDyn, curLit);
      let stepFlips = 0;
      const flippedBoxes = [];
      for (let k = 0; k < nextPhases.length; k++) {
        if (nextPhases[k].solid !== prevPhases[k].solid) {
          phaseFlips++;
          stepFlips++;
          itemFlipCounts.set(nextPhases[k].key, (itemFlipCounts.get(nextPhases[k].key) || 0) + 1);
          const tg = nextPhases[k].tag;
          const toSolid = nextPhases[k].solid === 1;
          if (tg === "C" || tg === "F") flippedBoxes.push({ r: nextPhases[k].r, c: nextPhases[k].c, tag: tg, toSolid });
          if (tg === "I") pushEvent(toSolid ? "I+" : "I-", toSolid ? "冰墙结冰" : "冰墙融水");
          else if (tg === "V") pushEvent(toSolid ? "V+" : "V-", toSolid ? "琥珀凝实" : "琥珀归虚");
          else if (tg === "C") pushEvent(toSolid ? "C+" : "C-", toSolid ? "雪箱凝结" : "雪箱化水");
          else if (tg === "F") pushEvent(toSolid ? "F+" : "F-", toSolid ? "暖珀凝实" : "暖珀归虚");
        }
      }
      prevPhases = nextPhases;

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
      }

      if (!res.pushedKind && stepFlips === 0) {
        curWalkStreak++;
        if (curWalkStreak > maxWalkStreak) maxWalkStreak = curWalkStreak;
      } else {
        curWalkStreak = 0;
      }

      const curSup = hasSuppression(curDyn, curLit);
      if (curSup && !prevSup) {
        suppressionCount++;
        pushEvent("SUP", "占格压制");
      }
      prevSup = curSup;

      const nowLockedGoals = countLockedGoals(staticMap, curDyn, curLit);
      if (nowLockedGoals < prevLockedGoals) {
        goalUnseats++;
        pushEvent("UNSEAT", "退槽借位");
      }
      prevLockedGoals = nowLockedGoals;
    }

    const handsFreeVictory = steps > 0 && !lastStepPushed;
    if (handsFreeVictory) pushEvent("HANDSFREE", "空手点睛");

    staticMap.goals.forEach(g => {
      const e = solidEntityAt(curDyn, curLit, g.r, g.c);
      if (e) entityUsed.set(e.id, true);
    });

    let mirrorAsObstacleCount = 0;
    let mirrorDualRefractCount = 0;
    initDyn.entities.forEach(e => {
      if (e.kind !== "\\" && e.kind !== "/") return;
      const spots = mirrorRefractSpots.get(e.id);
      const refractCount = spots ? spots.size : 0;
      if (refractCount === 0) {
        mirrorAsObstacleCount++;
        warnings.push("不优雅：折光镜全程未折射光线（被当成了障碍物/挡光板）");
      } else if (refractCount >= 2) {
        mirrorDualRefractCount++;
        pushEvent("M_REUSE", "镜子双位折光");
      }
    });

    let unusedItemCount = 0;
    initDyn.entities.forEach(e => {
      if (e.kind === "\\" || e.kind === "/") return;
      if (!entityUsed.get(e.id)) {
        unusedItemCount++;
        warnings.push(`存在毫无意义的闲置道具「${e.kind}」（全程未参与解题）`);
      }
    });

    const idAppearances = new Map();
    for (let i = 0; i < pushSeqIds.length; i++) {
      idAppearances.set(pushSeqIds[i], (idAppearances.get(pushSeqIds[i]) || 0) + 1);
    }
    let interleavedReuses = 0;
    idAppearances.forEach(cnt => { if (cnt >= 2) interleavedReuses += (cnt - 1); });

    let pingPongFlips = 0;
    itemFlipCounts.forEach(cnt => { if (cnt >= 2) pingPongFlips++; });

    let floorCount = 0, wasteFloors = 0;
    for (let r = 0; r < staticMap.rows; r++) {
      for (let c = 0; c < staticMap.cols; c++) {
        if (!staticMap.walls[r][c] && !staticMap.suns.some(s => s.r === r && s.c === c)) {
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
      warnings.push(`存在 ${redundantWallLayers} 处毫无意义的多余外层死墙（建议点击左侧「剪枝废格与厚墙」）`);
    }

    const emergentTotal = suppressionCount + swapCount + goalUnseats;
    const cleverScore = Math.min(
      35,
      Math.round(
        mirrorDualRefractCount * 12 +
        (handsFreeVictory ? 10 : 0) +
        interleavedReuses * 9 +
        pingPongFlips * 7 +
        Math.min(12, bodyShadowFlips * 6) +
        emergentTotal * 8 +
        Math.min(8, phaseFlips * 2.5)
      )
    );

    const actionDensity = (pushes + bodyShadowFlips) / Math.max(1, floorCount);
    const sizePts = floorCount <= 16 ? 12 : floorCount <= 22 ? 8 : floorCount <= 28 ? 4 : 0;
    const compactScore = Math.min(25, Math.round(Math.min(13, actionDensity * 22) + sizePts));

    const trapDensity = steps > 0 ? explored / steps : 1;
    const depthScore = Math.min(
      25,
      Math.round(Math.min(17, Math.log10(Math.max(1, trapDensity)) * 9.5) + Math.min(8, steps * 0.45))
    );

    const walkPenalty = Math.max(0, maxWalkStreak - 4) * 2;
    const purityScore = Math.max(0, 15 - wasteFloors * 2 - redundantWallLayers * 4 - walkPenalty);

    const penalty = mirrorAsObstacleCount * 35 + unusedItemCount * 25 + (externalWarnings ? externalWarnings.length * 25 : 0);
    const score = Math.max(0, Math.min(100, cleverScore + compactScore + depthScore + purityScore - penalty));

    let grade = "C", label = "C 级教学";
    if (score >= 80) { grade = "S"; label = "S 级典藏"; }
    else if (score >= 62) { grade = "A"; label = "A 级精品"; }
    else if (score >= 42) { grade = "B"; label = "B 级进阶"; }

    const highlights = [];
    if (mirrorDualRefractCount > 0) highlights.push({ text: `🪞 双位折光 ×${mirrorDualRefractCount}`, cls: "gold" });
    if (handsFreeVictory) highlights.push({ text: `✋ 空手点睛`, cls: "jade" });
    if (interleavedReuses > 0) highlights.push({ text: `🔁 交错复用 ×${interleavedReuses}`, cls: "gold" });
    if (pingPongFlips > 0) highlights.push({ text: `🌗 来回拉扯 ×${pingPongFlips}`, cls: "ice" });
    if (bodyShadowFlips > 0) highlights.push({ text: `👤 自身成荫`, cls: "jade" });
    if (swapCount > 0) highlights.push({ text: `✨ 冰珀互换`, cls: "gold" });
    if (goalUnseats > 0) highlights.push({ text: `🔄 退槽反直觉`, cls: "gold" });
    if (suppressionCount > 0) highlights.push({ text: `⚡ 占格压制`, cls: "ice" });
    if (wasteFloors === 0 && redundantWallLayers === 0 && floorCount <= 20) {
      highlights.push({ text: `💎 零废格微缩`, cls: "jade" });
    }

    const mechanicSig = mechEvents.length ? mechEvents.join(">") : "INIT";
    const mechanicFlow = mechLabels.length
      ? (mechLabels.length > 5 ? mechLabels.slice(0, 4).join(" → ") + " → … → " + mechLabels[mechLabels.length - 1] : mechLabels.join(" → "))
      : "开局即通关";

    return {
      steps, pushes, phaseFlips, interleavedReuses, pingPongFlips, bodyShadowFlips,
      suppressionCount, goalUnseats, swapCount, handsFreeVictory, floorCount, wasteFloors, redundantWallLayers,
      mirrorAsObstacleCount, mirrorDualRefractCount, unusedItemCount,
      maxWalkStreak, trapDensity: Math.round(trapDensity),
      cleverScore, compactScore, depthScore, purityScore,
      score, grade, label, highlights, mechanicSig, mechanicFlow, activeCells
    };
  }

  function solveBFS(gridRows, maxStates = 80000) {
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
        metrics: evaluateElegance(staticMap, dynState, [], 1, [])
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

          const metrics = evaluateElegance(staticMap, dynState, path, visited.size, extWarnings);
          const allWarnings = [...extWarnings];
          if (metrics.mirrorAsObstacleCount > 0) allWarnings.push("折光镜全程未有效折光（被当成了障碍物）");
          if (metrics.unusedItemCount > 0) allWarnings.push(`存在 ${metrics.unusedItemCount} 个未参与解题的闲置道具`);
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
    evaluateElegance, solveBFS
  };
});
