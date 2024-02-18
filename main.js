$(function () {
  'use strict';

  const MAP_ROW_HEIGHT = 400, MAP_COL_WIDTH = 500,
    MAP_TOP_OFFSET = 0, MAP_LEFT_OFFSET = 0,
    MAP_PANE_HEIGHT = 400, MAP_PANE_WIDTH = 500;

  const UTILS = {};

  let currentPid = null, currentNid = null, flags = {};

  // ################################
  // Map

  // Return the top-left position for the map location.
  function getMapCoords(pid) {
    return {
      top: MAP_TOP_OFFSET + MAP_ROW_HEIGHT * MAP_DATA[pid].row,
      left: MAP_LEFT_OFFSET + MAP_COL_WIDTH * MAP_DATA[pid].col,
    };
  }

  function moveMap(pid) {
    if (currentPid === pid) {
      UTILS.showArrows();
      return;
    }
    currentPid = pid;
    let coords = getMapCoords(pid);
    $('#map').css({
      top: -(coords.top) + 'px',
      left: -(coords.left) + 'px',
    });
    $('.arrow').hide();
    if (flags.visited === undefined) flags.visited = {};
    flags.visited[pid] = 1;
    visitMinimap(pid);
  }

  UTILS.showArrows = function () {
    Object.keys(MAP_DATA[currentPid].arrows).forEach(
      d => $('#arrow-' + d).show());
    Object.keys(MAP_DATA[currentPid].hideArrows || {}).forEach(k => {
      if (!flags[k]) {
        $('#arrow-' + MAP_DATA[currentPid].hideArrows[k]).hide();
      }
    });
    showExclaim();
  }

  $('#map').on('transitionend', UTILS.showArrows);

  $('.arrow').click(e => {
    if (!$('#encounter').hasClass('hidden')) return;
    moveMap(MAP_DATA[currentPid].arrows[e.target.dataset.dir]);
  });

  UTILS.enableTimeMachine = function () {
    $('#timemachine').removeClass('time-blank');
    if (currentPid.charAt(0) === 'f') {
      $('#timemachine').addClass('time-future');
    } else {
      $('#timemachine').addClass('time-past');
    }
  }

  // TODO: Transition for time travel
  $('#timemachine').click(e => {
    if ($('#timemachine').hasClass('time-dimmed')) return;
    if ($('#timemachine').hasClass('time-past')) {
      $('#timemachine').addClass('time-future').removeClass('time-past');
      moveMap('f' + currentPid.slice(1));
    } else {
      $('#timemachine').addClass('time-past').removeClass('time-future');
      moveMap('p' + currentPid.slice(1));
    }
  });

  // ################################
  // Minimap

  function setupMinimap() {
  }

  function visitMinimap(pid) {
  }

  // ################################
  // NPC Encounter

  let exclaimDiv = null;

  function setupNPCs() {
    Object.values(NPC_DATA).forEach(npc => {
      let corrds = getMapCoords(npc.loc);
      let npcDiv = $('<div class=map-npc>').attr({
        'data-nid': npc.nid,
      }).addClass('map-' + npc.nid).appendTo('#map');
      npcDiv.append($('<div class=msp>'));
      if (npc.nidAlias) npcDiv.addClass('map-' + npc.nidAlias);
      if (npc.cosmetic) npcDiv.addClass('cosmetic');
      UTILS.refreshNpcOnMap(npc.nid);
    });
    exclaimDiv = $('<div id=exclaim>').append($('<div id=exclaim-fg>'));
  }

  UTILS.refreshNpcOnMap = function (nid) {
    let npcOnMap = $('.map-npc[data-nid=' + nid + ']');
    Object.keys(NPC_DATA[nid].mapStates || {}).forEach(k => {
      npcOnMap.toggleClass(NPC_DATA[nid].mapStates[k], !!flags[k]);
    });
  };

  function showExclaim() {
    let nid = MAP_DATA[currentPid].mainNpc;
    if (nid) {
      let npcOnMap = $('.map-npc[data-nid=' + nid + ']');
      npcOnMap.append(exclaimDiv.removeClass('hidden'));
    } else {
      exclaimDiv.addClass('hidden');
    }
  }

  $('#map').on('click', '.map-npc', function (e) {
    if ($(this).hasClass('cosmetic')) return;
    showEncounter(this.dataset.nid);
  });

  function displayEncounterContent(content) {
    if (!content) {
      $('#npc-dialog').text('ERROR!');
      console.log(currentPid, currentNid, flags);
      return;
    }
    $('#npc-pic').removeClass().addClass('npc-' + currentNid + '-' + content.mood);
    if (NPC_DATA[currentNid].nidAlias)
      $('#npc-pic').addClass('npc-' + NPC_DATA[currentNid].nidAlias + '-' + content.mood);
    $('#btn-action-wrapper').toggleClass('enabled', content.enableAction);
    $('#btn-item-wrapper').toggleClass('enabled', content.enableItem);
    $('#inventory').toggleClass('selectable', content.enableItem);
    $('#npc-dialog').empty();
    content.dialog.forEach(x => $('<p>').html(x).appendTo('#npc-dialog'));
  }

  function setBtnItemText(iid) {
    if (currentNid === null) return;
    $('#btn-item').html(NPC_DATA[currentNid].itemText(iid));
  }

  function showEncounter(nid) {
    if (NPC_DATA[nid].loc !== currentPid) return;
    currentNid = nid;
    $('#npc-name').html(NPC_DATA[nid].name);
    $('#btn-action').html(NPC_DATA[nid].actionText);
    setBtnItemText();
    displayEncounterContent(NPC_DATA[nid].content('enter', flags, UTILS));
    $('#encounter').removeClass('hidden');
    $('#timemachine').addClass('time-dimmed');
  }

  $('#btn-action-wrapper').click(function () {
    if (! $('#btn-action-wrapper').hasClass('enabled')) return;
    displayEncounterContent(NPC_DATA[currentNid].content('action', flags, UTILS));
  });

  $('#btn-item-wrapper').click(function () {
    if (! $('#btn-item-wrapper').hasClass('enabled')) return;
    let iid = getSelectedItem();
    if (!iid) return;
    displayEncounterContent(NPC_DATA[currentNid].content(iid, flags, UTILS));
  });

  function hideEncounter() {
    currentNid = null;
    UTILS.deselectItems();
    $('#encounter').addClass('hidden');
    $('#timemachine').removeClass('time-dimmed');
    $('#Inventory').removeClass('selectable');
    saveGame();
    if (flags.gameWon) showWinScene();
  }
  $('#btn-leave-wrapper').click(hideEncounter);

  UTILS.changeActionText = function (text) {
    $('#btn-action').html(text);
  };

  // ################################
  // Inventory

  UTILS.addItem = function (iid, index) {
    if (index === undefined) {
      $('.item').each((i, e) => {
        if (!e.dataset.iid) {
          index = i;
          return false;
        }
      });
    }
    let target = $('.item').eq(index);
    target[0].dataset.iid = iid;
    UTILS.deselectItems();
    if (iid !== "") {
      target.find('.isp').attr('class', 'isp item-' + iid);
      target.addClass('flashing');
    }
  };

  $('.item').on('click animationend', function () {
    $(this).removeClass('flashing');
  });

  UTILS.removeItem = function (iid) {
    let target = $('.item[data-iid="' + iid + '"]');
    if (target.length) {
      target.find('.isp').attr('class', 'isp');
      target[0].dataset.iid = '';
    }
    UTILS.deselectItems();
  };

  UTILS.deselectItems = function () {
    $('.item').removeClass('selected');
    $('#btn-item-wrapper').removeClass('itemSelected');
    setBtnItemText('');
  }

  $('.item').click(function () {
    // Only allow item select in NPC page
    if (currentNid === null || ! $('#btn-item-wrapper').hasClass('enabled')) return;
    let iid = this.dataset.iid;
    if (!iid || (NPC_DATA[currentNid].forbiddenIids || []).indexOf(iid) !== -1) {
      UTILS.deselectItems();
    } else {
      $('.item').removeClass('selected');
      $(this).addClass('selected');
      $('#btn-item-wrapper').addClass('itemSelected');
      setBtnItemText(iid);
    }
  });

  function getSelectedItem() {
    let selected = $('.item.selected');
    return selected.length ? selected[0].dataset.iid : null;
  }

  function getAllItems() {
    return $('.item').get().map(x => x.dataset.iid);
  }

  // ################################
  // Win scene

  function showWinScene() {
    let showWinSceneInner = function () {
      $('#scene-cover').off('transitionend', showWinSceneInner);
      $('#btn-leave-wrapper').hide();
      UTILS.removeItem('rod');
      UTILS.removeItem('money');
      showEncounter('cake');
      $('#scene-cover').addClass('hidden');
    };
    $('#scene-cover').on('transitionend', showWinSceneInner).removeClass('hidden');
  }

  // ################################
  // Main UI

  function setupMain(savedData) {
    setupNPCs();
    setupMinimap();
    $('.scene').hide();
    $('#scene-cover').show().removeClass('hidden');
    $('#scene-main').show();
    if (savedData !== undefined) {
      loadGame(savedData);
    } else {
      moveMap('f0');
    }
    UTILS.showArrows();
    $('#scene-cover').addClass('hidden');
    saveGame();
  }

  const APP_NAME = '31-dungeon';

  function saveGame() {
    let data = {flags: flags, items: getAllItems(), pid: currentPid};
    console.log('save', data);
    try {
      localStorage.setItem(APP_NAME, JSON.stringify(data));
    } catch (e) {
      alert('ERROR: ' + e.message);
    }
  }

  window.addEventListener("beforeunload", e => {
    if (currentPid !== null) saveGame();
  });

  function getSavedGame() {
    let data = localStorage.getItem(APP_NAME);
    if (data !== null) {
      data = JSON.parse(data);
      if (Object.keys(data.flags).length === 0) data = null;
    }
    return data;
  }

  function loadGame(data) {
    console.log('load', data);
    flags = data.flags;
    Object.keys(NPC_DATA).forEach(UTILS.refreshNpcOnMap);
    Object.keys(flags.visited || {}).forEach(visitMinimap);
    data.items.forEach(UTILS.addItem);
    moveMap(data.pid);
    if (flags.timeMachineTaken) UTILS.enableTimeMachine();
    if (flags.gameWon) showWinScene();
  }

  $('#skipA').click(() => loadGame({
    flags: {
      "gotMoneyFromFairy": 1,
      "tutorialDone2": 1,
      "tutorialDone1": 1,
      "pondFished": 1,
      "catFed": 1,
      "visited": {
        "a1": 1, "a2": 1, "a3": 1, "a4": 1, "a5": 1, "a6": 1, "a7": 1, "s": 1,
      },
    },
    items: ['rod', 'key', '', '', 'oil', ''],
    pid: 'a4',
  }));

  // ################################
  // Preloading and screen resizing

  function gup(name) {
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    let results = regex.exec(window.location.href);
    return results === null ? "" : decodeURIComponent(results[1]);
  }
  if (gup('cheat')) $('#cheats').show();

  const H_SCREEN_WIDTH = 700, H_SCREEN_HEIGHT = 400,
    V_SCREEN_WIDTH = 500, V_SCREEN_HEIGHT = 580;

  function resizeScreen() {
    if (window.innerWidth > window.innerHeight) {
      let ratio = Math.min(
        1.0,
        window.innerWidth / H_SCREEN_WIDTH,
        (window.innerHeight - 25) / H_SCREEN_HEIGHT,
      );
      $('#game-wrapper').css({
        'width': (H_SCREEN_WIDTH * ratio) + 'px',
        'height': (H_SCREEN_HEIGHT * ratio) + 'px',
      }).removeClass('vertical-screen');
      $('#game').css('transform', 'scale(' + ratio + ')');
    } else {
      let ratio = Math.min(
        1.0,
        window.innerWidth / V_SCREEN_WIDTH,
        (window.innerHeight - 25) / V_SCREEN_HEIGHT,
      );
      $('#game-wrapper').css({
        'width': (V_SCREEN_WIDTH * ratio) + 'px',
        'height': (V_SCREEN_HEIGHT * ratio) + 'px',
      }).addClass('vertical-screen');
      $('#game').css('transform', 'scale(' + ratio + ')');
    }
  }

  resizeScreen();
  $(window).resize(resizeScreen);

  const imageList = [
    'img/map.png',
    'img/exclaim.png',
    'img/arrow.png',
    'img/sheet.png',
    'img/items.png',
  ];
  let numResourcesLeft = imageList.length;

  function decrementPreload () {
    numResourcesLeft--;
    if (numResourcesLeft === 0) {
      $('#pane-loading').empty();
      let savedData = getSavedGame();
      if (savedData !== null) {
        $('<button type=button>').text('CONTINUE').click(() => {
          setupMain(savedData);
        }).appendTo('#pane-loading');
      }
      $('<button type=button>').text('NEW GAME').click(() => {
        if (savedData !== null && !window.confirm('Reset progress?')) return;
        setupMain();
      }).appendTo('#pane-loading');
    } else {
      $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');
    }
  }

  let images = [];
  imageList.forEach(x => {
    let ximg = new Image();
    ximg.onload = decrementPreload;
    ximg.src = x;
    images.push(ximg);
  });
  $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');
  $('.scene').hide();
  $('#scene-preload').show();

});
