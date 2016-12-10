/**
 * Created by ivan on 28.10.16.
 */
$(document).ready(function () {
    var data;
    $("#file-select").change(function() {
        console.log($("#file-select").val());
        $.get($("#file-select").val(), function (res) {
            data = res.replace(/\n|(   )|(    )|(     )/g, ',').replace(/,,/g, ',').replace(/ /g, '').split(',');
            data.shift();
            for (var i = 0; i < data.length; i++) {
                data[i] = parseFloat(data[i]);
            }
            filter(data);
            console.log(data);
        }, 'text');

    });
    $("#tau").roundSlider({
        radius: 50,
        min: 0,
        max: 50,
        step: 1,
        startAngle: 10,
        endAngle: "+340",
        change: function (e) {
            filter(data);
        },
        drag: function (e) {
            filter(data);
        }
    });

    function filter(data, flag) {
        console.log(data);
        var signal = [];
        var derivative = [];
        var derivativeSignal = [];
        var delay = $('#tau').roundSlider('option', 'value');
        var tau = [];
        var tauSignal = [];

        for (var i = 0; i < data.length; i++) {
            signal.push([i, data[i]]);
            if ( i < delay ) {
                tau.push(data[0])
            } else {
                tau.push(data[i-delay]);
            }
            if (i > 3 && i < data.length - 4) {
                derivative[i] = (1 / 60) * (data[i+3] - 9 * data[i+2] + 45 * data[i+1] - 45 * data[i-1] + 9 * data[i+2] - data[i+3]);
            } else if (i < 3) {
                derivative[i] = 0;//(1 / 60) * (data[i+3] - 9 * data[i+2] + 45 * data[i+1]);
            } else {
                derivative[i] = 0;//(1 / 60) * (- 45 * data[i-1] + 9 * data[i+2] - data[i+3]);
            }
            tauSignal.push([data[i], tau[i]]);
            derivativeSignal.push([data[i],derivative[i]]);
        }

        $.plot("#placeholder1", [{
            data: signal,
            lines: {
                show: true,
                lineWidth: 3
            }
        }]);

        $.plot("#placeholder2", [{
            data: tauSignal,
            lines: {show: true}
        }]);

        $.plot("#placeholder3", [{
            data: derivativeSignal,
            lines: {
                show: true,
                lineWidth: 50
            }
        }]);
    }
});
