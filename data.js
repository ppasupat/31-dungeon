const [MAP_DATA, NPC_DATA] = function () {
  'use strict';

  const map_data = {}, npc_data = {};

  // ################################
  // Macros

  const itemNames = {
    sword: 'ดาบปราบมาร',
    seedling: 'ต้นกล้า',
    lemon: 'มะนาว',
    tea: 'ใบชา',
    spell: 'เวทศักดิ์สิทธิ์',
  };
  const XXX = (x => '???');
  const GIVE = (x => 'ให้ <b>' + (itemNames[x] || '???') + '</b>');
  const USE = (x => 'ใช้ <b>' + (itemNames[x] || '???') + '</b>');
  const GRAY = '#222', PURPLE = '#dad', GREEN = '#add';

  function escapeHtml(x) {
    return x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function R(mood, enableAction, enableItem, dialog) {
    return {
      mood: mood,
      enableAction: enableAction,
      enableItem: enableItem,
      dialog: dialog,
    };
  }

  // ################################
  // Room 0

  // p0
  map_data.p0 = {
    pid: 'p0', row: 0, col: 0, color: PURPLE,
    arrows: {'e': 'p1'},
    mainNpc: 'dwarfIdle',
  };

  npc_data.dwarfIdle = {
    nid: 'dwarfIdle', loc: 'p0',
    nidAlias: 'dwarf',
    name: 'คนแคระ',
    actionText: 'ช่วยสร้างสะพานที',
    itemText: GIVE,
    mapStates: {'swordGiven': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, true, [
            'สวัสดี ข้าคือช่างก่อสร้างแห่งปราสาทหลังนี้',
          ]);
        case 'action':
          return R(0, true, true, [
            'ขอโทษด้วย ตอนนี้เลื่อยข้าเสีย ตัดไม้ไม่ได้',
          ]);
        case 'sword':
          flags.swordGiven = 1;
          utils.removeItem('sword');
          [
            'dwarfIdle', 'dwarfWorking', 'timeTravelerFirst',
            'bridgeFrame', 'bridge',
          ].map(utils.refreshNpcOnMap);
          return R(1, false, false, [
            'โอ้! ดาบนี้ตัดไม้ได้ดีจริง ๆ เดี๋ยวข้าเริ่มงานเลยแล้วกัน',
          ]);
      }
    },
  };

  // f0 (start)
  map_data.f0 = {
    pid: 'f0', row: 0, col: 0, color: GREEN,
    arrows: {'e': 'f1'},
    hideArrows: {'tutorialDone': 'e'},
    mainNpc: 'fairy',
  };

  npc_data.fairy = {
    nid: 'fairy', loc: 'f0',
    name: 'นางฟ้า',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    mapStates: {'tutorialDone': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, false, [
            '<b>ช่วยด้วย!</b><br>จอมมารมันกลับมาอีกแล้ว',
          ]);
        case 'action':
          flags.tutorialDone = 1;
          utils.refreshNpcOnMap('fairy');
          // Need to set up non-zero flags here.
          flags.seedlingUntouched = 1;
          utils.refreshNpcOnMap('plotFuture');
          utils.showArrows();
          return R(1, false, false, [
            '30 บาทครั้งที่แล้วยังไม่ได้คืนเลยนะยะ<br><b>ไม่ให้ย่ะ!</b>',
          ]);
      }
    },
  };

  // ################################
  // Room 1

  // p1
  map_data.p1 = {
    pid: 'p1', row: 0, col: 1, color: PURPLE,
    arrows: {'w': 'p0'},
    mainNpc: 'dwarfWorking',
  };

  npc_data.dwarfWorking = {
    nid: 'dwarfWorking', loc: 'p1',
    nidAlias: 'dwarf',
    name: 'คนแคระ',
    actionText: '',
    itemText: XXX,
    mapStates: {'swordGiven': 'appear map-dwarf-1'},
    content: function (op, flags, utils) {
      return R(1, false, false, [
        'รอหน่อยนะ คงใช้เวลาก่อสร้างสักพัก',
      ]);
    },
  };

  // f1
  map_data.f1 = {
    pid: 'f1', row: 0, col: 1, color: GREEN,
    arrows: {'w': 'f0', 's': 'f3'},
    hideArrows: {'swordGiven': 's'},
    mainNpc: 'timeTravelerFirst',
  };

  npc_data.timeTravelerFirst = {
    nid: 'timeTravelerFirst', loc: 'f1',
    nidAlias: 'timeTraveler',
    name: '???',
    actionText: 'เอ่อ... ขอตังหน่อย?',
    itemText: XXX,
    mapStates: {'swordGiven': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, !flags.timeMachineTaken, false, ['...']);
        case 'action':
          flags.timeMachineTaken = 1;
          utils.enableTimeMachine();
          return R(0, false, false, [
            '...<br>(คุณได้รับ<b>เครื่องย้อนเวลา</b>)',
          ]);
      }
    },
  }

  // ################################
  // Room 3

  // p3
  map_data.p3 = {
    pid: 'p3', row: 1, col: 1, color: PURPLE,
    arrows: {'s': 'p5'},
  };

  npc_data.bridgeFrame = {
    nid: 'bridgeFrame', loc: 'p3', cosmetic: true,
    name: 'bridgeFrame',
    mapStates: {'swordGiven': 'appear'},
  };

  // f3
  map_data.f3 = {
    pid: 'f3', row: 1, col: 1, color: GREEN,
    arrows: {'n': 'f1', 's': 'f5'},
  };

  npc_data.bridge = {
    nid: 'bridge', loc: 'f3', cosmetic: true,
    name: 'bridge',
    mapStates: {'swordGiven': 'appear'},
  };

  // ################################
  // Room 4

  // p4
  map_data.p4 = {
    pid: 'p4', row: 2, col: 0, color: PURPLE,
    arrows: {'e': 'p5'},
    mainNpc: 'aristocrat',
  };

  npc_data.aristocrat = {
    nid: 'aristocrat', loc: 'p4',
    name: 'ขุนนาง',
    actionText: 'ขอตังหน่อย',
    itemText: XXX,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, false, [
            'เธอเป็นใคร!? จะมาขโมยสมบัติฉันเหรอ?',
          ]);
        case 'action':
          return R(0, true, false, [
            'ฉันไม่ให้สมบัติเธอง่าย ๆ หรอก!',
          ]);
      }
    },
  };

  // f4
  map_data.f4 = {
    pid: 'f4', row: 2, col: 0, color: GRAY,
    arrows: {},
  };

  npc_data.chest = {
    nid: 'chest', loc: 'f4',
    name: 'หีบสมบัติ',
    actionText: 'จิ๊กของ',
    itemText: XXX,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(1, true, false, [
            'มี <b>ใบชา</b> อยู่ในหีบ',
          ]);
        case 'action':
          if (!flags.teaTaken) {
            utils.addItem('tea');
            flags.teaTaken = 1;
            return R(1, true, false, [
              'คุณหยิบ <b>ใบชา</b> มาเล็กน้อย',
            ]);
          } else {
            return R(1, true, false, [
              'พอแล้วลูก งกจริง',
            ]);
          }
      }
    }
  };

  [1, 2, 3, 4, 5].forEach(function (i) {
    npc_data['trash' + i] = {
      nid: 'trash' + i, loc: 'f4',
      nidAlias: 'trash',
      name: 'ของจิปาถะ',
      actionText: '',
      itemText: XXX,
      content: function (op, flags, utils) {
        return R(1, false, false, [
          'มีแต่ของไม่มีประโยชน์',
        ]);
      },
    };
  });

  // ################################
  // Room 5

  // p5
  map_data.p5 = {
    pid: 'p5', row: 2, col: 1, color: PURPLE,
    arrows: {'n': 'p3', 'w': 'p4', 's': 'p7'},
  };

  // f5
  map_data.f5 = {
    pid: 'f5', row: 2, col: 1, color: GREEN,
    arrows: {'n': 'f3', 's': 'f7'},
  };

  // ################################
  // Room 7

  // p7
  map_data.p7 = {
    pid: 'p7', row: 3, col: 1, color: PURPLE,
    arrows: {'n': 'p5', 's': 'p9'},
    mainNpc: 'plotPast',
  }

  npc_data.plotPast = {
    nid: 'plotPast', loc: 'p7',
    nidAlias: 'plot',
    name: 'แปลงปลูกพืช',
    actionText: 'จิ๊กของ',
    itemText: USE,
    mapStates: {'seedlingPlanted': 'map-plot-1'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.seedlingPlanted) {
            return R(0, true, true, [
              'มีแต่ดิน',
            ]);
          } else {
            return R(1, true, true, [
              'มี <b>ต้นกล้า</b> อยู่ในดิน',
            ]);
          }
        case 'action':
          if (!flags.seedlingPlanted) {
            return R(0, true, true, [
              'ไม่มีอะไรอยู่ในดิน',
            ]);
          } else {
            utils.addItem('seedling');
            flags.seedlingPlanted = 0;
            utils.refreshNpcOnMap('plotPast');
            utils.refreshNpcOnMap('plotFuture');
            return R(0, true, true, [
              'คุณถอน <b>ต้นกล้า</b> จากดินอย่างระมัดระวัง',
            ]);
          }
        case 'seedling':
          utils.removeItem('seedling');
          flags.seedlingPlanted = 1;
          utils.refreshNpcOnMap('plotPast');
          utils.refreshNpcOnMap('plotFuture');
          return R(1, true, true, [
            'คุณฝัง <b>ต้นกล้า</b> ลงในดิน',
          ]);
        case 'tea':
          return R(flags.seedlingPlanted ? 1 : 0, true, true, [
            'ใบชาตากแห้ง ใช้ปลูกไม่ได้',
          ]);
        case 'lemon':
          return R(flags.seedlingPlanted ? 1 : 0, true, true, [
            'จะฝังทั้งลูกเลยเหรอ ไม่ดีมั้ง?',
          ]);
        case 'spell':
          return R(flags.seedlingPlanted ? 1 : 0, true, true, [
            'เพื่ออะไร?',
          ]);
      }
    },
  };

  // f7
  map_data.f7 = {
    pid: 'f7', row: 3, col: 1, color: GREEN,
    arrows: {'n': 'f5', 's': 'f9'},
    mainNpc: 'plotFuture',
  }

  npc_data.plotFuture = {
    nid: 'plotFuture', loc: 'f7',
    nidAlias: 'plot',
    name: 'แปลงปลูกพืช',
    actionText: 'จิ๊กของ',
    itemText: USE,
    mapStates: {'seedlingUntouched': 'map-plot-1', 'seedlingPlanted': 'map-plot-2'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (flags.seedlingPlanted) {
            return R(2, true, false, [
              'มี <b>มะนาว</b> อยู่บนต้นไม้',
            ]);
          } else if (flags.seedlingUntouched) {
            return R(1, true, true, [
              'มี <b>ต้นกล้า</b> อยู่ในดิน',
            ]);
          } else {
            return R(0, true, true, [
              'ไม่มีอะไรอยู่ในดิน',
            ]);
          }
        case 'action':
          if (flags.seedlingPlanted) {
            if (!flags.lemonTaken) {
              utils.addItem('lemon');
              flags.lemonTaken = 1;
              return R(2, true, false, [
                'คุณเด็ด <b>มะนาว</b> จากต้นไม้',
              ]);
            } else {
              return R(2, true, false, [
                'พอแล้วลูก งกจริง',
              ]);
            }
          } else {
            if (flags.seedlingUntouched) {
              utils.addItem('seedling');
              flags.seedlingUntouched = 0;
              utils.refreshNpcOnMap('plotFuture');
              return R(0, true, true, [
                'คุณถอน <b>ต้นกล้า</b> จากดินอย่างระมัดระวัง',
              ]);
            } else {
              return R(0, true, true, [
                'ไม่มีอะไรอยู่ในดิน',
              ]);
            }
          }
        case 'seedling':
          utils.removeItem('seedling');
          flags.seedlingUntouched = 1;
          utils.refreshNpcOnMap('plotFuture');
          return R(1, true, true, [
            'คุณฝัง <b>ต้นกล้า</b> ลงในดิน',
          ]);
        case 'tea':
          return R(flags.seedlingUntouched ? 1 : 0, true, true, [
            'ใบชาตากแห้ง ใช้ปลูกไม่ได้',
          ]);
        case 'lemon':
          return R(flags.seedlingUntouched ? 1 : 0, true, true, [
            'จะฝังทั้งลูกเลยเหรอ ไม่ดีมั้ง?',
          ]);
      }
    },
  };

  // ################################
  // Room 8

  // p8
  map_data.p8 = {
    pid: 'p8', row: 4, col: 0, color: PURPLE,
    arrows: {'e': 'p9'},
  };

  // f8
  map_data.f8 = {
    pid: 'f8', row: 4, col: 0, color: GREEN,
    arrows: {'e': 'f9'},
    mainNpc: 'sorcerer',
  };

  npc_data.sorcerer = {
    nid: 'sorcerer', loc: 'f8',
    name: 'จอมเวทย์',
    actionText: 'เวทศักดิ์สิทธิ์ใช้งัย?',
    itemText: GIVE,
    mapStates: {'lemonTeaMade': 'map-sorcerer-3'},
    content: function (op, flags, utils) {
      let mood = function () {
        return 2 * (flags.lemonGiven ? 1 : 0) + (flags.teaGiven ? 1 : 0)
      };
      switch (op) {
        case 'enter':
          if (flags.teaGiven && flags.lemonGiven) {
            return R(3, true, false, [
              'ขอบใจเจ้าอีกครั้ง',
            ]);
          } else {
            return R(mood(), false, true, [
              '<b>แค่ก ๆ</b><br>ข้า... เจ็บ... คอ...',
            ]);
          }
        case 'action':
          return R(3, true, false, [
            'วาด<b>วงเวทย์</b><br>แล้วท่อง<b>คาถา</b><br>',
            'ของที่อยู่ในวงเวทจะถูกล้างมลทิน!',
          ]);
        case 'lemon':
          utils.removeItem('lemon');
          flags.lemonGiven = 1;
          if (!flags.teaGiven) {
            return R(2, false, true, [
              '<b>มะนาว</b>รึ?<br>ก็ดีนะ แต่กินมะนาวเฉย ๆ มันเปรี้ยวเกิน',
            ]);
          } else {
            flags.lemonTeaMade = 1;
            utils.refreshNpcOnMap('sorcerer');
            utils.addItem('spell');
            return R(3, true, false, [
              'ชามะนาวได้ผลดีจริง ๆ ข้าจะให้ <b>เวทศักดิ์สิทธิ์</b> แก่เจ้า'
            ]);
          }
        case 'tea':
          utils.removeItem('tea');
          flags.teaGiven = 1;
          if (!flags.lemonGiven) {
            return R(1, false, true, [
              '<b>ชา</b>รึ?<br>ก็ดีนะ แต่กินชาเฉย ๆ มันขมเกิน',
            ]);
          } else {
            flags.lemonTeaMade = 1;
            utils.refreshNpcOnMap('sorcerer');
            utils.addItem('spell');
            return R(3, true, false, [
              'ชามะนาวได้ผลดีจริง ๆ ข้าจะให้ <b>เวทศักดิ์สิทธิ์</b> แก่เจ้า',
            ]);
          }
        case 'seedling':
          return R(mood(), false, true, [
            'แค่ก ๆ ไม่เอา กินไม่ได้',
          ]);
      }
    },
  };

  // ################################
  // Room 9

  // p9
  map_data.p9 = {
    pid: 'p9', row: 4, col: 1, color: PURPLE,
    arrows: {'w': 'p8', 'n': 'p7'},
    mainNpc: 'throne',
  };

  npc_data.throne = {
    nid: 'throne', loc: 'p9',
    name: 'บัลลังก์',
    actionText: 'จิ๊กของ',
    itemText: USE,
    mapStates: {'magicCircleDrawn': 'map-throne-1'},
    content: function (op, flags, utils) {
      let mood = function () {return flags.magicCircleDrawn ? 1 : 0};
      switch (op) {
        case 'enter':
          return R(mood(), true, true, [
            'เก้าอี้สุดหรู สำหรับเจ้าของปราสาท',
          ]);
        case 'action':
          return R(mood(), true, true, [
            'บัลลังก์ใหญ่เกินไป จิ๊กไม่ได้',
          ]);
        case 'spell':
          if (flags.magicCircleDrawn) {
            return R(mood(), true, true, [
              'คุณได้วาด <b>วงเวทย์</b> ไว้แล้ว',
            ]);
          } else {
            flags.magicCircleDrawn = 1;
            utils.refreshNpcOnMap('throne');
            utils.refreshNpcOnMap('boss');
            return R(mood(), true, true, [
              'คุณวาด <b>วงเวทย์</b> ข้างล่างบัลลังก์',
            ]);
          }
        case 'lemon':
          return R(mood(), true, true, [
            'คุณใช้ <b>มะนาว</b><br>บัลลังก์เปรี้ยวขึ้นเล็กน้อย',
          ]);
        case 'tea':
          return R(mood(), true, true, [
            'คุณใช้ <b>ชา</b><br>บัลลังก์กลิ่นหอมขึ้นเล็กน้อย',
          ]);
        case 'seedling':
          return R(mood(), true, true, [
            'คุณใช้ <b>ต้นกล้า</b><br>บัลลังก์เปรอะดินเล็กน้อย',
          ]);
      }
    },
  };

  // f9
  map_data.f9 = {
    pid: 'f9', row: 4, col: 1, color: GREEN,
    arrows: {'w': 'f8', 'n': 'f7'},
    mainNpc: 'boss',
  };

  npc_data.boss = {
    nid: 'boss', loc: 'f9',
    name: 'จอมมารที่ชื่อว่าอนุทิ',
    actionText: 'ร่างใหม่น่าเกลียดจัง',
    itemText: USE,
    mapStates: {'magicCircleDrawn': 'map-boss-1'},
    content: function (op, flags, utils) {
      let mood = function () {return flags.magicCircleDrawn ? 1 : 0};
      switch (op) {
        case 'enter':
          return R(mood(), true, true, [
            '<b>ฮ่า ๆ</b><br>เจอกันอีกแล้วสินะ ครั้งนี้แกเสร็จข้าแน่!',
          ]);
        case 'action':
          return R(mood(), true, true, [
            '<b>ฮ่า ๆ</b><br>ร่างใหม่ของข้า ถึงดาบปราบมารก็ไม่สะท้าน!',
          ]);
        case 'spell':
          if (!flags.magicCircleDrawn) {
            return R(mood(), true, true, [
              '<b>ฮ่า ๆ</b><br>แค่เศษกระดาษ จะทำอะไรข้าได้!',
            ]);
          } else {
            utils.removeItem('spell');
            flags.gameWon = 1;
            utils.refreshNpcOnMap('boss');
            return R(2, false, false, [
              'ทำไมมันร้อนอย่างนี้!<br><b>อ้ากกกก!!!</b><br>ฝากไว้ก่อนเถอะ!!!',
            ]);
          }
        case 'lemon':
          return R(mood(), true, true, [
            '<b>ฮ่า ๆ</b><br>เปรี้ยวนักเรอะ?!',
          ]);
        case 'tea':
          return R(mood(), true, true, [
            '<b>ฮ่า ๆ</b><br>ข้ามีพลัง<b>กันชา</b>!',
          ]);
        case 'seedling':
          return R(mood(), true, true, [
            '<b>ฮ่า ๆ</b><br>เธอไม่ "กล้า" หือข้าหรอก</b>!',
          ]);
      }
    },
  };

  // ################################
  // Win screen

  map_data.fx = {
    pid: 'fx', row: 4, col: 2, color: GREEN,
    arrows: {},
  };

  // Don't persist the states
  let congratsState = 0, congratsMood = 1;
  let congratsTexts = [
    {q: 'เธอเป็นใคร?', a: '... ฉันคือเธอจากโลกอนาคต ...'},
    {q: 'เธอมาที่นี่ทำไม?', a: '... ฉันมาช่วยเธอปราบจอมมาร ...'},
    {q: 'อนาคตฉันเป็นงัย?', a: '... ปีหน้า เธอจะอายุมากขึ้น 1 ปี ...'},
    {q: 'หวยงวดหน้าออกอะไร?', a: '... จำได้แต่ว่าเป็นเลข 6 หลัก ...'},
    {q: 'ฉันจะได้แต่งงานไหม?', a: '... อืม คงได้แต่งงานวิจัยอีก ...'},
    {q: 'มีอะไรจะบอกอีกไหม?', a: '... สุขสันต์วันเกิดนะ!'},
  ];

  npc_data.timeTravelerCongrats = {
    nid: 'timeTravelerCongrats', loc: 'fx',
    nidAlias: 'timeTraveler',
    name: '???',
    actionText: congratsTexts[0].q,
    itemText: XXX,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, false, ['...']);
        case 'action':
          let answer = [
            '<i>' + congratsTexts[congratsState].q + '</i><br>',
            congratsTexts[congratsState].a,
          ];
          congratsState += 1;
          if (congratsState === congratsTexts.length) {
            congratsMood = 2;
            congratsState = 0;
          }
          utils.changeActionText(congratsTexts[congratsState].q);
          return R(congratsMood, true, false, answer);
      };
    },
  };

  return [map_data, npc_data];

}();
