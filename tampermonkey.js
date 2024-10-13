// ==UserScript==
// @name         Me Salva | c h e e t o
// @namespace    http://tampermonkey.net/
// @version      2024-10-12
// @description  God is good, dinner on the table
// @author       marcos10pc
// @match        https://www.mesalva.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain_url=mesalva.com
// @grant        none
// ==/UserScript==

function abacate(originalUrl) {
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split('/');
    const exerciseId = pathParts[pathParts.length - 1];
    const newPath = `/app/_next/data/eotWR84n2AGZWHLCKUcH5/exercicio/${exerciseId}.json`;
    const params = new URLSearchParams(url.search);
    params.append('content', 'exercicio');
    params.append('content', exerciseId);
    return `https://www.mesalva.com${newPath}?${params.toString()}`;
}

(async function() {
    'use strict';

    let catapimbas = /^https:\/\/www\.mesalva\.com\/app\/exercicio\/[a-z0-9\-]+(\?contexto=[^&]+&lista=[^&]+&modulo=[^&]+)?$/;
    console.log("-- sussy baka amongus marcos10pc --");
    let oldHref = document.location.href;

    const observer = new MutationObserver(async () => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;

            if (catapimbas.test(oldHref)) {
                let answer_url = abacate(oldHref);
                console.log(`${answer_url}`);

                try {
                    let pre_answer = await fetch(answer_url, {
                        method: "GET",
                    });

                    if (!pre_answer.ok) {
                        alert('uh, deu alguma porra ao tentar pegar resposta');
                    }

                    const porra_answer = await pre_answer.json();
                    const caralhos = porra_answer.pageProps.content.children[0].list;
                    const damn = caralhos.find(resposta => resposta.isCorrect === true);
                    console.log(`[DEBUG] -- ${damn} --`)
                    const buttons = document.querySelectorAll('.exercise-answer__button');

                    buttons.forEach(button => {
                        const letterElement = button.querySelector('.exercise-answer__letter');
                        if (letterElement && letterElement.textContent.trim() === damn.letter) {
                            button.click();
                        }
                    });
                    const submitButton = document.querySelector('.btn.btn--primary.btn--size-md.submit-button');
                    submitButton.click();
                } catch (error) {
                    console.error('Erro no fetch:', error);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
