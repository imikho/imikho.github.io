/**
 * Created by ivan on 28.10.16.
 */
$(document).ready(function () {
    var data;
    $.get('ECG.txt', function (res) {
        data = res.replace(/\n|(   )|(    )|(     )/g, ',').replace(/,,/g, ',').replace(/ /g, '').split(',');
        data.shift();
        for (var i = 0; i < data.length; i++) {
            data[i] = parseFloat(data[i]);
        }
        filter(data);
        console.log(data);
    }, 'text');
    $("#plot").click(function() {
        filter(data, true)
    });
    $("#mov").hide();
    $("#adapt").hide();
    $("#sel1").change(function() {
        console.log($("#sel1").val())
        switch (parseInt($("#sel1").val())) {
            case 1:
                $("#exp").show();
                $("#mov").hide();
                $("#adapt").hide();
                break;
            case 2:
                $("#exp").hide();
                $("#mov").show();
                $("#adapt").hide();
                break;
            case 3:
                $("#exp").hide();
                $("#mov").hide();
                $("#adapt").show();
                break;
        }

    });
    $("#trend").roundSlider({
        radius: 50,
        min: 0,
        max: 1,
        step: 0.005,
        startAngle: 10,
        endAngle: "+340",
        change: function (e) {
            filter(data);
        },
        drag: function (e) {
            filter(data);
        }
    });

    $("#alpha").roundSlider({
        radius: 50,
        min: 0,
        max: 1,
        startAngle: 10,
        endAngle: "+340",
        step: 0.005,
        change: function (e) {
            filter(data);
        },
        drag: function (e) {
            filter(data);
        }
    });

    $("#win").roundSlider({
        radius: 50,
        min: 0,
        max: 100,
        startAngle: 10,
        endAngle: "+340",
        step: 1,
        change: function (e) {
            filter(data);
        },
        drag: function (e) {
            filter(data);
        }
    });
    $("#winA").roundSlider({
        radius: 50,
        min: 0,
        max: 100,
        startAngle: 10,
        endAngle: "+340",
        value: 0,
        change: function (e) {
            filter(data);
        },
        drag: function (e) {
            filter(data);
        }
    });
    $("#err").roundSlider({
        radius: 50,
        min: 0.5,
        max: 0.8,
        startAngle: 10,
        endAngle: "+340",
        step: 0.005,
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
        var signalWT = [];
        var signalSM = [];
        var trendParam = $('#trend').roundSlider('option', 'value');
        var trend = expSmoothing(data, trendParam);
        var filterTrend = [];
        for (var i = 0; i < data.length; i++) {
            signal.push([i, data[i]]);
            filterTrend[i] = data[i] - trend.val[i];
            signalWT.push([i, filterTrend[i]]);
        }
        //debugger;

        switch (parseInt($("#sel1").val())) {
            case 1:
                var smoothed = expSmoothing(filterTrend, $('#alpha').roundSlider('option', 'value'));
                break;
            case 2:
                var smoothed = movingSmoothing(filterTrend, $('#win').roundSlider('option', 'value'));
                break;
            case 3:
                if(flag){
                    var smoothed = adaptiveSmoothing(filterTrend, $('#winA').roundSlider('option', 'value'), $('#err').roundSlider('option', 'value'));
                }
                break;
        }
        console.log(smoothed);
        $.plot("#placeholder1", [{
            data: signal,
            lines: {show: true}
        }]);
        $.plot("#placeholder2", [{
            data: signalWT,
            lines: {show: true}
        }]);
        $.plot("#placeholder3", [{
            data: smoothed.plot,
            lines: {show: true}
        }]);
    }

    function expSmoothing(signal, alpha) {
        var expSmoothing = [];
        var expSmoothingPlot = [];
        expSmoothing[0] = alpha * data[0] + (1 - alpha) * -0.25;
        expSmoothingPlot.push([0, expSmoothing[0]]);
        for (var i = 0; i < signal.length; i++) {
            if (i > 0) {
                expSmoothing[i] = expSmoothing[i-1] + alpha * (signal[i] - expSmoothing[i-1]);
                expSmoothingPlot.push([i, expSmoothing[i]]);
            }
        }
        return {val: expSmoothing, plot:expSmoothingPlot};
    }

    function movingSmoothing(signal, window) {
        var windowl, windowr;
        var movSmoothing = [];
        var movSmoothingPlot = [];
        var m = 1 / (1 + 2 * window);
        movSmoothing[0] = data[1] + m * (signal[0 + window] - signal[0]);
        movSmoothingPlot.push([0, movSmoothing[0]]);
        for (var i = 0; i < signal.length; i++) {
            windowl = i < window ? i : window;
            windowr = (signal.length - i - 1) < window ? signal.length - i - 1 : window;
            if (i > 0) {
                if (i == 1707) {debugger;}
                movSmoothing[i] = movSmoothing[i-1] + m * (signal[i + windowr] - signal[i - windowl]);
                movSmoothingPlot.push([i, movSmoothing[i]]);
            }
        }
        return {val: movSmoothing, plot:movSmoothingPlot};
    }

    function adaptiveSmoothing(signal, window, h) {
        var windows = [];
        var windowl, windowr;
        var adaptSmoothing = [];
        var adaptSmoothingPlot = [];
        var m = 1 / (1 + 2 * window);
        adaptSmoothing[0] = data[1] + m * (signal[0 + window] - signal[0]);
        adaptSmoothingPlot.push([0, adaptSmoothing[0]]);
        for (var i = 0; i < signal.length; i++) {
            windows[i] = window;
            for (var p = 0; p < window; p++) {
                var sum = 0;
                //debugger;
                for (var l = 0; l < windows[i]; l++) {
                    if ((signal.length - i - 1) < windows[i]) {
                        sum += signal[signal.length - windows[i] - 1 + l];
                    } else {
                        sum += signal[i + l];
                    }
                }
                adaptSmoothing[i] = 1/(2 * windows[i] + 1) * sum;
                if (Math.abs(signal[i] - adaptSmoothing[i]) > h) {
                    windows[i]--;
                } else {
                    break;
                }
                //console.log(Math.abs(signal[i] - adaptSmoothing[i]));
            }
        }
        //debugger;
        for (var e = 1; e < windows.length; e++){
            if (windows[e] > windows[e-1]) {
                windows[e] = windows[e-1] + 1;
            }
        }
        for (var e = windows.length - 1; e > 0; e--) {
            if (windows[e - 1] > windows [e]) {
                windows[e - 1] = windows[e] + 1;
            }
        }
        console.log(windows);
        for (var i = 0; i < signal.length; i++) {
            var sum = 0;
            //debugger;
            for (var l = 0; l < windows[i]; l++) {
                //debugger;
                if ((signal.length - i - 1) < windows[i]) {
                    sum += signal[signal.length - windows[i] - 1 + l];
                } else {
                    sum += signal[i + l];
                }
            }
            adaptSmoothing[i] = 1/(2 * windows[i] + 1) * sum;
            adaptSmoothingPlot.push([i, adaptSmoothing[i]]);
        }
        return {val: adaptSmoothing, plot:adaptSmoothingPlot};

    }
});
