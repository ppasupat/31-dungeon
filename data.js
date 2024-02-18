const [MAP_DATA, NPC_DATA] = function () {
  'use strict';

  const map_data = {}, npc_data = {};

  // ################################
  // Macros

  const itemNames = {
    sword: 'ดาบปราบมาร',
  };
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
  // Data

  // f0: fairy (start)
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
              '<b>ช่วยด้วย!</b><br>',
              'จอมมารจาก 2 ปีที่แล้ว มันกลับมาอีกแล้ว!']);
        case 'action':
          flags.tutorialDone = 1;
          utils.refreshNpcOnMap('fairy');
          utils.showArrows();
          return R(1, false, false, [
            'นี่เธอยังไม่ได้คืน 30 บาทที่ยืมไปเลยนะ!<br>',
            '<b>ไม่ให้โว้ย!</b>']);
      }
    },
  };

  // f1
  map_data.f1 = {
    pid: 'f1', row: 0, col: 3,
    arrows: {'w': 'f0'},
    mainNpc: 'timemachineCase',
  };

  npc_data.timemachineCase = {
    nid: 'timemachineCase', loc: 'f1',
    name: '',
    actionText: 'หยิบ <b>ไทม์แมชชีน</b>',
    itemText: GIVE,
    mapStates: {'timemachinePickedUp': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, false, [
            '']);
        case 'action':
          flags.timemachinePickedUp = 1;
          utils.addItem('timemachine');
          utils.refreshNpcOnMap('timemachineCase');
          return R(1, false, false, [
            '']);
      }
    },
  };
  
  return [map_data, npc_data];

}();
