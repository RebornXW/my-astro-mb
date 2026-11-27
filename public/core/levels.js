/**
 * LumenBox Chapters & Levels Data (12 Chapters x 12 Slots = 144 Levels)
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

  const CHAPTER_ORDER = [1,2,3,4,5,6,7,8,9,10,11,12];
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
          "rewardName": "青竹斗笠",
          "rewardSwatch": "linear-gradient(135deg, #5B8E74 0%, #D4B36A 100%)",
          "rewardReqPlat": 12
      },
      "3": {
          "numStr": "03",
          "shortName": "交 响",
          "title": "卷三 · 交响",
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
          "rewardName": "八音盒音色",
          "rewardSwatch": "linear-gradient(135deg, #8EC9D8 0%, #E7D2A2 100%)",
          "rewardReqPlat": 12
      },
      "5": {
          "numStr": "05",
          "shortName": "单 芒",
          "title": "卷五 · 单芒",
          "bgDay": "linear-gradient(142deg, #FFF5E6 0%, #F7DBB7 54%, #EDD3BE 100%)",
          "bgNight": "linear-gradient(142deg, #3D281F 0%, #232234 64%, #1A1E2E 100%)",
          "auraDay": "rgba(250, 184, 112, 0.44)",
          "auraNight": "rgba(240, 158, 86, 0.26)",
          "rewardName": "雪球精灵",
          "rewardSwatch": "linear-gradient(135deg, #EEF7FF 0%, #E8A23C 100%)",
          "rewardReqPlat": 12
      },
      "6": {
          "numStr": "06",
          "shortName": "回 环",
          "title": "卷六 · 回环",
          "bgDay": "linear-gradient(142deg, #FCF0EC 0%, #F0D6DF 54%, #E3DCF0 100%)",
          "bgNight": "linear-gradient(142deg, #382338 0%, #202238 64%, #192033 100%)",
          "auraDay": "rgba(236, 168, 192, 0.42)",
          "auraNight": "rgba(216, 146, 184, 0.24)",
          "rewardName": "极光银蓝光",
          "rewardSwatch": "linear-gradient(135deg, #84D4FF 0%, #DCE8FF 100%)",
          "rewardReqPlat": 12
      },
      "7": {
          "numStr": "07",
          "shortName": "隔 窗",
          "title": "卷七 · 隔窗",
          "bgDay": "linear-gradient(142deg, #ECF3FC 0%, #D4E4F7 54%, #E6EBF5 100%)",
          "bgNight": "linear-gradient(142deg, #1B2C4A 0%, #151F34 65%, #1E2840 100%)",
          "auraDay": "rgba(136, 184, 242, 0.42)",
          "auraNight": "rgba(112, 168, 242, 0.26)",
          "rewardName": "琉璃雾蓝",
          "rewardSwatch": "linear-gradient(135deg, #D0E1F0 0%, #6D88A8 100%)",
          "rewardReqPlat": 12
      },
      "8": {
          "numStr": "08",
          "shortName": "分 光",
          "title": "卷八 · 分光",
          "bgDay": "linear-gradient(142deg, #EFEBF9 0%, #DDDDF6 52%, #F1E4F0 100%)",
          "bgNight": "linear-gradient(142deg, #27254B 0%, #181B32 65%, #23203B 100%)",
          "auraDay": "rgba(170, 158, 246, 0.40)",
          "auraNight": "rgba(154, 142, 240, 0.26)",
          "rewardName": "星夜使者",
          "rewardSwatch": "linear-gradient(135deg, #2E3A58 0%, #F0C050 100%)",
          "rewardReqPlat": 12
      },
      "9": {
          "numStr": "09",
          "shortName": "澄 明",
          "title": "卷九 · 澄明",
          "bgDay": "linear-gradient(142deg, #E8F4F8 0%, #D2E8F2 54%, #E7F0F5 100%)",
          "bgNight": "linear-gradient(142deg, #183042 0%, #131E2C 66%, #1B2A38 100%)",
          "auraDay": "rgba(126, 206, 232, 0.42)",
          "auraNight": "rgba(96, 192, 224, 0.26)",
          "rewardName": "古琴泛音",
          "rewardSwatch": "linear-gradient(135deg, #6EA4BC 0%, #2C3A48 100%)",
          "rewardReqPlat": 12
      },
      "10": {
          "numStr": "10",
          "shortName": "日 契",
          "title": "卷十 · 日契",
          "bgDay": "linear-gradient(142deg, #EAEAF0 0%, #D9DFF0 52%, #EFE2C8 100%)",
          "bgNight": "linear-gradient(142deg, #1C253B 0%, #181E2E 56%, #332A1C 100%)",
          "auraDay": "rgba(232, 194, 126, 0.42)",
          "auraNight": "rgba(238, 186, 84, 0.25)",
          "rewardName": "暮色微光",
          "rewardSwatch": "linear-gradient(135deg, #101520 0%, #E5A435 100%)",
          "rewardReqPlat": 12
      },
      "11": {
          "numStr": "11",
          "shortName": "逆 旅",
          "title": "卷十一 · 逆旅",
          "bgDay": "linear-gradient(142deg, #F4EDF7 0%, #E4DDF0 50%, #F7E4CF 100%)",
          "bgNight": "linear-gradient(142deg, #2B2442 0%, #1E2133 56%, #332824 100%)",
          "auraDay": "rgba(230, 178, 214, 0.40)",
          "auraNight": "rgba(210, 152, 204, 0.24)",
          "rewardName": "日冕金箔光",
          "rewardSwatch": "linear-gradient(135deg, #FFE48A 0%, #D48E22 100%)",
          "rewardReqPlat": 12
      },
      "12": {
          "numStr": "12",
          "shortName": "十 二",
          "title": "卷十二 · 十二",
          "bgDay": "linear-gradient(138deg, #EAF6FF 0%, #FAF3E2 48%, #F9DFAC 100%)",
          "bgNight": "linear-gradient(138deg, #21344D 0%, #25283B 50%, #3E301B 100%)",
          "auraDay": "rgba(255, 214, 120, 0.50)",
          "auraNight": "rgba(246, 198, 92, 0.28)",
          "rewardName": "琉璃旅人",
          "rewardSwatch": "linear-gradient(135deg, #74CBF4 0%, #F2B23E 100%)",
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
      id: 901, code: "重-1", chapter: 4, slot: 1,
      hint: "先把提灯左推一格让雪箱凝结、暖珀归虚，把雪箱推过暖珀（触发冰珀雪花互映）送入右槽，再用提灯逐格护送暖珀入左槽。",
      optimalSteps: 32,
      map: [
        "########",
        "#..LP..#",
        "#.....##",
        "#X.CF.X#",
        "#S######"
      ]
    },
    {
      id: 902, code: "重-2", chapter: 4, slot: 2,
      hint: "先右推折光镜到第 5 列让暖珀墙归虚，把雪箱推进暖珀格，再把折光镜一路左推到第 3 列（中途暖珀墙会短暂封存雪箱），最后送雪箱入槽。",
      optimalSteps: 15,
      map: [
        "########",
        "#S..\\..#",
        "#P.....#",
        "#.C.V.X#",
        "########"
      ]
    },
    {
      id: 903, code: "重-3", chapter: 4, slot: 3,
      hint: "把木箱直接下推压在融化的雪箱上（木匣浅凹呈现雪花嵌印），再把木箱右推挡住太阳冻住雪箱，送雪箱进下槽后把木箱推进右上终点。",
      optimalSteps: 17,
      map: [
        "########",
        "#P...#.#",
        "#...B#X#",
        "#...C..S",
        "#..X#..#",
        "########"
      ]
    },
    {
      id: 904, code: "重-4", chapter: 4, slot: 4,
      hint: "推提灯到第 4 列融化寒冰墙，把暖珀箱推过冰墙格进入终点（若中途移开提灯，可观察寒冰墙顶面玻璃层内封暖珀方晶的效果）。",
      optimalSteps: 7,
      map: [
        "########",
        "#P.L...#",
        "#......#",
        "#..FIX.#",
        "###S#S##"
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
