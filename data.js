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
  const GRAY = '#667', BROWN = '#741', PURPLE = '#606';

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
    pid: 'p0', row: 0, col: 0,
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
          return R(1, true, true, [
            'ขอโทษด้วย ตอนนี้เลื่อยข้าเสีย ตัดไม้ไม่ได้',
          ]);
        case 'sword':
          flags.swordGiven = 1;
          utils.removeItem('sword');
          [
            'dwarfIdle', 'dwarfWorking', 'timeTravelerFirst',
            'bridgeFrame', 'bridge',
          ].map(utils.refreshNpcOnMap);
          return R(2, false, false, [
            'โอ้! ดาบนี้ตัดไม้ได้ดีจริง ๆ เดี๋ยวข้าเริ่มงานเลยแล้วกัน',
          ]);
      }
    },
  };

  // f0 (start)
  map_data.f0 = {
    pid: 'f0', row: 0, col: 2,
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
    pid: 'p1', row: 0, col: 1,
    arrows: {'w': 'p0'},
    mainNpc: 'dwarfWorking',
  };

  npc_data.dwarfWorking = {
    nid: 'dwarfWorking', loc: 'p1',
    nidAlias: 'dwarf',
    name: 'คนแคระ',
    actionText: '',
    itemText: XXX,
    mapStates: {'swordGiven': 'appear'},
    content: function (op, flags, utils) {
      return R(0, false, false, [
        'รอหน่อยนะ คงใช้เวลาก่อสร้างสักพัก',
      ]);
    },
  };

  // f1
  map_data.f1 = {
    pid: 'f1', row: 0, col: 3,
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
    pid: 'p3', row: 1, col: 1,
    arrows: {'s': 'p5'},
  };

  npc_data.bridgeFrame = {
    nid: 'bridgeFrame', loc: 'p3', cosmetic: true,
    name: 'bridgeFrame',
    mapStates: {'swordGiven': 'appear'},
  };

  // f3
  map_data.f3 = {
    pid: 'f3', row: 1, col: 3,
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
    pid: 'p4', row: 2, col: 0,
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
    pid: 'f4', row: 2, col: 2,
    arrows: {},
    mainNpc: 'safe',
  };

  npc_data.safe = {
    nid: 'safe', loc: 'f4',
    name: 'ตู้เซฟ',
    actionText: 'จิ๊กของ',
    itemText: XXX,
    mapStates: {'safeOpen': 'map-safe-1'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(flags.safeOpen ? 1 : 0, true, false, [
            'ตู้เซฟ ดูแข็งแรง',
          ]);
        case 'action':
          if (!flags.safeOpen) {
            return R(0, true, false, [
              'ตู้เซฟปิดอยู่ ต้องเปิดมันก่อน',
            ]);
          } else if (!flags.teaTaken) {
            utils.addItem('tea');
            flags.teaTaken = 1;
            return R(1, true, false, [
              'คุณหยิบ <b>ใบชา</b> จากตู้เซฟ',
            ]);
          } else {
            return R(1, true, false, [
              'พอแล้วลูก งกจริง',
            ]);
          }
      }
    }
  };

  // ################################
  // Room 5

  // p5
  map_data.p5 = {
    pid: 'p5', row: 2, col: 1,
    arrows: {'n': 'p3', 'w': 'p4', 's': 'p7'},
  };

  // f5
  map_data.f5 = {
    pid: 'f5', row: 2, col: 3,
    arrows: {'n': 'f3', 's': 'f7'},
  };

  // ################################
  // Room 7

  // p7
  map_data.p7 = {
    pid: 'p7', row: 3, col: 1,
    arrows: {'n': 'p5'},
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
    pid: 'f7', row: 3, col: 3,
    arrows: {'n': 'f5'},
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
  
  return [map_data, npc_data];

}();
