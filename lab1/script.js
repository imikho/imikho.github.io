$(document).ready(function() {
    $('input').keypress(function (e) {
       if (e.keyCode === 13) {
           $('#reply').trigger('click');
       } 
    });
    $('#reply').on('click', function (e) {
        e.preventDefault();
        var msg = $('#message').val();
        $('#message').val('');
        newMessage(msg, false);
        var parsed = msg.replace(/[^а-яА-Яa-zA-Z0-9 ]/g, '');
        // console.log(parsed);
        parsed = parsed.toLowerCase();
        // console.log(parsed);
        parsed = parsed.split(' ');
        // console.log(parsed);
        var code = parseInt($('#code').val());
        console.log(code);
        if (parseAnswer(parsed, 'bye')) {
            newMessage(getRandomAnswer('bye') + ', я напишу тебе в понедельник.', true );
            $('#code').val(0);
            return;
        }
        switch (code) {
            case 0: return;
            case -1:
                if (parseAnswer(parsed, 'greetings')) {
                    newMessage(getRandomAnswer('greetings') + ', как твои дела?', true );
                    $('#code').val(1);
                    return;
                }
                break;
            case 1:
                if (parseAnswer(parsed, 'badMood')) {
                    newMessage('А что случилось? у меня, кстати тоже ' + getRandomAnswer('badMood'), true);
                    $('#code').val(3);
                    return;
                }
                if (parseAnswer(parsed, 'goodMood')) {
                    newMessage('Классно, у меня тоже ' + getRandomAnswer('goodMood') + '! Может сходим поиграть во что-нибудь, как насчет волейбола?', true );
                    $('#code').val(2);
                    return;
                }
                newMessage('Ух уж эта неопределенность, в таких случаях надо развеяться, погнали в волейбол?', true);
                $('#code').val(2);
                return;
                break;
            case 2:
                if (parseAnswer(parsed, 'answerYes')) {
                    newMessage('Окей, тогда встретимся на площадке через полчаса?', true);
                    $('#code').val(4);
                    return;
                }
                if (parseAnswer(parsed, 'answerNo')) {
                    newMessage('Зря отказываешься, если передумаешь, то подходи!', true);
                    $('#code').val(5);
                    return;
                }
                newMessage('Тут брат за ноут садиться, так что лучше позвони мне.', true);
                $('#code').val(0);
                return;
                break;
            case 3:
                newMessage('Знаешь что, давай встретимся на площадке, поболтаем, поиграем, если не хочеться говорить просто поиграем:)', true);
                $('#code').val(2);
                return;
                break;
            case 4:
                if (parseAnswer(parsed, 'answerYes')) {
                    newMessage('Ок, я тогда погнал переодеваться, если что звони!', true);
                    $('#code').val(0);
                    return;
                }
                newMessage('А чего так, ладно тут брат садиться, так что позвони мне обсудим детали!', true);
                $('#code').val(0);
                return;

        }
        newMessage('Сори, надо бежать, давай договорим позже.', true);
        $('#code').val(0);
    });
    function newMessage(message, position) {
        var cssClass = position ? 'left' : 'right';
        var time = position ? 1000 : 0;
        var html = '<div class="message ' + cssClass + 'Msg">' + message + '</div><br><br><br>';
        // console.log(time);
        $('#messages').delay(time).queue(function (next) {
            $(this).append(html);
            next();
        });
        return;
    }

});
var vocabulary = {
    badMood: ['плохо', 'не очень', 'все плохо', 'отвратительно', 'неочень'],
    goodMood: ['не жалуюсь', 'норм', 'нормально','отлично', 'хорошо', 'замечатильно', 'превосходно', 'лучше всех', 'все ок', 'ок', 'супер'],
    normalMood: ['не жалуюсь', 'норм', 'нормально'],
    answerYes: ['да', 'ага', 'ок', 'угу', 'давай', 'отлично', 'отличная', 'за', 'конечно', 'погнали', 'хорошо', 'заметано'],
    answerNo: ['нет', 'не'],
    greetings: ['привет', 'добрый день', 'здравствуй', 'приветствую'],
    bye: ['пока', 'до свидания', 'прощай', 'до связи', 'увидимся'],
    questionName: [''],
    questionAge: [],
    questionMood: [],
    questionDo: [],

};
function getRandomAnswer(key) {
    return vocabulary[key][Math.floor(Math.random() * (vocabulary[key].length - 1))];
}
function parseAnswer(arr, key) {
    console.log('parse');
    console.log(arr);
    console.log(vocabulary[key]);
    for (var i = 0; i < vocabulary[key].length; i++) {
        console.log(arr.indexOf(vocabulary[key][i]));
        if (arr.indexOf(vocabulary[key][i]) !== -1) {
            console.log('true');
            return true;
        }
    }
    console.log('false');
    return false;
}


function show() {
    $('#messages').append(html);
}

