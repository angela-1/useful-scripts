// ==UserScript==
// @name         批量下载邮件附件
// @namespace    yxoa
// @version      0.1.0
// @description  检测邮件附件列表自动点击下载
// @author       Angela
// @match        http://59.216.223.134/OA/LEAP/Login/*
// @icon         http://59.216.223.134/OA/LEAP/LBCPSYS1Module/Index/img/gongwen.png
// @updateURL    https://raw.githubusercontent.com/angela-1/useful-scripts/main/yxoa/download-attachment.js
// @downloadURL  https://raw.githubusercontent.com/angela-1/useful-scripts/main/yxoa/download-attachment.js
// @grant        none
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
  const head = document.getElementsByTagName("head")[0];
  if (!head) {
    return;
  }
  const style = document.createElement("style");
  style.innerHTML = css;
  head.appendChild(style);
}

/**
 * 在某个元素下查找符合条件的第一个元素
 * @param {HTMLElment} root 从哪里开始查找，查找的根元素
 * @param {string} selector 选择器
 * @param {Function} callback 回调函数
 * @returns 元素或undefined
 */
function findElement(root, selector, callback) {
  const items = root.querySelectorAll(selector);
  return Array.from(items).find(v => callback(v));
}

/**
 * 在某个元素下查找符合条件的所有元素
 * @param {HTMLElment} root 从哪里开始查找，查找的根元素
 * @param {string} selector 选择器
 * @param {Function} callback 回调函数
 * @returns 元素列表或空数组
 */
function findElementAll(root, selector, callback) {
  const items = root.querySelectorAll(selector);
  return Array.from(items).filter(v => callback(v));
}

/**
 * 清除空白字符
 * @param {string} val 清除空白字符
 * @returns 字符串
 */
function clearWhite(val) {
  return val.replace(/\s*/g, "");
}

/**
 * 查找到当前显示的，查看邮件的窗口
 * 转发、回复窗口不需要添加下载按钮
 * 不显示的窗口不需要添加下载按钮
 */
function findCurrentPopform() {
  return findElement(
    document,
    ".lgform2.lc_popform",
    (v) => {
      return v.style.display !== "none" &&
        (findElement(
          v,
          ".lgform2_title_text",
          (v) => v.innerHTML === "查看邮件"
        ) !== undefined);
    }
  );
}

/**
 * 下载邮件里的附件
 */
function downloadAttachment() {
  // oa邮件窗口，点一次就增加一个窗口的dom但是关闭并不会删除只是隐藏，
  // 所以要先找到显示的那个当前窗口才能正确获取下载链接
  const pop = findCurrentPopform()


  // 如果没有窗口显示就不用加了直接返回
  console.log('POP', pop);
  if (pop === undefined) {
    return;
  }

  const ul = pop.querySelector("[ut=fileul]");
  console.log("download att", ul);
  for (const item of ul.children) {
    const link = item.children[1];
    link.click();
  }
}

/**
 * 添加下载按钮
 * @returns 无
 */
function addDownloadButton() {
  const pop = findCurrentPopform()
  console.log('pop', pop);
  if (pop === undefined) {
    return;
  }

  const existDownload = findElement(
    pop,
    "button",
    (v) => clearWhite(v.textContent) === "下载"
  );

  console.log("exist download", existDownload);

  if (existDownload !== undefined) {
    console.log('exist');
    return;
  }

  const oneClickDownloadButton = findElement(
    pop,
    "a.lgimgbtn",
    (v) => clearWhite(v.text) === "转发"
  );

  if (oneClickDownloadButton !== undefined) {
    let downloadButton = document.createElement("button");
    downloadButton.setAttribute("id", "download-attachment-button");
    downloadButton.setAttribute("class", "root-198");

    downloadButton.type = "button";
    downloadButton.textContent = "下载";

    downloadButton.addEventListener("click", downloadAttachment);
    oneClickDownloadButton.parentElement.append(downloadButton);
    downloadButton = null; //及时解除不再使用的变量引用,即将其赋值为 null;
  }
}

(function () {
  "use strict";
  console.log("添加全局样式");
  addGlobalStyle(globalCss);

  window.addEventListener("click", addDownloadButton);


})();
