// ==UserScript==
// @name         TW Auto Farm Assistant BR (UI + Pause Edition)
// @author       xmavelx
// @version      4.1.0
// @grant        none
// @description  Script de auto farm otimizado com interface configurável e botão de PAUSE para Tribal Wars Brasil.
// @include      http*://*.tribalwars.com.br/*screen=am_farm*
// @namespace    https://greasyfork.org/users/xmavelx
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    var botProtect = $('body').data('bot-protect');
    if (document.URL.indexOf('screen=am_farm') === -1) {
        console.log('⚠️ Você deve executar o script no Assistente de Saque!');
        return;
    }
    if (botProtect !== undefined) {
        alert('⚠️ Captcha detectado! Pare imediatamente.');
        return;
    }

    // ==========================
    // ⚙️ Configurações padrão
    // ==========================
    var config = JSON.parse(localStorage.getItem("twAutoFarmConfig")) || {
        attackMin: 300,
        attackMax: 800,
        changeVillage: true,
        changeVillageMin: 150000,
        changeVillageMax: 240000,
        minUnitNumber: 6,
        maxWallLv: 10
    };

    var menu_a = '#plunder_list a.farm_icon_a',
        menu_b = '#plunder_list a.farm_icon_b',
        boxCaptcha = $("#bot_check");

    var lootAssistantPageSize = 100;

    // 🔴 Variáveis de controle do PAUSE
    var farmingActive = false;
    var attackTimeout = null;
    var changeVillageTimeout = null;
    var captchaCheck = null;

    // Função de tempo randômico
    function randomTime(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Função para embaralhar lista
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    // Captcha Check
    function startCaptchaCheck() {
        captchaCheck = setInterval(function () {
            if (boxCaptcha.length) {
                alert('⚠️ Captcha detectado! Script pausado.');
                stopFarming();
            }
        }, 200);
    }

    // Carrega todas as aldeias
    function showAllBarbs() {
        if (game_data.screen === 'am_farm') {
            function modify_table(data) {
                var result = $('<div>').html(data).contents();
                var rows = result.find('#plunder_list tr:not(:first-child)');
                $('#plunder_list').append(rows);
            }

            $('.paged-nav-item:not(:first-child)').each(function () {
                $.ajax({
                    url: $(this).attr('href'),
                    type: "get",
                    async: false,
                    success: function (data) {
                        modify_table(data);
                    },
                    error: function () {
                        UI.ErrorMessage('Erro ao carregar dados. Recarregue a página.', 5000);
                        throw new Error('interrupted script');
                    }
                });
                $(this).remove();
            });
            window.scrollTo(0, 0);
        }
        lootAssistantPageSize = document.querySelectorAll("#plunder_list a.farm_icon_a").length;
    }

    // Checa muralha
    function checkWall(maxWallLv, idx) {
        var wallLv = parseInt($('#plunder_list tr:not(:first)').eq(idx + 1).find('td').eq(6).text());
        return (isNaN(wallLv) || wallLv < maxWallLv);
    }

    // Função principal
    function startFarming() {
        farmingActive = true;
        showAllBarbs();

        var menu = (parseInt($('#light').text()) < parseInt($('#heavy').text())) ? menu_b : menu_a;
        var targets = $(menu).toArray();
        targets = shuffle(targets);

        var i = 0;
        function attackNext() {
            if (!farmingActive) return; // se pausado, para
            if (i >= targets.length) return;

            if (checkWall(config.maxWallLv, i)) {
                if (menu === menu_a && $('#light').text() >= config.minUnitNumber) {
                    $(targets[i]).click();
                } else if (menu === menu_b && $('#heavy').text() >= config.minUnitNumber) {
                    $(targets[i]).click();
                }
            }
            i++;
            attackTimeout = setTimeout(attackNext, randomTime(config.attackMin, config.attackMax));
        }

        attackNext();
    }

    // Troca de aldeia automática
    function scheduleVillageChange() {
        if (!config.changeVillage) return;
        function loopVillageChange() {
            if (!farmingActive) return; // se pausado, para
            var changeInterval = randomTime(config.changeVillageMin, config.changeVillageMax);
            changeVillageTimeout = setTimeout(function () {
                $('.arrowRight, .groupRight').click();
                setTimeout(startFarming, randomTime(3000, 8000));
                loopVillageChange();
            }, changeInterval);
        }
        loopVillageChange();
    }

    // ==========================
    // 🔴 Controle de START/STOP
    // ==========================
    function stopFarming() {
        farmingActive = false;
        clearTimeout(attackTimeout);
        clearTimeout(changeVillageTimeout);
        clearInterval(captchaCheck);
        console.log("⏸️ AutoFarm pausado.");
    }

    // ==========================
    // 🖥️ Interface de Configuração
    // ==========================
    function createUI() {
        var panel = document.createElement("div");
        panel.id = "autoFarmUI";
        panel.style.position = "fixed";
        panel.style.top = "80px";
        panel.style.right = "20px";
        panel.style.background = "rgba(0,0,0,0.85)";
        panel.style.color = "white";
        panel.style.padding = "10px";
        panel.style.border = "2px solid #555";
        panel.style.borderRadius = "8px";
        panel.style.zIndex = 9999;
        panel.style.fontSize = "12px";

        panel.innerHTML = `
            <b>⚙️ AutoFarm Config</b><br><br>
            Intervalo ataque (ms):<br>
            Min: <input id="afMin" type="number" value="${config.attackMin}" style="width:60px;"> 
            Max: <input id="afMax" type="number" value="${config.attackMax}" style="width:60px;"><br><br>
            
            Troca de aldeia (ms):<br>
            Min: <input id="cvMin" type="number" value="${config.changeVillageMin}" style="width:80px;"> 
            Max: <input id="cvMax" type="number" value="${config.changeVillageMax}" style="width:80px;"><br><br>
            
            Tropas mínimas: <input id="afUnits" type="number" value="${config.minUnitNumber}" style="width:60px;"><br>
            Muralha máx.: <input id="afWall" type="number" value="${config.maxWallLv}" style="width:60px;"><br><br>
            
            <button id="afSave">Salvar</button>
            <button id="afStart">▶️ Iniciar</button>
            <button id="afStop">⏸️ Parar</button>
        `;

        document.body.appendChild(panel);

        document.getElementById("afSave").onclick = function () {
            config.attackMin = parseInt(document.getElementById("afMin").value);
            config.attackMax = parseInt(document.getElementById("afMax").value);
            config.changeVillageMin = parseInt(document.getElementById("cvMin").value);
            config.changeVillageMax = parseInt(document.getElementById("cvMax").value);
            config.minUnitNumber = parseInt(document.getElementById("afUnits").value);
            config.maxWallLv = parseInt(document.getElementById("afWall").value);

            localStorage.setItem("twAutoFarmConfig", JSON.stringify(config));
            alert("✅ Configurações salvas!");
        };

        document.getElementById("afStart").onclick = function () {
            startCaptchaCheck();
            startFarming();
            scheduleVillageChange();
            alert("🚀 AutoFarm iniciado!");
        };

        document.getElementById("afStop").onclick = function () {
            stopFarming();
            alert("⏸️ AutoFarm pausado!");
        };
    }

    // Cria interface
    createUI();

})();
