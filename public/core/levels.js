/**
 * LumenBox Chapters & Levels Data (6 Chapters x 12 Slots = 72 Levels)
 * Maintained by lumenbox_editor.html.
 * Compatible with Browser (<script src="./core/levels.js">) and CommonJS / Mini-Programs.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LUMENBOX_DATA = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function () {
  "use strict";

  const CHAPTER_ORDER = [1,2,3,4,5,6];
  const SLOTS_PER_CHAPTER = 12;

  const CHAPTER_META = {
      "1": {
          "numStr": "01",
          "shortName": "初 雪",
          "title": "卷一 · 初雪",
          "bgDay": "linear-gradient(142deg, #F5FAFF 0%, #DFEFFB 48%, #FBF2DE 100%)",
          "bgNight": "linear-gradient(142deg, #1E324C 0%, #172336 62%, #262A38 100%)",
          "auraDay": "rgba(130, 206, 250, 0.42)",
          "auraNight": "rgba(96, 186, 246, 0.28)",
          "rewardName": "静谧青院",
          "rewardSwatch": "linear-gradient(135deg, #D5E2E6 0%, #7C9AA4 100%)",
          "rewardReqPlat": 12
      },
      "2": {
          "numStr": "02",
          "shortName": "琥 珀",
          "title": "卷二 · 琥珀",
          "bgDay": "linear-gradient(142deg, #FFFBF0 0%, #FBE7C2 54%, #F2DFC6 100%)",
          "bgNight": "linear-gradient(142deg, #3D2E1D 0%, #24212E 65%, #1A1F2E 100%)",
          "auraDay": "rgba(255, 204, 112, 0.48)",
          "auraNight": "rgba(244, 182, 72, 0.26)",
          "rewardName": "影青玉",
          "rewardSwatch": "linear-gradient(135deg, #D2E8E2 0%, #3F7A73 100%)",
          "rewardReqPlat": 12
      },
      "3": {
          "numStr": "03",
          "shortName": "霜 晴",
          "title": "卷三 · 霜晴",
          "bgDay": "linear-gradient(138deg, #E3F3FD 0%, #F8F4EC 50%, #FCE5BE 100%)",
          "bgNight": "linear-gradient(138deg, #1E344D 0%, #23283A 52%, #3B2D1E 100%)",
          "auraDay": "rgba(252, 212, 134, 0.44)",
          "auraNight": "rgba(116, 198, 248, 0.25)",
          "rewardName": "暖木午后",
          "rewardSwatch": "linear-gradient(135deg, #F0E6D5 0%, #8F643E 100%)",
          "rewardReqPlat": 12
      },
      "4": {
          "numStr": "04",
          "shortName": "叠 影",
          "title": "卷四 · 叠影",
          "bgDay": "linear-gradient(142deg, #EEF6F5 0%, #D8EAE7 52%, #EFE8DC 100%)",
          "bgNight": "linear-gradient(142deg, #1B3338 0%, #172330 65%, #1E2434 100%)",
          "auraDay": "rgba(124, 208, 194, 0.38)",
          "auraNight": "rgba(96, 196, 184, 0.24)",
          "rewardName": "霜晶琉璃",
          "rewardSwatch": "linear-gradient(135deg, #E8FAFF 0%, #4EAEE2 100%)",
          "rewardReqPlat": 12
      },
      "5": {
          "numStr": "05",
          "shortName": "孤 照",
          "title": "卷五 · 孤照",
          "bgDay": "linear-gradient(142deg, #FFF5E6 0%, #F7DBB7 54%, #EDD3BE 100%)",
          "bgNight": "linear-gradient(142deg, #3D281F 0%, #232234 64%, #1A1E2E 100%)",
          "auraDay": "rgba(250, 184, 112, 0.44)",
          "auraNight": "rgba(240, 158, 86, 0.26)",
          "rewardName": "星夜使者",
          "rewardSwatch": "linear-gradient(135deg, #2E3A58 0%, #F0C050 100%)",
          "rewardReqPlat": 12
      },
      "6": {
          "numStr": "06",
          "shortName": "澄 明",
          "title": "卷六 · 澄明",
          "bgDay": "linear-gradient(138deg, #EAF6FF 0%, #FAF3E2 48%, #F9DFAC 100%)",
          "bgNight": "linear-gradient(138deg, #21344D 0%, #25283B 50%, #3E301B 100%)",
          "auraDay": "rgba(255, 214, 120, 0.50)",
          "auraNight": "rgba(246, 198, 92, 0.28)",
          "rewardName": "暮色微光",
          "rewardSwatch": "linear-gradient(135deg, #101520 0%, #E5A435 100%)",
          "rewardReqPlat": 12
      }
  };

  const LEVELS = [
    {
      id: 1, code: "1-1", chapter: 1, slot: 1,
      hint: "先把太阳灯向右推一格融化寒冰墙，再把木箱推进终点凹槽。",
      optimalSteps: 9,
      map: [
        "#######",
        "#P.L..#",
        "#..#..#",
        "#.B.IX#",
        "#######"
      ]
    },
    {
      id: 2, code: "1-2", chapter: 1, slot: 2,
      hint: "走入太阳光束，用你自己的背影把水洼冻成雪箱，再一路护送入槽。",
      optimalSteps: 4,
      map: [
        "#######",
        "#P....#",
        "#S.C.X#",
        "#.....#",
        "#######"
      ]
    },
    {
      id: 3, code: "1-3", chapter: 1, slot: 3,
      hint: "太阳在头顶，人走开影子就没了——先把木箱推到太阳正下方当遮阳伞。",
      optimalSteps: 6,
      map: [
        "#####S##",
        "#.B....#",
        "#P###.##",
        "#..C.X.#",
        "########"
      ]
    },
    {
      id: 4, code: "1-4", chapter: 1, slot: 4,
      hint: "先推折光镜到第 5 列融冰送木箱，再把折光镜右推一格熄光护送雪箱。",
      optimalSteps: 22,
      map: [
        "#########",
        "#S..\\..##",
        "#P#...#.#",
        "#.B..I.X#",
        "#..C...X#",
        "#########"
      ]
    },
    {
      id: 5, code: "1-5", chapter: 1, slot: 5,
      hint: "唯一木箱先去光束中站岗挡光送雪箱入槽，再撤下来自己进右上终点。",
      optimalSteps: 11,
      map: [
        "####S#",
        "##...#",
        "#PB..#",
        "##XCX#",
        "######"
      ]
    },
    {
      id: 6, code: "1-6", chapter: 1, slot: 6,
      hint: "参考思路：冰墙结冰 → 自身成荫 → 冰墙融水 → 自身成荫 → … → 推雪箱。",
      optimalSteps: 16,
      map: [
        "######",
        "#.XB.#",
        "#.CP.#",
        "S..XI#",
        "######"
      ]
    },
    {
      id: 13, code: "1-7", chapter: 1, slot: 7,
      hint: "参考思路：推提灯 → 雪箱凝结 → 冰墙融水 → 自身成荫 → … → 空手点睛。",
      optimalSteps: 19,
      map: [
        "#######",
        "##..I.#",
        "##CBPX#",
        "#.\\.L##",
        "##X...#",
        "#######"
      ]
    },
    {
      id: 14, code: "1-8", chapter: 1, slot: 8,
      hint: "参考思路：推雪箱 → 雪箱化水 → 雪箱凝结 → 自身成荫 → … → 镜子双位折光。",
      optimalSteps: 18,
      map: [
        "#######",
        "#P.####",
        "##C..##",
        "#../..S",
        "#X.XB.#",
        "#######"
      ]
    },
    {
      id: 15, code: "1-9", chapter: 1, slot: 9,
      hint: "参考思路：推雪箱 → 雪箱化水 → 推折光镜 → 雪箱凝结 → … → 推雪箱。",
      optimalSteps: 18,
      map: [
        "##S####",
        "##XB.P#",
        "##..C.#",
        "#./.###",
        "#X..###",
        "#######"
      ]
    },
    {
      id: 16, code: "1-10", chapter: 1, slot: 10,
      hint: "参考思路：推雪箱 → 推木箱 → 冰墙融水 → 冰墙结冰 → … → 推雪箱。",
      optimalSteps: 18,
      map: [
        "#######",
        "#.##X##",
        "#I..X##",
        "#\\CB..S",
        "#....P#",
        "#######"
      ]
    },
    {
      id: 17, code: "1-11", chapter: 1, slot: 11,
      hint: "参考思路：推折光镜 → 雪箱凝结 → 推雪箱 → 雪箱化水 → … → 镜子双位折光。",
      optimalSteps: 21,
      map: [
        "#######",
        "###.BX#",
        "#PC..##",
        "#.\\.L##",
        "#X...I#",
        "#######"
      ]
    },
    {
      id: 18, code: "1-12", chapter: 1, slot: 12,
      hint: "参考思路：推提灯 → 雪箱凝结 → 推雪箱 → 雪箱化水 → … → 推雪箱。",
      optimalSteps: 20,
      map: [
        "#######",
        "#.I...#",
        "#.BXL.#",
        "#...CP#",
        "#X#####",
        "#######"
      ]
    },
    {
      id: 7, code: "2-1", chapter: 2, slot: 1,
      hint: "暖珀箱见光凝实、入影归虚：走入光束让它虚化，穿身绕到背后推出终点。",
      optimalSteps: 8,
      map: [
        "########",
        "#..#####",
        "#S.X.F.#",
        "#P.#####",
        "########"
      ]
    },
    {
      id: 8, code: "2-2", chapter: 2, slot: 2,
      hint: "参考思路：虚化穿身 → 推折光镜 → 琥珀归虚 → 影开珀门 → … → 镜子双位折光。",
      optimalSteps: 20,
      map: [
        "#######",
        "S....V#",
        "#X..\\.#",
        "#.F...#",
        "#P....#",
        "#######"
      ]
    },
    {
      id: 9, code: "2-3", chapter: 2, slot: 3,
      hint: "参考思路：虚化穿身 → 推折光镜 → 虚化穿身 → 影开珀门 → … → 跨光接力。",
      optimalSteps: 19,
      map: [
        "#######",
        "#.VP..#",
        "#.F...#",
        "#./...#",
        "#..X..#",
        "##S####"
      ]
    },
    {
      id: 10, code: "2-4", chapter: 2, slot: 4,
      hint: "参考思路：推提灯 → 推折光镜 → 推木箱 → 虚化穿身 → … → 跨光接力。",
      optimalSteps: 23,
      map: [
        "#######",
        "#P.X..#",
        "#...FV#",
        "#../BX#",
        "#...L.#",
        "#######"
      ]
    },
    {
      id: 11, code: "2-5", chapter: 2, slot: 5,
      hint: "参考思路：推木箱 → 暖珀归虚 → 自身成荫 → 虚化穿身 → … → 跨光接力。",
      optimalSteps: 18,
      map: [
        "###S###",
        "#.....#",
        "#..FB.#",
        "#.X.XP#",
        "####S##"
      ]
    },
    {
      id: 12, code: "2-6", chapter: 2, slot: 6,
      hint: "参考思路：推折光镜 → 推木箱 → 暖珀凝实 → 借物遮阳 → … → 推木箱。",
      optimalSteps: 14,
      map: [
        "#####S#",
        "#..PX.#",
        "#...B/#",
        "#.F.X.#",
        "#######"
      ]
    },
    {
      id: 19, code: "2-7", chapter: 2, slot: 7,
      hint: "参考思路：影开珀门 → 虚化穿身 → 推折光镜 → 虚化穿身 → … → 远程唤醒。",
      optimalSteps: 18,
      map: [
        "#######",
        "#...FX#",
        "##.B/V#",
        "##LX.P#",
        "#.....#",
        "#######"
      ]
    },
    {
      id: 20, code: "2-8", chapter: 2, slot: 8,
      hint: "参考思路：影开珀门 → 推折光镜 → 影开珀门 → 推木箱 → … → 镜子双位折光。",
      optimalSteps: 32,
      map: [
        "####S##",
        "#X....#",
        "#P#.B.#",
        "#...\\V#",
        "#.#.FX#",
        "#######"
      ]
    },
    {
      id: 21, code: "2-9", chapter: 2, slot: 9,
      hint: "参考思路：推提灯 → 推折光镜 → 推暖珀 → 暖珀归虚 → … → 跨光接力。",
      optimalSteps: 33,
      map: [
        "#######",
        "#.B.PX#",
        "#.#X..#",
        "#..F\\.#",
        "#V..L.#",
        "#######"
      ]
    },
    {
      id: 22, code: "2-10", chapter: 2, slot: 10,
      hint: "参考思路：推木箱 → 琥珀归虚 → 自身成荫 → 推提灯 → … → 镜子双位折光。",
      optimalSteps: 37,
      map: [
        "#######",
        "#...###",
        "#...###",
        "#...BP#",
        "##./FX#",
        "#VXL.##",
        "#######"
      ]
    },
    {
      id: 23, code: "2-11", chapter: 2, slot: 11,
      hint: "参考思路：推提灯 → 琥珀归虚 → 虚化穿身 → 暖珀凝实 → … → 跨光接力。",
      optimalSteps: 48,
      map: [
        "#######",
        "###..##",
        "#./...#",
        "#.BXX##",
        "#.LPF.#",
        "#.V.###",
        "#######"
      ]
    },
    {
      id: 24, code: "2-12", chapter: 2, slot: 12,
      hint: "参考思路：推木箱 → 虚化穿身 → 影开珀门 → 推木箱 → … → 镜子双位折光。",
      optimalSteps: 35,
      map: [
        "#######",
        "#.....#",
        "#VF.###",
        "#.X.BP#",
        "##X\\..#",
        "###.L.#",
        "#######"
      ]
    },
    {
      id: 25, code: "3-1", chapter: 3, slot: 1,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 暖珀凝实 → 自身成荫 → … → 空手点睛。",
      optimalSteps: 8,
      map: [
        "######",
        "S.C.X#",
        "#....#",
        "#PF.XS",
        "######"
      ]
    },
    {
      id: 26, code: "3-2", chapter: 3, slot: 2,
      hint: "参考思路：推暖珀 → 暖珀归虚 → 推雪箱 → 暖珀凝实 → … → 空手点睛。",
      optimalSteps: 17,
      map: [
        "###S##",
        "#.XF.S",
        "#..C.#",
        "#..PX#",
        "######"
      ]
    },
    {
      id: 27, code: "3-3", chapter: 3, slot: 3,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 虚化穿身 → 暖珀凝实 → … → 空手点睛。",
      optimalSteps: 18,
      map: [
        "######",
        "#..XPS",
        "#.C..#",
        "#.FX.S",
        "######"
      ]
    },
    {
      id: 28, code: "3-4", chapter: 3, slot: 4,
      hint: "参考思路：推提灯 → 暖珀凝实 → 雪箱凝结 → 连锁相变 → … → 跨光接力。",
      optimalSteps: 23,
      map: [
        "#######",
        "#.X.X.#",
        "#.F...#",
        "#...CL#",
        "#.P...#",
        "#######"
      ]
    },
    {
      id: 29, code: "3-5", chapter: 3, slot: 5,
      hint: "参考思路：虚化穿身 → 推雪箱 → 雪箱化水 → 推折光镜 → … → 空手点睛。",
      optimalSteps: 23,
      map: [
        "#######",
        "#..X..#",
        "#....P#",
        "#.VF\\L#",
        "#...CX#",
        "#######"
      ]
    },
    {
      id: 30, code: "3-6", chapter: 3, slot: 6,
      hint: "参考思路：虚化穿身 → 推提灯 → 雪箱凝结 → 暖珀凝实 → … → 跨光接力。",
      optimalSteps: 24,
      map: [
        "#######",
        "#....##",
        "#ICL..#",
        "#P.XF.#",
        "#..X.##",
        "#######"
      ]
    },
    {
      id: 31, code: "3-7", chapter: 3, slot: 7,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 暖珀凝实 → 自身成荫 → … → 推雪箱。",
      optimalSteps: 19,
      map: [
        "#######",
        "#..X.P#",
        "#IXF.L#",
        "#.C...#",
        "#.#..V#",
        "#######"
      ]
    },
    {
      id: 32, code: "3-8", chapter: 3, slot: 8,
      hint: "参考思路：推折光镜 → 琥珀归虚 → 影开珀门 → 推折光镜 → … → 镜子双位折光。",
      optimalSteps: 27,
      map: [
        "#####S#",
        "#P.XX.#",
        "#.IFC.#",
        "#../..#",
        "#.#..V#",
        "#######"
      ]
    },
    {
      id: 33, code: "3-9", chapter: 3, slot: 9,
      hint: "参考思路：推暖珀 → 推提灯 → 暖珀归虚 → 推折光镜 → … → 跨光接力。",
      optimalSteps: 33,
      map: [
        "#######",
        "#.....#",
        "#/I.###",
        "#CL.F.#",
        "#XX..P#",
        "#######"
      ]
    },
    {
      id: 34, code: "3-10", chapter: 3, slot: 10,
      hint: "参考思路：推提灯 → 冰墙结冰 → 暖珀凝实 → 连锁相变 → … → 镜子双位折光。",
      optimalSteps: 20,
      map: [
        "########",
        "#..I..X#",
        "#./C..F#",
        "#...#PX#",
        "#..L...#",
        "########"
      ]
    },
    {
      id: 35, code: "3-11", chapter: 3, slot: 11,
      hint: "参考思路：推暖珀 → 暖珀归虚 → 虚化穿身 → 推提灯 → … → 跨光接力。",
      optimalSteps: 38,
      map: [
        "########",
        "#XC.XI.#",
        "###.L.\\#",
        "#..PF..#",
        "#....###",
        "########"
      ]
    },
    {
      id: 36, code: "3-12", chapter: 3, slot: 12,
      hint: "参考思路：冰墙融水 → 自身成荫 → 虚化穿身 → 推雪箱 → … → 镜子双位折光。",
      optimalSteps: 38,
      map: [
        "########",
        "#IP..L.#",
        "##X..X##",
        "#.CF/V.#",
        "#...####",
        "########"
      ]
    },
    {
      id: 901, code: "重-1", chapter: 4, slot: 1,
      hint: "参考思路：推木箱 → 雪箱凝结 → 自身成荫 → 推雪箱 → … → 推雪箱。",
      optimalSteps: 18,
      map: [
        "#######",
        "#.....#",
        "#XPBCXS",
        "#.....#",
        "#######"
      ]
    },
    {
      id: 902, code: "重-2", chapter: 4, slot: 2,
      hint: "参考思路：推雪箱 → 雪箱化水 → 暖珀归虚 → 自身成荫 → … → 远程唤醒。",
      optimalSteps: 15,
      map: [
        "#######",
        "S.XFX.#",
        "#..C.P#",
        "##..#.#",
        "#######"
      ]
    },
    {
      id: 903, code: "重-3", chapter: 4, slot: 3,
      hint: "参考思路：琥珀凝实 → 自身成荫 → 推雪箱 → 雪箱化水 → … → 占格压制。",
      optimalSteps: 14,
      map: [
        "#######",
        "#XV...S",
        "#PBCX.#",
        "#.....#",
        "#######"
      ]
    },
    {
      id: 904, code: "重-4", chapter: 4, slot: 4,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 虚化穿身 → 暖珀凝实 → … → 冰墙结冰。",
      optimalSteps: 18,
      map: [
        "#######",
        "##....#",
        "#.C..P#",
        "#XFI.XS",
        "#######"
      ]
    },
    {
      id: 41, code: "4-5", chapter: 4, slot: 5,
      hint: "参考思路：推雪箱 → 雪箱化水 → 琥珀归虚 → 自身成荫 → … → 推雪箱。",
      optimalSteps: 17,
      map: [
        "###S###",
        "##XX.##",
        "#.B.C.#",
        "#..VP.#",
        "#######"
      ]
    },
    {
      id: 42, code: "4-6", chapter: 4, slot: 6,
      hint: "参考思路：冰墙融水 → 暖珀凝实 → 连锁相变 → 自身成荫 → … → 冰墙结冰。",
      optimalSteps: 18,
      map: [
        "#######",
        "##....#",
        "#.C...#",
        "#XFIPXS",
        "#######"
      ]
    },
    {
      id: 43, code: "4-7", chapter: 4, slot: 7,
      hint: "参考思路：琥珀归虚 → 自身成荫 → 影开珀门 → 琥珀凝实 → … → 推雪箱。",
      optimalSteps: 23,
      map: [
        "#######",
        "#PV...#",
        "#.C.B.#",
        "#..X#X#",
        "##S####"
      ]
    },
    {
      id: 44, code: "4-8", chapter: 4, slot: 8,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 虚化穿身 → 暖珀凝实 → … → 远程唤醒。",
      optimalSteps: 25,
      map: [
        "#######",
        "#.##..#",
        "#.CV..#",
        "#.FXIXS",
        "#...P##",
        "#######"
      ]
    },
    {
      id: 45, code: "4-9", chapter: 4, slot: 9,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 虚化穿身 → 暖珀凝实 → … → 远程唤醒。",
      optimalSteps: 25,
      map: [
        "#######",
        "#....##",
        "S.IXFX#",
        "#..B..#",
        "#P.####",
        "#######"
      ]
    },
    {
      id: 46, code: "4-10", chapter: 4, slot: 10,
      hint: "参考思路：推雪箱 → 雪箱化水 → 琥珀归虚 → 自身成荫 → … → 远程唤醒。",
      optimalSteps: 20,
      map: [
        "#######",
        "#..#..#",
        "#LIXV.#",
        "#.CF..#",
        "#.PX###",
        "#######"
      ]
    },
    {
      id: 47, code: "4-11", chapter: 4, slot: 11,
      hint: "参考思路：冰墙结冰 → 自身成荫 → 虚化穿身 → 冰墙融水 → … → 跨光接力。",
      optimalSteps: 30,
      map: [
        "#######",
        "#.#P..#",
        "#XI.L.#",
        "#VCF.##",
        "##X.###",
        "#######"
      ]
    },
    {
      id: 48, code: "4-12", chapter: 4, slot: 12,
      hint: "参考思路：冰墙结冰 → 自身成荫 → 冰墙融水 → 自身成荫 → … → 镜子双位折光。",
      optimalSteps: 28,
      map: [
        "#S#####",
        "#.X..##",
        "#IFV\\.#",
        "#X.C..#",
        "#P.#..#",
        "#######"
      ]
    },
    {
      id: 49, code: "5-1", chapter: 5, slot: 1,
      hint: "参考思路：琥珀归虚 → 自身成荫 → 影开珀门 → 琥珀凝实 → … → 推木箱。",
      optimalSteps: 12,
      map: [
        "#######",
        "#P....#",
        "#X.V.<#",
        "#...B.#",
        "#.C..X#",
        "#######"
      ]
    },
    {
      id: 50, code: "5-2", chapter: 5, slot: 2,
      hint: "参考思路：推雪箱 → 推射灯 → 冰墙融水 → 雪箱化水 → … → 远程唤醒。",
      optimalSteps: 20,
      map: [
        "#######",
        "#.....#",
        "#B...<#",
        "#I.CX.#",
        "#XP...#",
        "#######"
      ]
    },
    {
      id: 51, code: "5-3", chapter: 5, slot: 3,
      hint: "参考思路：影开珀门 → 推射灯 → 冰墙结冰 → 雪箱凝结 → … → 推雪箱。",
      optimalSteps: 16,
      map: [
        "#######",
        "#.....#",
        "#P....#",
        "#>C.IX#",
        "#VX.F.#",
        "#######"
      ]
    },
    {
      id: 52, code: "5-4", chapter: 5, slot: 4,
      hint: "参考思路：琥珀归虚 → 自身成荫 → 影开珀门 → 琥珀凝实 → … → 跨光接力。",
      optimalSteps: 22,
      map: [
        "#######",
        "#....X#",
        "#..VF.#",
        "#.B..X#",
        "#..^P.#",
        "#######"
      ]
    },
    {
      id: 53, code: "5-5", chapter: 5, slot: 5,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 虚化穿身 → 暖珀凝实 → … → 跨光接力。",
      optimalSteps: 18,
      map: [
        "#######",
        "#P..###",
        "#>CFX.#",
        "#..I..#",
        "#VX.###",
        "#######"
      ]
    },
    {
      id: 54, code: "5-6", chapter: 5, slot: 6,
      hint: "参考思路：推雪箱 → 影开珀门 → 推雪箱 → 影开珀门 → … → 跨光接力。",
      optimalSteps: 17,
      map: [
        "#######",
        "#.....#",
        "#P.C..#",
        "#.>FV.#",
        "#..X.XS",
        "#######"
      ]
    },
    {
      id: 55, code: "5-7", chapter: 5, slot: 7,
      hint: "参考思路：影开珀门 → 推射灯 → 占格压制 → 推木箱 → … → 远程唤醒。",
      optimalSteps: 17,
      map: [
        "#######",
        "#..FX.#",
        "#..B..#",
        "#P.X..#",
        "#.^V..#",
        "#######"
      ]
    },
    {
      id: 56, code: "5-8", chapter: 5, slot: 8,
      hint: "参考思路：影开珀门 → 推射灯 → 冰墙结冰 → 雪箱凝结 → … → 推雪箱。",
      optimalSteps: 17,
      map: [
        "#######",
        "#.....#",
        "#P....#",
        "#>C.I.#",
        "#VX.FX#",
        "#######"
      ]
    },
    {
      id: 57, code: "5-9", chapter: 5, slot: 9,
      hint: "参考思路：影开珀门 → 推暖珀 → 暖珀归虚 → 琥珀凝实 → … → 跨光接力。",
      optimalSteps: 15,
      map: [
        "#######",
        "#...X.#",
        "#>CF.V#",
        "#VX...#",
        "#....P#",
        "#######"
      ]
    },
    {
      id: 58, code: "5-10", chapter: 5, slot: 10,
      hint: "参考思路：推雪箱 → 雪箱化水 → 推暖珀 → 暖珀归虚 → … → 跨光接力。",
      optimalSteps: 17,
      map: [
        "#######",
        "#...P.#",
        "#..CF.S",
        "#>I..X#",
        "#....X#",
        "#######"
      ]
    },
    {
      id: 59, code: "5-11", chapter: 5, slot: 11,
      hint: "参考思路：暖珀归虚 → 自身成荫 → 虚化穿身 → 暖珀凝实 → … → 跨光接力。",
      optimalSteps: 18,
      map: [
        "#######",
        "#P..###",
        "#>CFX.#",
        "#..I..#",
        "#VX.###",
        "#######"
      ]
    },
    {
      id: 60, code: "5-12", chapter: 5, slot: 12,
      hint: "参考思路：琥珀归虚 → 自身成荫 → 琥珀凝实 → 自身成荫 → … → 跨光接力。",
      optimalSteps: 29,
      map: [
        "###S###",
        "#.P...#",
        "#X..C.#",
        "#I..F.#",
        "#..V^X#",
        "#######"
      ]
    },
    {
      id: 61, code: "6-1", chapter: 6, slot: 1,
      hint: "参考思路：推折光镜 → 占格压制 → 推射灯 → 暖珀凝实 → … → 跨光接力。",
      optimalSteps: 26,
      map: [
        "########",
        "#.#IX.##",
        "#.F\\...S",
        "#.PXC^.#",
        "#.##...#",
        "########"
      ]
    },
    {
      id: 62, code: "6-2", chapter: 6, slot: 2,
      hint: "参考思路：虚化穿身 → 影开珀门 → 推射灯 → 冰墙融水 → … → 镜子双位折光。",
      optimalSteps: 47,
      map: [
        "########",
        "#.XV...#",
        "S^IFC/.#",
        "#P#X#.##",
        "#...#..#",
        "########"
      ]
    }
  ];

  return {
    version: 1,
    chapterOrder: CHAPTER_ORDER,
    slotsPerChapter: SLOTS_PER_CHAPTER,
    chapters: CHAPTER_META,
    levels: LEVELS
  };
});
