const [MAP_DATA, NPC_DATA] = function () {
  'use strict';

  const map_data = {}, npc_data = {};

  // ################################
  // Macros

  const itemNames = {
    powersword: 'ดาบปราบมาร',
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
    hideArrows: {'tutorialDone1': 'e'},
    mainNpc: 'fairy',
  };

  npc_data.fairy = {
    nid: 'fairy', loc: 'f0',
    name: 'นางฟ้า',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    mapStates: {'tutorialDone1': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.gotMoneyFromFairy) 
            return R(0, true, false, [
              'สวัสดีจ้ะ เธอคือผู้กล้าที่จะมาช่วยพวกเราจาก<b>จอมมาร</b>สินะ',
              'มีอะไรให้ฉันช่วยไหม?']);
          else
            return R(0, false, true, [
              'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>แล้วกด “ให้”)</i>']);
        case 'action':
          flags.gotMoneyFromFairy = 1;
          utils.addItem('money');
          return R(1, false, true, [
            'งกจริง!<br>เอาไป <b>30 บาท</b>',
            'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>แล้วกด “ให้”)</i>']);
        case 'money':
          utils.deselectItems();
          flags.tutorialDone1 = flags.tutorialDone2 = 1;
          utils.refreshNpcOnMap('fairy');
          utils.showArrows();
          return R(0, false, false, [
            '555+ ล้อเล่นๆ ไม่ต้องคืนเงินฉันหรอก',
            'ฉันเปิดทางให้แล้ว<br><b>ขอให้โชคดี!</b>']);
      }
    },
  };

  return [map_data, npc_data];

}();
