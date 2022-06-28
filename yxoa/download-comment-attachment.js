// ==UserScript==
// @name         自动下载处理签和附件
// @namespace    yxoa
// @version      0.6.0
// @description  auto download comment and attachment
// @author       Angela
// @match        http://59.216.223.134/OA/LEAP/LWFP/*
// @icon         http://59.216.223.134/OA/LEAP/LBCPSYS1Module/Index/img/gongwen.png
// @updateURL    https://raw.githubusercontent.com/angela-1/useful-scripts/main/yxoa/download-comment-attachment.js
// @downloadURL  https://raw.githubusercontent.com/angela-1/useful-scripts/main/yxoa/download-comment-attachment.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

// 添加全局样式，给下载按钮用
const globalCss = `
.root-198 {
outline: transparent;
position: relative;
-webkit-font-smoothing: antialiased;
font-size: 14px;
font-weight: 400;
box-sizing: border-box;
border: 1px solid rgb(138, 136, 134);
display: inline-block;
text-decoration: none;
text-align: center;
cursor: pointer;
padding: 0px 16px;
border-radius: 2px;
min-width: 80px;
height: 32px;
background-color: rgb(255, 255, 255);
color: rgb(50, 49, 48);
user-select: none;
}

.root-198:hover {
background-color: rgb(243, 242, 241);
color: rgb(32, 31, 30);
}

.border {
border-bottom: 1px solid gray;
}
`;

/**
 * 添加全局样式表
 * @param {string} css 样式
 * @returns 无
 */
function addGlobalStyle(css) {
  const head = document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }
  const style = document.createElement('style');
  style.innerHTML = css;
  head.appendChild(style);
}

/**
 * 添加下载按钮
 * @returns 无
 */
function addDownloadButton() {
  const bottomButtons = document.querySelector('.LC_form_button_bottom');
  if (!bottomButtons) {
    return;
  }
  let downloadButton = document.createElement('button');
  downloadButton.setAttribute('id', 'copy-text-button');
  downloadButton.setAttribute('class', 'root-198');

  downloadButton.type = 'button';
  downloadButton.textContent = '下载';

  downloadButton.addEventListener('click', downloadCommentEx);
  downloadButton.addEventListener('click', downloadAttachment);

  bottomButtons.appendChild(downloadButton);
  downloadButton = null; //及时解除不再使用的变量引用,即将其赋值为 null;
}

// 废弃，不再需要生成隐藏input来获得处理笺文件名
/**
 * 下载处理笺和附件
 */
// function downlaodAll() {
//   // 必须要先下载处理签，再下载附件
//   // 因为有可能附件很大，点击一键下载会需要很长时间，造成复制文字失败

//   yxGlobalPrePrintMethod(
//     document.querySelector('[ut=table2_1],[ut=table1_1],[ut=tablePrint]')
//   )
//   console.log('printed')
//   return
//   downloadComment()
//   downloadAttachment()
//   clear()
// }

// 废弃，不再需要生成隐藏input来获得处理笺文件名
/**
 * 清理生成在input元素
 */
// function clear() {
//   const input = document.querySelector('#copy-text-input')
//   input.remove()
//   // const button = document.querySelector('#copy-text-button');
//   // button.remove();
// }

/**
 * 获取处理笺上的文件标题
 * @returns 处理笺文件标题
 */
function getDocName() {
  const tds = document.querySelectorAll('td');
  let td = null;
  for (const item of tds) {
    const textContent = item.textContent.replace(/\s*/g, '');
    if (textContent.includes('标题')) {
      td = item;
      break;
    }
  }

  if (!td) {
    return '';
  }

  const titleCell = td.nextElementSibling;

  const p = titleCell.querySelector('p');
  const textarea = titleCell.querySelector('textarea');
  const text = p.textContent.length > 0 ? p.textContent : textarea.value;
  const title = `处理签-${text}`;
  console.log(`取得标题 ${title}`);
  return title;
}

// 废弃，不再需要生成隐藏input来获得处理笺文件名
/**
 * 处理文字到剪贴板
 * @param {string} copyText 要复制的文字
 * @returns 复制结果
 */
// function copyToClipboard(copyText) {
//   console.log(`复制文本 ${copyText}`)
//   const input = document.createElement('input')
//   input.setAttribute('id', 'copy-text-input')
//   input.setAttribute('class', 'border')
//   input.setAttribute('readonly', 'readonly')
//   input.setAttribute('type', 'text')
//   input.value = copyText

//   document.querySelector('.LC_form_button_bottom').appendChild(input)
//   input.select()
//   return document.execCommand('copy')
// }

