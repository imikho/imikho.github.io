/**
 * Created by ivan on 28.10.16.
 */
$(document).ready(function () {    
    var keys = ['peace', 'load', 'rest'];
    var label = ['ЧСС', 'Средняя симметрия T', 'СКО симетрии T', 'SDNN, мс.', 'Индекс напряжения', 'Сдвиг ST, мв.', 'Интервал P-Q(R), мс.', 'Площади T/R']
    var patients = [];
    $.get('data-utf.csv', function (res) {
        res = res.replace(/,/g, '.');
        var rows = res.split('\n');
        var rawData = [];
        for (var i = 0; i < rows.length; i++) {
            rawData[i] = [];
            rawData[i] = rows[i].split(';');
        }
        var k = 0;
        for (var i = 1; i < rawData.length; i++) {
            patients[k] = {};
            patients[k].id = parseInt(rawData[i][1]);
            patients[k].name = rawData[i][3];
            while (parseInt(rawData[i][1]) == patients[k].id) {                
                switch (parseInt(rawData[i][6])) {
                    case 0: {
                        patients[k].peace = [];
                        patients[k].peace = rawData[i].slice(7);
                        break;
                    }
                    case 1: {
                        patients[k].load = [];
                        patients[k].load = rawData[i].slice(7);
                        break;
                    }
                    case 3: {
                        patients[k].rest = [];
                        patients[k].rest = rawData[i].slice(7);
                        break;
                    }
                }
                if (i !== rawData.length - 1) {
                    i++;
                }
            }
            if (i !== rawData.length - 1) {
                i--;
            }
            k++;
        }
        for (var i = 0; i < patients.length; i++) {
            for (var k = 0; k < keys.length; k++) {
                patients[i][keys[k]].forEach(function(value, index) {
                    patients[i][keys[k]][index] = parseFloat(value);
                });
            }
        }
        fillSelect();
    }, 'text');
    function fillSelect() {
        for (var i = 0; i < patients.length; i++) {
            var selected = patients[i].id == 397 ? 'selected' : '';
            $('#patient-select').append('<option ' + selected + ' value="' + patients[i].id +'">' + patients[i].name + '</option>');
        }
    }
    $("#patient-select").change(function() {
        console.log($("#file-select").val());
        calculate();
    }).change();
    $("#percent").roundSlider({
        radius: 50,
        min: 0,
        max: 50,
        step: 1,
        startAngle: 10,
        endAngle: "+340",
        change: function (e) {
            calculate();
        },
        drag: function (e) {
            calculate();
        }
    });
    $('.radio-point').click(function() {
        calculate();
    });

    function getPatient(id) {
        for (var i = 0; i < patients.length; i++) {
            if (patients[i].id == id) {
                return patients[i];
            }
        }
    }
    function getH(array) {
        var percent = $('#percent').roundSlider('option', 'value') / 100;
        console.log('va');
        console.log($('input[name=point]:checked').val());
        switch (parseInt($('input[name=point]:checked').val())) {
            case 1 : {
                return Math.abs(percent * array[0]);
            }
            case 2 : {
                return Math.abs(percent * array[1]);
            }
            case 3 : {
                return Math.abs(percent * array[2]);
            }
            case 4 : {
                return Math.abs(percent * ((array[0] + array[1] + array[2]) / 3));
            }
        }
    }
    function calculate() {
        $('.plots').html('');
        $('#result').html('');
        var percent = $('#percent').roundSlider('option', 'value');
        percent = percent / 100;
        var point = $('input[name=point]:checked').val();
        var patient = getPatient($('#patient-select').val());
        var patientSignals = [];
        var patientsSignals = [];
        var patientsSignalsCount = [];

        var invalid = [];
        for (var i = 0; i < keys.length; i++) {
            for (var j = 0; j < patient[keys[i]].length; j++) {
                if (i == 0) {
                    patientSignals[j] = [];
                    patientsSignals[j] = [];
                    patientsSignalsCount[j] = [];
                }
                patientsSignals[j][i] = [i, 0];
                patientsSignalsCount[j][i] = 0;
                if (invalid.indexOf(j) !== -1) {
                    continue;
                }
                if (!isNaN(patient[keys[i]][j])) {
                    patientSignals[j].push([i,patient[keys[i]][j]]);
                } else {
                    invalid.push(j);
                }
            }
        }
        var types = [];
        var allData = [];
        for (var e = 0; e < patients.length; e++) {
            allData[e] = [];
            for (var i = 0; i < keys.length; i++) {
                for (var j = 0; j < patients[e][keys[i]].length; j++) {
                    if (i == 0) {
                        allData[e][j] = [];
                        types[j] = [0,0,0,0,0,0];
                    }
                    if (!isNaN(patients[e][keys[i]][j])) {

                        patientsSignals[j][i][1] += patients[e][keys[i]][j];
                        patientsSignalsCount[j][i]++;
                    }
                    allData[e][j][i] = patients[e][keys[i]][j];
                }
            }
        }
        for (var i = 0; i < keys.length; i++) {
            for (var j = 0; j < patient[keys[i]].length; j++) {
                patientsSignals[j][i][1] = patientsSignals[j][i][1] / patientsSignalsCount[j][i];
            }
        }
        for (var i = 0; i < patientSignals.length; i++) {
            var id = 'placeholder' + i;
            $('.plots').append('<div class="plot-wrap"><p class="plot-title">' + label[i] + '</p><div class="plot" id="' + id + '"></div></div>');
            var data = [{label: "Среднее", data: patientsSignals[i]}];
            if (invalid.indexOf(i) == -1) {
                data.push({label: "Индивидуальное", data: patientSignals[i]});
            }
            $.plot('#' + id, data,
            {
                lines: {
                    show: true,
                    lineWidth: 3
                },
                legend: {
                    position: 'se',
                    margin: [0,-50]
                }
            });

        }
        var h;
        for (var i = 0; i < allData.length; i++) {
            console.log(allData[i]);
            for (var j = 0; j < allData[i].length; j++) {
                if (isNaN(allData[i][j][0]) || isNaN(allData[i][j][1]) || isNaN(allData[i][j][2])) {
                    console.log(allData[i][j]);
                    continue;
                }
                h = getH(allData[i][j]);
                var h1 = percent * allData[i][j][0];
                console.log(h + '   ---   ' + h1);
                console.log('h', h);
                if ((allData[i][j][1] - allData[i][j][0] > h) && (allData[i][j][1] - allData[i][j][2] > h)) {
                    types[j][0]++;
                } else if ((allData[i][j][0] - allData[i][j][1] > h) && (allData[i][j][2] - allData[i][j][1] > h)) {
                    types[j][1]++;
                } else if ((allData[i][j][1] - allData[i][j][0] > h) || (allData[i][j][2] - allData[i][j][1] > h) || (allData[i][j][2] - allData[i][j][0] > h)) {
                    types[j][2]++;
                } else if ((allData[i][j][0] - allData[i][j][1] > h) || (allData[i][j][1] - allData[i][j][2] > h) || (allData[i][j][0] - allData[i][j][2] > h)) {
                    types[j][3]++;
                } else {
                    types[j][4]++;
                }
                types[j][5]++;
            }
        }
        var html = '';
        var allHtml = '';
        for (var i = 0; i < types.length + 1; i++) {
            html = '<tr>';
            for (var j = 0; j < types[0].length; j++) {
                if (i == 0) {
                    if (j == 0) {
                        html += '<td>Показатель</td>';
                        continue;
                    } else {
                        html += '<td>Тип ' + j + '</td>';
                        continue;
                    }

                }
                if (j == 0) {
                    html += '<td>' + label[i-1] + '</td>';
                    continue;
                }
                if (types[i-1][j-1] == Math.max(types[i-1][0],types[i-1][1],types[i-1][2],types[i-1][3],types[i-1][4])) {
                    html += '<td class="success"> ' + ((types[i-1][j-1] / types[i-1][5]) * 100).toFixed(3) + '%</td>';
                } else {
                    html += '<td> ' + ((types[i-1][j-1] / types[i-1][5]) * 100).toFixed(3) + '%</td>';
                }
            }
            html += '</tr>';
            allHtml += html;
        }
        $('#result').html(allHtml);
        console.log(types);
        console.log(allData);
    }

});
