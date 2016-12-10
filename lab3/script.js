/**
 * Created by ivan on 30.09.16.
 */

$(function() {
    $("#heart-rate").roundSlider({
        radius: 50,
        min: 30,
        max: 250,
        startAngle: 10,
        endAngle: "+340",
        change: function (e) {
            plot(e);
        },
        drag: function (e) {
            plot(e);
        }
    });

    $("#amplitude").roundSlider({
        radius: 50,
        min: -1,
        max: 1,
        startAngle: 10,
        endAngle: "+340",
        step: 0.1,
        change: function (e) {
            plot(e);
        },
        drag: function (e) {
            plot(e);
        }
    });
    $("#peak").roundSlider({
        radius: 50,
        min: 646,
        max: 1500,
        startAngle: 10,
        endAngle: "+340",
        value: 0,
        change: function (e) {
            plot(e);
        },
        drag: function (e) {
            plot(e);
        }
    });
    $("#sym1").roundSlider({
        radius: 50,
        min: 5,
        max: 40,
        startAngle: 10,
        endAngle: "+340",
        step: 0.2,
        change: function (e) {
            plot(e);
        },
        drag: function (e) {
            plot(e);
        }
    });
    $("#sym2").roundSlider({
        radius: 50,
        min: 5,
        max: 40,
        startAngle: 10,
        endAngle: "+340",
        step: 0.2,
        change: function (e) {
            plot(e);
        },
        drag: function (e) {
            plot(e);
        }
    });
    //$('#plot').on('click', function() {
    function plot(e) {
        var HeartR = $('#heart-rate').roundSlider('option', 'value');
        var AmplT = $('#amplitude').roundSlider('option', 'value');
        var PeakT = $('#peak').roundSlider('option', 'value');
        var b1T = $('#sym1').roundSlider('option', 'value');
        var b2T = $('#sym2').roundSlider('option', 'value');
        var t0 = 60 * 1000 / HeartR;

        var peakP = Math.round(t0 * 0.1);
        var peakQ = Math.round(t0 * 0.25);
        var peakR = Math.round(t0 * 0.30);
        var peakS = Math.round(t0 * 0.35);
        if (e.handle.element.closest('.myRS').attr('id') == 'heart-rate') {
            $("#peak").roundSlider({
                radius: 50,
                min: 0.4*t0,
                max: t0,
                startAngle: 10,
                endAngle: "+340",
                value: 0,
                drag: function (e) {
                    plot(e);
                }
            });
        }


        if (PeakT < Math.round(t0 * 0.4) && PeakT > Math.round(t0 * 0.9)) {
            var PeakT = Math.round(t0 * 0.65);
        }
        var scale = t0 / 1000;
        var ampl = 0.5;
        var P = {
            ampl: 0.375 * ampl,
            peak: peakP,
            sym1: 15 * scale,
            sym2: 15 * scale,
            symm: function (t) {
                return (t > this.peak) ? this.sym1 : this.sym2;
            }
        };
        var Q = {
            ampl: -0.3 * ampl,
            peak: peakQ,
            sym1: 2 * scale,
            sym2: 2 * scale,
            symm: function (t) {
                return (t > this.peak) ? this.sym1 : this.sym2;
            }
        };
        var R = {
            ampl: 3 * ampl,
            peak: peakR,
            sym1: 4 * scale,
            sym2: 4 * scale,
            symm: function (t) {
                return (t > this.peak) ? this.sym1 : this.sym2;
            }
        };
        var S = {
            ampl: -0.375* ampl,
            peak: peakS,
            sym1: 3 * scale,
            sym2: 3 * scale,
            symm: function (t) {
                return (t > this.peak) ? this.sym1 : this.sym2;
            }
        };
        var T = {
            ampl: AmplT,
            peak: PeakT,
            sym1: b1T*scale,
            sym2: b2T*scale,
            symm: function (t) {
                return (t > this.peak) ? this.sym2 : this.sym1;
            }
        };

        var peaks = [P, Q, R, S, T];
        var signal = [];
        for (var j = 0; j < peaks.length; j++) {
            var peak = peaks[j];
            if(j==4){console.log(peak.sym1, peak.sym2);};
            peak.start = peak.peak - 3 * peak.sym1;
            peak.end = peak.peak + 3 * peak.sym2;
            if (j == 2 || j == 3 || (j == 4 && peak.start < peaks[j-1].end)) {
                peak.start = peaks[j - 1].end;
                peak.peak = peak.start + 3 * peak.sym1;
                peak.end = peak.peak + 3 * peak.sym2;
            }
            if (j > 0) {
                for (var k = peaks[j - 1].end; k < peak.start; k++) {
                    signal.push([k, 0]);
                }
            }
            if(j==4){console.log(peak.start, peak.end);};
            for (var i = peak.start; i < peak.end; i++) {
                signal.push([i, peak.ampl * Math.exp(-( Math.pow(i - peak.peak, 2)) / ( 2 * (Math.pow(peak.symm(i), 2)) ))]);
            }
        }
        for (var i = peaks[4].end; i < t0; i++) {
            signal.push([i, 0]);
        }
        $.plot("#placeholder", [{
            data: signal,
            lines: {show: true}
        }]);
    }
//    });
    


    // Add the Flot version string to the footer
});