/**
 * 从yxoa上取得的全局打印函数，通过它设置打印pdf文件名，不再需要手工粘贴一次处理处理笺文件名
 * @param {element} theprinttable 要打印的元素选择字符串
 * @param {string} commentFileName 处理笺标题和下载文件名
 */
function yxGlobalPrePrintMethod(theprinttable, commentFileName) {
  const $ = window.jQuery;

  if ($(theprinttable).find('.table_td_1').length > 1) {
    $($(theprinttable).find('tr')[0]).addClass('willhidenborder');
  }
  $('.ynyx_showatprint').remove();
  //将input,textarea的内容搞出来
  const alltextarea = $(theprinttable).find('textarea:visible');
  for (let i = 0; i < alltextarea.length; i++) {
    if ($(alltextarea[i]).parent().parent().attr('panel') == '表头') {
      $(alltextarea[i]).addClass('willshowonprint');
    } else {
      const txtin = $(alltextarea[i]).val().replace(/\n/g, '<br/>');
      const tmp = $(
        '<div class="ynyx_showatprint" style="width:' +
          ($(alltextarea[i]).parent().width() - 10) +
          'px;"></div>'
      ).html(txtin);
      $(alltextarea[i]).parent().append(tmp);
    }
  }
  //input
  const allinput = $(theprinttable).find('input:visible');
  for (let i = 0; i < allinput.length; i++) {
    if (
      $(allinput[i]).parent().attr('ct') == 'date' ||
      $(allinput[i]).parent().parent().attr('panel') == '表头' ||
      $(allinput[i]).hasClass('wfcontrol_docnumber_input')
    ) {
      $(allinput[i]).addClass('willshowonprint');
    } else {
      const txtin = $(allinput[i]).val();
      const tmp = $(
        '<div class="ynyx_showatprint" style="width:' +
          ($(allinput[i]).parent().width() - 10) +
          'px"></div>'
      ).text(txtin);
      $(allinput[i]).parent().append(tmp);
    }
  }

  $('.lgbtn').parent().addClass('willhideonprint');
  //$(theprinttable).find('td').css('border','1px solid #ccc');
  $(theprinttable).print({
    globalStyles: true, //是否包含父文档的样式，默认为true
    mediaPrint: false, //是否包含media='print'的链接标签。会被globalStyles选项覆盖，默认为false
    stylesheet: null, //外部样式表的URL地址，默认为null
    noPrintSelector: '.no-print', //不想打印的元素的jQuery选择器，默认为".no-print"
    iframe: true, //是否使用一个iframe来替代打印表单的弹出窗口，true为在本页面进行打印，false就是说新开一个页面打印，默认为true
    append: null, //将内容添加到打印内容的后面
    prepend: null, //, //将内容添加到打印内容的前面，可以用来作为要打印内容
    deferred: $.Deferred().done(console.log('下载处理笺完成')), //回调函数
    title: commentFileName
  });
}

// 废弃，不再需要生成隐藏input来获得处理笺文件名
/**
 * 下载处理笺
 */
// function downloadComment() {
//   const copyText = getDocName()
//   const result = copyToClipboard(copyText)
//   console.log(`复制文本 ${copyText} ${result}`)

//   const printButton = findElm(
//     document.querySelector('.LC_form_button_bottom'),
//     'input[type=button]',
//     (v) => v.value === '打印'
//   )

//   if (printButton) {
//     printButton.click()
//     console.log('下载处理笺')
//   }
// }

function downloadCommentEx() {
  const docName = getDocName();
  document.title = docName;
  yxGlobalPrePrintMethod(
    '[ut=table2],[ut=table2_1],[ut=table1_1],[ut=tablePrint]',
    docName
  );
}

/**
 * 下载附件
 */
function downloadAttachment() {
  const oneClickDownloadButton = findElm(
    document,
    'a',
    (v) => v.text === '一键下载'
  );
  if (oneClickDownloadButton) {
    oneClickDownloadButton.click();
    console.log('下载附件');
  }
}

/**
 * 查找元素并执行函数
 * @param {HTMLElment} root 从哪里开始查找，查找的根元素
 * @param {string} selector 选择器
 * @param {Function} callback 回调函数
 * @returns
 */
function findElm(root, selector, callback) {
  const items = root.querySelectorAll(selector);
  let res = null;
  items.forEach((v) => {
    if (callback(v)) {
      res = v;
      return res;
    }
  });
  return res;
}

(function () {
  'use strict';

  setTimeout(() => {
    console.log('添加下载按钮');
    addDownloadButton();

    console.log('添加全局样式');
    addGlobalStyle(globalCss);
  }, 2000);
})();
