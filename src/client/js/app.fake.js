/*jslint        browser : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global $, app */

app.fake = (function () {
  'use strict';

  var peopleList, fakeIdSerial, makeFakeId, mockSocketIo;

  fakeIdSerial = 5;

  makeFakeId = function () {
    return 'id_' + String(fakeIdSerial++);
  };

  peopleList = [
      {
        name : 'Chloe',
        _id  : 'id_1',
        css_map : {
          top : 20,
          left : 20,
          'background-color' : 'rgb(128, 128, 128)'
        }
      },
      {
        name : 'Lex',
        _id : 'id_2',
        css_map : {
          top : 60,
          left : 20,
          'background-color' : 'rgb(128, 255, 128)'
        }
      },
      {
        name : 'Lois',
        _id : 'id_3',
        css_map : {
          top : 100,
          left : 20,
          'background-color' : 'rgb(128, 192, 192)'
        }
      },
      {
        name : 'Lana',
        _id : 'id_4',
        css_map : {
          top : 140,
          left : 20,
          'background-color' : 'rgb(192, 128, 128)'
        }
      }
  ];

  mockSocketIo = (function () {
    var on_sio, emit_sio, emit_mock_msg, send_listchange, listchange_idto,
        callback_map = {};

    on_sio = function (msg_type, callback) {
      callback_map[msg_type] = callback;
    };

    emit_sio = function (msg_type, data) {
      var person_map, i;

      if (msg_type === 'adduser' && callback_map.userupdate) {
        setTimeout(function () {
          person_map = {
            _id     : makeFakeId(),
            name    : data.name,
            css_map : data.css_map
          };
          peopleList.push(person_map);
          callback_map.userupdate([person_map]);
        }, 3000);
      }

      if (msg_type === 'updatechat' && callback_map.updatechat) {
        setTimeout(function () {
          var user = app.model.people.get_user();
          callback_map.updatechat([{
            dest_id   : user.id,
            dest_name : user.name,
            sender_id : data.dest_id,
            msg_text : 'How\'s it going, ' + user.name + '?'
          }]);
        }, 2000);
      }

      if (msg_type === 'leavechat') {
        delete callback_map.listchange;
        delete callback_map.updatechat;

        if (listchange_idto) {
          clearTimeout(listchange_idto);
          listchange_idto = undefined;
        }

        if (!data) {
          send_listchange();
        }
      }

      if (msg_type === 'updateavatar' && callback_map.listchange) {
        for (i = 0; i < peopleList.length; i++) {
          if (peopleList[i]._id === data.person_id) {
            peopleList[i].css_map = data.css_map;
            break;
          }
        }

        callback_map.listchange([peopleList]);
      }
    };

    emit_mock_msg = function () {
      setTimeout(function () {
        var user = app.model.people.get_user();
        if (callback_map.updatechat) {
          callback_map.updatechat([{
            dest_id   : user.id,
            dest_name : user.name,
            sender_id : 'id_4',
            msg_text  : 'Hi there ' + user.name + '! Lana here.'
          }]);
        } else {
          emit_mock_msg();
        }
      }, 8000);
    };

    send_listchange = function () {
      listchange_idto = setTimeout(function () {
        if (callback_map.listchange) {
          callback_map.listchange([peopleList]);
          emit_mock_msg();
          listchange_idto = undefined;
        } else {
          send_listchange();
        }
      }, 1000);
    };

    send_listchange();

    return {
      emit : emit_sio,
      on   : on_sio
    };
  }());

  return {
    mockSocketIo  : mockSocketIo
  };
}());