// ==UserScript==
// @name         Me Salva | c h e e t o
// @namespace    http://tampermonkey.net/
// @version      2024-10-12
// @description  God is good, dinner on the table
// @autor        marcos10pc
// @match        https://www.mesalva.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain_url=mesalva.com
// @grant        none
// ==/UserScript==

let notificationCount = 0;

function createAndShowNotification(message) {
    return new Promise((resolve) => {
        if (!document.getElementById('notification-styles')) {
            const e = document.createElement("style");
            e.id = 'notification-styles';
            e.innerHTML = `
                .notification {
                    position: fixed;
                    right: -320px;
                    background-color: #333;
                    color: #fff;
                    padding: 10px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    width: 320px;
                    height: 60px;
                    transition: right 0.5s ease;
                }
                .notification-content {
                    position: relative;
                    height: 100%;
                }
                .notification-content p {
                    margin: 0;
                    padding-top: 0;
                }
                .progress-bar {
                    position: absolute;
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    height: 5px;
                    background-color: #555;
                    border-radius: 5px;
                    width: 90%;
                    overflow: hidden;
                }
                .progress-bar div {
                    height: 100%;
                    background-color: #bbb;
                    width: 100%;
                    animation: progress 5s linear forwards;
                }
                @keyframes progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0;
                    }
                }
            `;
            document.head.appendChild(e);
        }

        notificationCount++;
        const t = document.createElement("div");
        t.id = `notification-${notificationCount}`;
        t.className = "notification";
        t.style.bottom = `${20 + (notificationCount - 1) * 70}px`;
        t.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                <div class="progress-bar"><div></div></div>
            </div>
        `;
        document.body.appendChild(t);

        setTimeout(() => {
            t.style.right = "20px";
        }, 10);

        setTimeout(() => {
            t.style.right = "-300px";
            setTimeout(() => {
                t.style.display = "none";
                notificationCount--;
                resolve();
            }, 500);
        }, 5000);
    });
}

async function getCorrectAnswer() {
    try {
        const response = await fetch(window.location.href);
        const data = await response.text();
        const scriptRegex = /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s;
        const match = data.match(scriptRegex);

        if (match) {
            const jsonData = JSON.parse(match[1]);
            const answer = jsonData.props.pageProps.content.children[0].list.find(resposta => resposta.isCorrect === true);
            return answer ? answer.letter : null;
        } else {
            createAndShowNotification("Não foi possível obter a resposta.");
        }
    } catch (error) {
        console.error('Erro ao buscar a resposta:', error);
        createAndShowNotification('Erro ao buscar a resposta.');
    }
}

async function processExercise() {
    const correctAnswer = await getCorrectAnswer();

    if (correctAnswer) {
        createAndShowNotification(`RESPOSTA: ${correctAnswer}`);
        const buttons = document.querySelectorAll('.exercise-answer__button');
        let clicked = false;

        buttons.forEach(button => {
            const letterElement = button.querySelector('.exercise-answer__letter');
            if (letterElement && letterElement.textContent.trim() === correctAnswer) {
                button.click();
                clicked = true;
            }
        });

        if (clicked) {
            const submitButton = document.querySelector('.btn.btn--primary.btn--size-md.submit-button');
            if (submitButton) {
                submitButton.click();
                await new Promise(resolve => setTimeout(resolve, 1000));

                const nextButton = document.querySelector('.btn.btn--primary.btn--size-md');
                if (nextButton) {
                    nextButton.click();
                }
            }
        }
    } else {
        createAndShowNotification("Resposta não encontrada.");
    }
}

(async function() {
    'use strict';

    let oldHref = document.location.href;
    const observer = new MutationObserver(async () => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            await processExercise();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    await processExercise();
})();
