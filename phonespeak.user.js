// ==UserScript==
// @name         Phonespeak
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extension to translate phonespeak
// @author       You
// @match        *://www.facebook.com/*
// @icon         https://www.google.com/s2/favicons?domain=facebook.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const mapping = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];

  const findInMapping = (letter, offset = 2) =>
    mapping.findIndex(pair => pair.includes(letter)) + offset;

  const isPhoneSpeak = (comment) => /(\d{1,3}\.)+/g.test(comment);

  const phoneIcon = `${String.fromCodePoint(0x0001F4DE)} `;

  const translate = (seq, offset = 2) => seq
    .trim()
    .split(/\.|\s/)
    .map(pair => {
      const digit = pair[0];

      if (isNaN(digit)) {
        if (/[a-z]/i.test(digit)) {
          return pair.length > 1 ? pair + ' ' : findInMapping(digit);
        }
        return digit;
      }

      const num = parseInt(digit);
      if (num === 0) return ' ';

      const keymap = mapping[num - offset];
      if (!keymap) return pair;

      return keymap[pair.length - 1];
    })
    .join('');


  const injectStyle = () => {
    const css = `
    <style>
      [original-comment] {
          color: #ffdad3;
      }

      [original-comment]::before {
          content: attr(original-comment);
          display: none;
          color: grey;
      }

      [original-comment]:hover::before { display: block; }
    </style>
  `;

    document.body.insertAdjacentHTML('beforebegin', css);
  };

  const replaceComments = () => {
    const comments = Array.from(
      document.querySelectorAll(
        '[aria-label^=Comment] span div[dir=auto],' +
        '[aria-label^=Reply] span div[dir=auto]'
      )
    );

    comments
      .filter(({ innerText: comment }) => isPhoneSpeak(comment))
      .forEach(comment => {
        comment.setAttribute('original-comment', comment.innerText);

        comment.innerText = phoneIcon + translate(comment.innerText);
      });
  };

  onload = () => {
    setTimeout(() => {
      injectStyle();
      replaceComments();

      const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') replaceComments();
        }
      });

      observer.observe(
        document.querySelector('.stjgntxs.ni8dbmo4.l82x9zwi.uo3d90p7.h905i5nu.monazrh9'),
        { attributes: true, childList: true, subtree: true }
      );
    }, 1000);
  };
})();
