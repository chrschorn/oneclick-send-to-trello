var $listSelect, $boardSelect;


var login = function() {
    if (!trelloApi.tryAuthorize()) {
        // couldn't authorize without prompt
        trelloApi.authorizePrompt(update_buttons);
    }
};

var logout = function () {
    Trello.deauthorize();
    update_buttons();
    $('main').toggle(false);
};

var update_buttons = function() {
    var authorized = Trello.authorized();
    $('#login').toggle(!authorized);
    $('#logout').toggle(authorized);
};

var loadBoards = function (savedId) {
    Trello.members.get("me/boards", function(boards) {
        // success
        var $boardSelect = $('#boardSelect');
        $boardSelect.empty();
        $.each(boards, function(i, board) {
            if (board.id === savedId) {
                $boardSelect.append(
                    $('<option>' + board.name + '</option>').prop('selected', true).data({id: board.id})
                );
            } else if (!board.closed) {
                $boardSelect.append(
                    $('<option>' + board.name + '</option>').data({id: board.id})
                );
            }
        });
        $boardSelect.prop('disabled', false);
        loadLists($("#boardSelect option:selected").first(), (savedId == null ? null : savedOptions.listId) )
    });
};

var loadLists = function(boardOption, savedId) {
    $listSelect.prop('disabled', true);
    $listSelect.children('option').first().text('Loading...');

    boardId = boardOption.data().id;

    Trello.boards.get(boardId + '/lists', function(lists) {
        // success
        var $listSelect = $('#listSelect');
        $listSelect.empty();
        $.each(lists, function(i, list) {
            if (list.id === savedId) {
                $listSelect.append(
                    $('<option>' + list.name + '</option>').prop('selected', true).data({id: list.id})
                );
            } else if (!list.closed) {
                $listSelect.append(
                    $('<option>' + list.name + '</option>').data({id: list.id})
                )
            }
        });
        $listSelect.prop('disabled', false);

        saveChoice();
    });

};

var saveChoice = function() {
    savedOptions.boardId = $boardSelect.children('option:selected').first().data().id;
    savedOptions.listId = $listSelect.children('option:selected').first().data().id;

    chrome.storage.local.set(savedOptions);

    console.log(savedOptions.boardId);
    console.log(savedOptions.listId);
};


var init = function() {
    $('#login').click(login);
    $('#logout').click(logout);

    $boardSelect = $('#boardSelect');
    $listSelect = $('#listSelect');
    var $autoClose = $('#autoClose');

    if (trelloApi.tryAuthorize()) {
        $boardSelect.change(function() {
            loadLists($("#boardSelect option:selected").first())
        });
        $listSelect.change(function() {
            saveChoice();
        });
        $autoClose.change(function() {
            storage.set({autoClose: $autoClose.is(":checked")});
        });

        $autoClose.prop('checked', savedOptions.autoClose);

        $('main').toggle(true);

        loadBoards(savedOptions.boardId);
    }
    update_buttons();
};

$(document).ready(function() {
    // try to recover saved items
    storage.get(optionNames, function(ret) {
        savedOptions = ret;
        init();
    });
});