
import { GoogleGenerativeAI } from "@google/generative-ai";
import './tuieditor/cdn/toastui-editor-all.js';
import './tuieditor/cdn/i18n/zh-cn.js';

import './tuieditor/plugins/chart/dist/toastui-chart.js';
import './tuieditor/plugins/tui-color-picker.min.js';
import './tuieditor/plugins/chart/dist/cdn/toastui-editor-plugin-chart.js';
import './tuieditor/plugins/code-syntax-highlight/dist/cdn/toastui-editor-plugin-code-syntax-highlight-all.js';
import './tuieditor/plugins/color-syntax/dist/cdn/toastui-editor-plugin-color-syntax.js';
import './tuieditor/plugins/table-merged-cell/dist/cdn/toastui-editor-plugin-table-merged-cell.js';
import './tuieditor/plugins/uml/dist/cdn/toastui-editor-plugin-uml.js';



// 重写 console.log 函数，使其什么都不做
// console.log = function() {};


// 编辑器变量噢诶之
const { Editor } = toastui;
const { chart, codeSyntaxHighlight, colorSyntax, tableMergedCell, uml } = Editor.plugin;
var editor;


// const uuid = UUID.generate();
// import mermaid from '/js/mermaid.esm.min.mjs';
// mermaid.initialize({ startOnLoad: true });



var messagesHistory = [];     //上下文消息
var tempMessagesHistory = []; //临时存储的上下文消息，用于执行出错时重新赋值给messagesHistory
var fullContent = ""; // 在函数外部定义，以便累积内容



var RANDOMNESS = 0.9;   // 随机性
var MAX_TOKENS = 4096; // 假设的最大token数，根据具体模型进行调整
var SET_MAX_TOKENS = 4096; //用户设定的最大tokens
var MAX_MSG_NUM = 30; // 您想要保留的最大消息数量


var API_URL = "http://127.0.0.1/xxxx";

var MY_TOKEN = "fk-xxxxx";

var MODEL = 'gpt-3.5-turbo';

// 定义模型名、搜索模式、上传目录等常量
const vectorModelName = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2";
const vectorSearchMode = "cosine";
var USERDIR = '/Users/sugar/Downloads/Aria2/test/';   //配置用户文件存储的目录
var selectedFiles = []; // 用于存储选中文件的数组



// 模型对应的tokens最大值
const modelTokensMapping = {
  "gpt-4-1106-preview": 128000,
  "gpt-4": 8192,
  "gpt-4-32k": 32768,
  "gpt-3.5-turbo-1106": 16385,
  "gpt-3.5-turbo": 4096,
  "gpt-3.5-turbo-16k": 16385,
  "gpt-3.5-turbo-instruct": 4096,
  "gemini-pro": 4096,
  "gemini-pro-vision": 4096,
  "glm-3-turbo": 4096,
  "glm-4": 4096,
  "cogview": 1024,
  "generalv2": 4096,
  "superagi": 3090
};



var TEMPLATE_MSG = '';

var IMAGEBASE64 = '';

const promptInput = document.getElementById("promptInput");
const urlInput = document.getElementById("urlInput");
const editorText = document.getElementById("editorText");
// const generateBtn = document.getElementById("generateBtn");
const continueBtn = document.getElementById("continueBtn");
const stopBtn = document.getElementById("stopBtn");
const getUrlContentBtn = document.getElementById("getUrlContentBtn");
// const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const roleInput = document.getElementById("roleInput");
const continueSeparator = document.getElementById("continueSeparator"); //继续的分隔符
const outputSeparator = document.getElementById("outputSeparator");   //参考模板



let isFinished = true; // 假设对话已结束，除非发现 finish_reason 不为 "stop"
// continueBtn.disabled = true;


let controller = null; // 存储AbortController实例


// 判断是否是第一次插入图片
var isNewImg = true;
// 判断是否是第一次插入角色
var isRoleFist = true;
// 判断url获取的文本框中的内容是否更改了
var isFirstUrlText = true;

// 初始会话id
var currentConversationIndex = null;




// 建立数据库
const db = new Dexie("aiSugarDatabase");
db.version(1).stores({
  sessions: '++id, name',
  config: 'sessionId, savedConfig',
  gptConfigData: '++id, formData',  // 新增用于存储表单数据的表
  converseConfig: 'sessionId, converseConfig',
  conversationHistory: 'sessionId, messagesHistory',
  sessionContents: 'sessionId, fullContent'
});







$(document).ready(async function () {

  // 初始化editor.md编辑器
  // 初始化 Mermaid
  // mermaid.initialize({ startOnLoad: true });

  // let _savedData = localStorage.getItem('historyData');
  // if (_savedData) {
  //   let _formData = JSON.parse(_savedData);
  //   fullContent = _formData.fullContent;
  // }

  // console.log(fullContent)

  // 异步函数用于等待初始化完成
  // async function initializeEditor() {
  //   return new Promise(resolve => {
  //     // 初始化编辑器
  //     editor = editormd("resultText", {
  //       width: "100%",
  //       height: "80vh",
  //       path: "/js/editor.md/lib/",
  //       emoji: true,
  //       flowChart: true,
  //       taskList: true,
  //       sequenceDiagram: true,
  //       tex: true,
  //       htmlDecode: true,
  //       onload: function () {
  //         initGraph();
  //         mermaid.init();
  //         mindmapHtml();
  //         initGraphMindmap();
  //         scrollToBottomEditorMd();
  //         resolve(); // 解决 Promise
  //         // updateConversationsListUI();  // 请注意这里使用了 await，确保异步操作完成后再更新 UI
  //         initializeConversation();   //初始化会话
  //       },
  //       onchange: function () {
  //         initGraph();
  //         mermaid.init();
  //         mindmapHtml();
  //         initGraphMindmap();
  //         fullContent = editor.getMarkdown();
  //       }
  //     });
  //   });
  // }

  // 使用异步函数等待初始化完成
  // async function initializeAndLoad() {
  //   await initializeEditor();
  //   // 在这里添加其他你希望在初始化后执行的代码
  // }

  // 调用异步函数进行初始化
  // initializeAndLoad();

  async function initializeEditor() {
    return new Promise(resolve => {
      const chartOptions = {
        minWidth: 100,
        maxWidth: 600,
        minHeight: 100,
        maxHeight: 300
      };
      editor = new Editor({
        el: document.querySelector('#resultText'),
        editorOptions: {
          fontSize: "16px" // 你想要的默认字体大小
        },
        initialEditType: 'markdown',   //markdown或wysiwyg
        previewStyle: 'vertical',  //tab或vertical
        height: '80vh',
        // initialValue: "内容",
        // hideModeSwitch: true,
        placeholder: '编辑区或自动生成区域',
        language: 'zh-CN',
        // plugins: [[chart, chartOptions]],
        autofocus: false,
        moveToEnd: false, // 设置为 false，插入内容后光标不会移到末尾
        // 根据需要添加更多配置项
        events: {
          load: function () {
            // 在此处添加相当于 onload 的逻辑
            // initGraph();
            // mermaid.init();
            // mindmapHtml();
            // initGraphMindmap();
            scrollToBottomEditorMd();
            resolve(); // 解决 Promise
            initializeConversation(); // 初始化会话
          },
          change: function () {
            // 在此处添加相当于 onchange 的逻辑
            initGraph();
            mermaid.init();
            // mindmapHtml();
            initGraphMindmap();
            // initGraphMindmapWYSIWYG();
            // fullContent = editor.getMarkdown();
          }
        },
        plugins: [
          [chart, chartOptions],
          [codeSyntaxHighlight, { highlighter: Prism }],
          colorSyntax,
          tableMergedCell,
          uml
        ],
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          // ... 其他工具栏项 ...
          // [{
          //     el: createToggleModeButton(),
          //     tooltip: 'Toggle Mode'
          // }]
        ],

      });
    });
  }



  // 使用异步函数等待初始化完成
  async function initializeAndLoad() {
    await initializeEditor();
    // 在这里添加其他你希望在初始化后执行的代码

    // mindmapHtml();
    // initGraphMindmap();
  }

  // 调用异步函数进行初始化
  initializeAndLoad();

  function createToggleModeButton() {
    const button = document.createElement('button');
    let isEditMode = true; // 初始状态为编辑模式

    button.className = 'toastui-editor-toolbar-icons toggle-mode';
    button.style.backgroundImage = 'none';
    button.innerHTML = `<i class="bi bi-journal-richtext"></i>`; // 使用 'Toggle' 文字或者相应的图标
    button.title = '切换编辑器/预览模式'; // 设置工具提示
    button.addEventListener('click', () => {
      const editorElement = document.querySelector('.toastui-editor-main .toastui-editor-md-vertical-style .toastui-editor');
      const previewElement = document.querySelector('.toastui-editor-main .toastui-editor-md-vertical-style .toastui-editor-md-preview');
      const splitterElement = document.querySelector('.toastui-editor-main .toastui-editor-md-vertical-style .toastui-editor-md-splitter');
      if (isEditMode) {
        // 切换到预览模式
        editorElement.style.width = '0%';
        editorElement.style.overflow = 'hidden';
        splitterElement.style.display = 'none';
        previewElement.style.width = '100%';
      } else {
        // 切换回编辑模式
        editorElement.style.width = ''; // 重置为默认样式
        editorElement.style.overflow = '';
        splitterElement.style.display = 'block';
        previewElement.style.width = ''; // 重置为默认样式
      }

      isEditMode = !isEditMode; // 切换模式
    });

    button.addEventListener('click', () => {
      // ... 切换模式的代码 ...

      if (isEditMode) {
        button.innerHTML = `<i class="bi bi-journal-richtext"></i>`; // 更改为预览模式图标
      } else {
        button.innerHTML = `<i class="bi bi-eye"></i>`; // 更改为编辑模式图标
      }
    });

    return button;
  }

  // editor.insertToolbarItem({ groupIndex: 0, itemIndex: 0 }, {
  //   name: 'myItem',
  //   tooltip: 'Custom Button',
  //   command: 'bold',
  //   text: '@',
  //   className: 'toastui-editor-toolbar-icons first',
  //   style: { backgroundImage: 'none' }
  // });

  // 插入自定义切换按钮
  // editor.insertToolbarItem({ groupIndex: 0, itemIndex: 0 }, {
  //     el: createToggleModeButton(),
  //     tooltip: '切换编辑器/预览模式'
  // });

  // 创建自定义按钮
  const toggleButton = createToggleModeButton();
  // 获取工具栏的 DOM 引用
  const toolbar = document.querySelector('.toastui-editor-toolbar-group');
  // 将自定义按钮插入到工具栏的最前面
  toolbar.insertBefore(toggleButton, toolbar.firstChild);


  const mermaidHtml = (str) => {
    return `<pre><code class="language-mermaid"><div class="mermaid">${str}</div></code></pre>`;
  }

  const initGraph = () => {
    // 获取 editormd 预览容器中所有的 Mermaid 代码块
    const mermaidBlocks = document.querySelectorAll('.editormd-preview-container pre ol .L0 .lang-mermaid');

    mermaidBlocks.forEach(block => {
      let buffer = [];
      // 查找包含 Mermaid 代码的列表项
      const listItems = block.parentNode.parentNode.querySelectorAll('li');

      listItems.forEach(li => {
        // 获取列表项中的 span 元素的文本
        const spans = li.querySelectorAll('span');
        spans.forEach(span => {
          buffer.push(span.textContent);
        });
        buffer.push("\n");
      });

      // 创建新的 Mermaid HTML 结构
      const contentBuffer = buffer.join("");
      const content = mermaidHtml(contentBuffer);

      // 插入新的 Mermaid HTML 并移除旧的
      const preDom = block.parentNode.parentNode.parentNode;
      if (preDom && preDom.parentNode) { // 确保 preDom 存在并且有父元素
        preDom.insertAdjacentHTML('afterend', content);
        preDom.remove();
      } else {
        console.error("Error: The target element has no parent.");
        showAlert("Error: The target element has no parent.", 'danger', 3000);
      }
    });

  }


  // 思维导图处理
  // const mindmapHtml = (str, id) => {
  //   const iframeId = `mindmap-iframe-${id}`;
  //   return `<div class="mindmap-container">
  //   <!--<pre><code class="language-mindmap"><div class="mindmap">${str}</div></code></pre>-->
  //               <div class="mindmap-content">
  //                   <div class="mindmap-editor" data-mindmap-id="${iframeId}" data-mindmap-content="${str}">编辑</div>
  //                   <iframe src="/mindmap.html" id="${iframeId}" frameborder="0" width="100%" height="500" scrolling="no" allowtransparency="true" style="border:0px;outline:none;"></iframe>
  //               </div>
  //           </div>`;
  // };

  // // 所见即所得模式
  // const initGraphMindmapWYSIWYG = () => {
  //   // 选择所有 WYSIWYG 模式下的 mindmap 块
  //   const mindmapBlocks = document.querySelectorAll('.ProseMirror .toastui-editor-ww-code-block-highlighting .language-mindmap');

  //   mindmapBlocks.forEach((block, index) => {
  //     const content = block.textContent; // 获取 mindmap 文本内容
  //     const iframeId = `mindmap-iframe-wysiwyg-${index + 1}`;
  //     const existingMindmapContainer = document.querySelector(`#mindmap-${index + 1}`);

  //     if (!existingMindmapContainer || currentMindmapData[iframeId] !== content) {
  //       currentMindmapData[iframeId] = content;
  //       const mindmapHTML = mindmapHtml(content, index + 1);

  //       // 移除旧的 mindmap HTML 结构（如果存在）
  //       if (existingMindmapContainer) {
  //         existingMindmapContainer.parentNode.remove();
  //       }

  //       // 插入新的 mindmap HTML 结构
  //       block.insertAdjacentHTML('afterend', mindmapHTML); // 在当前 block 后插入
  //       block.style.display = 'none'; // 隐藏原始 mindmap 文本块

  //       // 重新加载 iframe
  //       const iframeElement = document.getElementById(iframeId);
  //       iframeElement.addEventListener('load', () => {
  //         const iframeWindow = iframeElement.contentWindow;
  //         iframeWindow.postMessage({ type: 'importMarkdown', data: content }, '*');
  //       });
  //     }
  //   });
  // };


  // // 假设有一个全局对象来存储每个 mindmap 的当前数据
  // let currentMindmapData = {};
  // // 编辑器模式
  // const initGraphMindmap = () => {
  //   // 选择所有包含 `lang-mindmap` 类的 pre 元素
  //   const mindmapBlocks = document.querySelectorAll('.toastui-editor-contents .lang-mindmap');

  //   mindmapBlocks.forEach((block, index) => {
  //     // 获取 mindmap 内容
  //     const content = block.textContent; // 获取文本内容
  //     const iframeId = `mindmap-iframe-${index + 1}`;
  //     const existingMindmapContainer = document.querySelector(`#mindmap-${index + 1}`);

  //     console.log("existingMindmapContainer",existingMindmapContainer)

  //     if (!existingMindmapContainer || currentMindmapData[iframeId] !== content) {
  //       currentMindmapData[iframeId] = content;
  //       const mindmapHTML = mindmapHtml(content, index + 1);

  //       // 移除旧的 mindmap HTML 结构（如果存在）
  //       if (existingMindmapContainer) {
  //         existingMindmapContainer.parentNode.remove();
  //       }

  //       // 插入新的 mindmap HTML 结构
  //       block.insertAdjacentHTML('afterend', mindmapHTML); // 直接在当前 block 后插入
  //       block.style.display = 'none'; // 隐藏原始 mindmap 文本

  //       // 重新加载 iframe
  //       const iframeElement = document.getElementById(iframeId);
  //       iframeElement.addEventListener('load', () => {
  //         const iframeWindow = iframeElement.contentWindow;
  //         iframeWindow.postMessage({ type: 'importMarkdown', data: content }, '*');
  //       });
  //     }
  //   });
  // };




  const mindmapHtml = (str, nodeId) => {
    const iframeId = `mindmap-iframe-${nodeId}`;
    return `<div class="mindmap-container" data-nodeid-container="${nodeId}">
                <div class="mindmap-content">
                    <div class="mindmap-editor" data-mindmap-id="${iframeId}" data-mindmap-content="${str}">编辑</div>
                    <iframe src="/mindmap.html" id="${iframeId}" frameborder="0" width="100%" height="500" scrolling="no" allowtransparency="true" style="border:0px;outline:none;"></iframe>
                </div>
            </div>`;
  };

  const initGraphMindmap = () => {
    const mindmapBlocks = document.querySelectorAll('.toastui-editor-contents .lang-mindmap');

    console.log("mindmapBlocks9999", mindmapBlocks);

    mindmapBlocks.forEach((block) => {
      const nodeId = block.getAttribute('data-nodeid');
      const content = block.textContent;
      const iframeId = `mindmap-iframe-${nodeId}`;

      console.log("iframeId", iframeId);

      // 检查是否已存在对应的 mindmap HTML 结构
      const existingMindmapContainer = document.querySelector(`.mindmap-container[data-nodeid-container="${nodeId}"]`);
      if (existingMindmapContainer) {
        console.log("更新现有 iframe 的内容");
        // 更新现有 iframe 的内容
        block.style.display = 'none';
        updateMindmapContent(iframeId, content);
        existingMindmapContainer.querySelector('iframe').contentWindow.postMessage({ type: 'importMarkdown', data: content }, '*');
      } else {
        // 插入新的 mindmap HTML 结构
        console.log("插入新的 mindmap HTML 结构");
        const mindmapHTML = mindmapHtml(content, nodeId);
        block.insertAdjacentHTML('afterend', mindmapHTML);
        updateMindmapContent(iframeId, content);
        block.style.display = 'none';
      }
    });

    // 删除不存在的 mindmap-container
    const mindmapContainers = document.querySelectorAll('.mindmap-container');
    mindmapContainers.forEach(container => {
      console.log("已删除不存在的 mindmap-container");
      const nodeId = container.getAttribute('data-nodeid-container');
      if (!document.querySelector(`.lang-mindmap[data-nodeid="${nodeId}"]`)) {
        container.remove();
      }
    });

    console.log("初始化完成");
  };


  // 假设有一个全局对象来存储每个 mindmap 的当前数据
  let currentMindmapData = {};
  // 编辑器模式  
  const updateMindmapContent = (mindmapId, newContent) => {
    console.log("mindmapId newContent", mindmapId, newContent);
    const mindmapContainer = document.querySelector(`[data-mindmap-id="${mindmapId}"]`);

    //  if (mindmapContainer) {
    mindmapContainer.setAttribute('data-mindmap-content', newContent);
    // 如果需要触发编辑，可以添加相关逻辑
    //  }
  };







  // 保持生成内容时，显示的文本保持在最底部
  function scrollToBottomEditorMd() {
    // 滚动到底部
    // var cm = editor.cm;
    // var lineCount = cm.lineCount();
    // cm.setCursor({ line: lineCount, ch: 0 });
    // cm.focus();
    // editor.gotoLine("last");

    // // 滚动预览区域到底部
    // var previewContainer = $(".editormd-preview");

    // // 延迟一秒执行滚动到底部的代码
    // setTimeout(function () {

    //   console.log("滚动到底部");
    //   // 滚动到底部
    //   previewContainer.scrollTop(previewContainer[0].scrollHeight);
    // }, 100);

    setTimeout(() => {
      // 获取预览区的 DOM 元素
      const previewEl = document.querySelector('.toastui-editor-md-preview');

      // 滚动到预览区的底部
      if (previewEl) {
        previewEl.scrollTop = previewEl.scrollHeight;
      }
    }, 0);

  }






  // 生成开始  // 生成开始  // 生成开始  // 生成开始  // 生成开始
  // 生成开始  // 生成开始  // 生成开始  // 生成开始  // 生成开始
  // 生成开始  // 生成开始  // 生成开始  // 生成开始  // 生成开始
  var originalValue = '小助手';  //定义角色
  const continueGenerate = async () => {
    // generateBtn.disabled = true;
    continueBtn.disabled = true;
    stopBtn.disabled = false


    if (!promptInput.value) {
      // alert("请输入提示词");
      showAlert("请输入提示词", 'warning', 3000);
      return;
    }

    tempMessagesHistory = messagesHistory;

    // return;


    // 初始化 AbortController
    controller = new AbortController();

    const selectedApi = $('#interface-type').val(); // 获取用户选择的模型API类型

    if (!isFinished) {
      console.log("自动继续");
      updatemessagesHistory("user", "继续");
    } else {
      await modeSeleted();    // 模板选择
      outputSeparatoSeleted();  // 拼接模式

      // 判断是否是第一次，如果是第一次，则加入角色
      if (isRoleFist) {
        console.log("执行了角色信息插入")
        originalValue = roleInput.value;
        if (originalValue) {
          updatemessagesHistory("user", originalValue);
          isRoleFist = false; // 重置标志位

          if (selectedApi === 'gemini') {
            updatemessagesHistory("model", "好的");
          }
          if (selectedApi === 'superagi') {
            updatemessagesHistory("assistant", "好的");
          }
        }
      } else {

      }

      if (TEMPLATE_MSG) {
        updatemessagesHistory("user", TEMPLATE_MSG);
      }

    }



    console.log("MAX_TOKENS", SET_MAX_TOKENS);
    console.log("MAX_MSG_NUM", MAX_MSG_NUM);
    console.log("RANDOMNESS", RANDOMNESS);

    console.log("未处理的记录", messagesHistory);


    // 判断非openai的接口使用openai的tokens计算规则
    // "gemini-pro": 4096,
    // "gemini-pro-vision": 4096,
    // "glm-3-turbo":  4096,
    // "glm-4": 4096,
    // "cogview":1024,
    // "generalv2":4096

    messagesHistory = await truncateMessagesHistory(messagesHistory, SET_MAX_TOKENS, MAX_MSG_NUM, MODEL);

    console.log("处理之后的", messagesHistory);




    try {
      if (selectedApi === 'openai' || selectedApi === 'pandora') {
        // OpenAI API 请求
        await fetchOpenAI();
      } else if (selectedApi === 'gemini') {
        // Google Gemini API 请求
        await fetchGemini();
      } else if (selectedApi == 'zhipu') {
        await fetchZhipuGPT();
      } else if (selectedApi == 'zhipuimg') {
        await fetchImage();
      } else if (selectedApi == 'xinghuo') {
        await xinghuoGpt();
      } else if (selectedApi == 'superagi') {
        await fetchSuperAGI();
        // fetchData();
      } else {
        // 自定义请求，可以自己修改成其他函数
        await fetchOpenAI();
      }

      // 显示历史记录
      displayMessagesHistory();

    } catch (error) {
      handleError(error);
    } finally {
      resetUiState();
    }
  };


  // OpenAI API 请求处理
  var assistantResponse = ""; // 用于收集助手的完整回复
  async function fetchOpenAI() {

    assistantResponse = "";

    console.log(MODEL);
    console.log(API_URL);


    const openaiHistory = messagesHistory.map(message => {
      return {
        role: message.role,
        content: message.content
      };
    });

    console.log(openaiHistory);

    const signal = controller.signal;
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MY_TOKEN}`,
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": openaiHistory,
        "temperature": RANDOMNESS,
        "max_tokens": SET_MAX_TOKENS,
        "stream": true
      }),
      signal
    });

    if (!response.ok) {
      messagesHistory = tempMessagesHistory;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      // if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      processStreamedResponse(chunk);



      if (done) {
        if (assistantResponse) {
          // messagesHistory.push({ role: "assistant", content: assistantResponse });
          updatemessagesHistory("assistant", assistantResponse);
        }
        console.log("Stream complete");
        console.log(messagesHistory);
        console.log(continueSeparator.value);

        console.log("是否已完成", isFinished);

        if (!isFinished) {
          console.log("自动继续");
          continueGenerate();   //继续生成
          // generate(); //继续生成
          return;
        }

        if (continueSeparator.value == "break") {
          // fullContent += '\n';
        } else if (continueSeparator.value == "dash") {
          // fullContent += '\n\n------------\n\n';
        } else if (continueSeparator.value == "dialog") {
          // fullContent += `\n\n**小助手:** \n`;
          fullContent += '\n```\n\n';
          editor.setMarkdown(fullContent);
          scrollToBottomEditorMd();
        } else {
          // 默认拼接
        }

        // 历史记录更新到数据库
        addMessageToHistory(messagesHistory);

        continueBtn.disabled = false;
        // fullContent += `${continueSeparator.value}`;
        break;
      } else {
        console.log("done", done);
      }
    }
  }

  // 提取 base64 编码字符串中的 MIME 类型
  function extractMimeType(base64String) {
    const mimeType = base64String.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
    return mimeType ? mimeType[1] : null;
  }

  // Google Gemini API 请求处理
  async function fetchGemini() {
    const API_KEY = MY_TOKEN; // 使用您的 Gemini API 密钥
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });


    console.log(TEMPLATE_MSG)


    // 构建请求内容，包括文本和图片
    const geminiHistoryImg = messagesHistory.map(message => ({ text: message.role + ": " + message.content }));
    // const prompt = $('#promptInput').val(); // 获取用户输入的提示
    // geminiHistory.push({ text: "user: " + prompt }); // 将用户当前输入作为新的一部分加入历史记录

    const geminiHistoryChat = messagesHistory.map(message => {
      return {
        role: message.role,
        parts: [{ text: message.content }]
      };
    });

    // 如果有图片数据，添加到请求内容中
    if (MODEL === "gemini-pro-vision" && IMAGEBASE64) {
      // 读取图片数据（假设您已经将图片以 base64 编码的形式存储在某个变量中）
      const imageBase64 = IMAGEBASE64;/* 获取图片的 base64 编码数据 */
      const _mimeType = extractMimeType(IMAGEBASE64); // 提取图片的 MIME 类型


      if (imageBase64 && _mimeType) {
        geminiHistoryImg.push({ inlineData: { data: imageBase64.split(',')[1], mimeType: _mimeType } });

        // 如果是第一次插入图片
        if (isNewImg) {
          fullContent += `<img src="${imageBase64}">\n\n`;
          isNewImg = false; // 重置标志位
        }
      } else {
        $('.images-selete').addClass('show');
        showAlert("请先上传图片", "warning", 3000);
        return;
      }
    }




    try {
      // const prompt = $('#promptInput').val(); // 获取用户输入的提示
      // geminiHistory.push({ text: "user: " + TEMPLATE_MSG }); // 将用户当前输入作为新的一部分加入历史记录

      // RANDOMNESS = parametersSet(1);   //获取随机性

      const generationConfig = {
        temperature: RANDOMNESS,
        topK: 1,
        topP: 1,
        maxOutputTokens: SET_MAX_TOKENS
      };

      console.log("geminiHistory99", geminiHistoryChat);

      let result;
      if (MODEL == "gemini-pro-vision") {
        result = await model.generateContentStream({
          contents: [{ role: "user", parts: geminiHistoryImg }],
          generationConfig,
        });
      } else {
        result = await model.generateContentStream({
          contents: [geminiHistoryChat],
          generationConfig,
        });
      }


      // 处理流式响应
      await processGeminiStreamedResponse(result.stream);

      // 获取响应文本
      const response = await result.response;
      const text = await response.text();

      // 去掉 "model:" 字符串，如果有
      let cleanedText = text.replace("model:", "");

      console.log("prompt", TEMPLATE_MSG);
      console.log("text", cleanedText);

      if (continueSeparator.value == "break") {
        // fullContent += '\n';
      } else if (continueSeparator.value == "dash") {
        // fullContent += '\n\n------------\n\n';
      } else if (continueSeparator.value == "dialog") {
        // fullContent += `\n\n**小助手:** \n`;
        fullContent += '\n```\n\n';
        editor.setMarkdown(fullContent);
        scrollToBottomEditorMd();
      } else {
        // 默认拼接
      }

      console.log(messagesHistory);

      // 历史记录更新到数据库
      addMessageToHistory(messagesHistory);


    } catch (error) {
      messagesHistory = tempMessagesHistory;
      showAlert(error, 'danger', 3000);
      throw error; // 错误处理
    }
  }



  // 处理 Google Gemini 的流式响应
  async function processGeminiStreamedResponse(stream) {
    assistantResponse = "";

    for await (const chunk of stream) {
      const chunkText = await chunk.text(); // 添加 await
      let cleanedText = chunkText.replace("model:", "");
      assistantResponse += cleanedText;
      fullContent += cleanedText;
      editor.setMarkdown(fullContent);
      scrollToBottomEditorMd();
    }

    // 更新历史消息记录
    updatemessagesHistory("model", assistantResponse);
  }



  // 处理openai流式响应
  function processStreamedResponse(chunk) {
    const lines = chunk.split("\n");

    lines.forEach((line) => {
      // console.log("line",line);
      if (line.startsWith("data: ")) {
        const jsonData = line.substring(5);
        if (jsonData.trim() !== "[DONE]") {
          try {
            const data = JSON.parse(jsonData);
            const choice = data.choices[0];

            if (data.choices && data.choices.length > 0 && data.choices[0].delta) {
              const messageChunk = data.choices[0].delta.content;
              if (messageChunk) {
                assistantResponse += messageChunk;
                fullContent += messageChunk;
                editor.setMarkdown(fullContent); // 实时更新编辑器内容
                scrollToBottomEditorMd();
              }

              // console.log("choice.finish_reason",choice.finish_reason);

              // 判断是否已经完全输出了
              if (choice.finish_reason !== "stop") {
                isFinished = false; // 如果发现 finish_reason 不为 "stop"，标记对话未结束
              } else {
                isFinished = true;
              }

            }
          } catch (jsonError) {
            messagesHistory = tempMessagesHistory;
            console.error("JSON parsing error:", jsonError);
            showAlert("JSON parsing error:", 'danger', 3000);
          }
        }
      }
    });

  }

  // 处理错误
  function handleError(error) {
    continueBtn.disabled = false;
    if (error.message === "The user aborted a request.") {
      // alert("Request aborted.");
      messagesHistory = tempMessagesHistory;
      showAlert("Request aborted.", 'warning', 3000);
    } else {
      messagesHistory = tempMessagesHistory;
      console.error("Error:", error);
      showAlert("Error occurred while generating:" + error, 'danger', 3000);
      // alert("Error occurred while generating.");
    }
  }


  async function fetchZhipuGPT() {
    assistantResponse = ""; // 用于收集助手的完整回复

    const zhipuHistory = messagesHistory.map(message => {
      return {
        role: message.role,
        content: message.content
      };
    });

    console.log(zhipuHistory);

    const signal = controller.signal;
    const response = await fetch('/zhipugpt/', { // 使用您的 Zhipu API 端点
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "key": MY_TOKEN,
        "messages": zhipuHistory,
        "model": MODEL
      }),
      signal
    });

    if (!response.ok) {
      messagesHistory = tempMessagesHistory;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // 读取流式响应
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (continueSeparator.value == "break") {
          // fullContent += '\n';
        } else if (continueSeparator.value == "dash") {
          // fullContent += '\n\n------------\n\n';
        } else if (continueSeparator.value == "dialog") {
          // fullContent += `\n\n**小助手:** \n`;
          fullContent += '\n```\n\n';
          editor.setMarkdown(fullContent);
          scrollToBottomEditorMd();
        } else {
          // 默认拼接
        }

        console.log("assistantResponse8888", assistantResponse)
        // 更新助手的回复到历史记录
        if (assistantResponse) {
          console.log("已更新历史记录", assistantResponse)
          updatemessagesHistory("assistant", assistantResponse);
        }

        // 历史记录更新到数据库
        addMessageToHistory(messagesHistory);
        console.log("Zhipu GPT Stream complete");
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      processZhipuStreamedResponse(chunk);
    }


  }

  // 处理清华智谱 GPT 的流式响应
  let buffer = '';

  function processZhipuStreamedResponse(chunk) {
    buffer += chunk;

    try {
      let boundary = buffer.indexOf('\n'); // 假设每个 JSON 对象后都跟着一个换行符
      while (boundary !== -1) {
        const jsonChunk = buffer.substring(0, boundary).trim();
        buffer = buffer.substring(boundary + 1);
        if (jsonChunk) {
          const responseData = JSON.parse(jsonChunk);
          if (responseData.role === "assistant") {
            assistantResponse += responseData.content;
            fullContent += responseData.content;
            editor.setMarkdown(fullContent); // 实时更新编辑器内容
            scrollToBottomEditorMd();
          }
        }
        boundary = buffer.indexOf('\n');
      }
    } catch (jsonError) {
      console.error("JSON parsing error in Zhipu GPT response:", jsonError);
      // 可能是部分 JSON 数据，等待更多数据
    }
  }


  // 清华智谱图片生成
  async function fetchImage() {
    const model = MODEL; // 比如 "cogview"
    const prompt = promptInput.value; // 比如 "生成一只飞翔的小狗"

    const response = await fetch('/zp_generate_image/', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "api_key": MY_TOKEN,  // 替换为您的 API 密钥
        "model": model,
        "prompt": prompt
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.url;

    if (imageUrl) {
      // 将图片 URL 以 Markdown 格式添加到编辑器
      if (continueSeparator.value == "dialog") {
        const markdownImage = `<img src="${imageUrl}" alt="Generated Image">\n`;
        editor.setMarkdown(editor.getMarkdown() + markdownImage); // 假设 editor 是您的 Markdown 编辑器实例
      } else {
        const markdownImage = `![Generated Image](${imageUrl})\n`;
        editor.setMarkdown(editor.getMarkdown() + markdownImage); // 假设 editor 是您的 Markdown 编辑器实例
      }

    } else {
      console.error("No image URL returned");
    }
  }


  // 星火大模型
  var requestObj = {
    APPID: 'xxx',
    APISecret: 'xxxx',
    APIKey: 'xxxxx',
    Uid: "xxxx",
    sparkResult: ''
  }

  // sendMsgBtn.addEventListener('click', (e) => {
  //   sendMsg()
  // })

  // questionInput.addEventListener('keydown', function (event) {
  //   if (event.key === 'Enter') { sendMsg(); }
  // });

  const xinghuoGpt = async () => {


    let myUrl = await getWebsocketUrl();
    // let inputVal = promptInput.value;
    let socket = new WebSocket(myUrl);

    assistantResponse = ""; // 用于收集助手的完整回复

    console.log("addMessageToHistory", messagesHistory);

    const xinghuoHistory = messagesHistory.map(message => {
      return {
        role: message.role,
        content: message.content
      };
    });

    console.log("xinghuoHistory", xinghuoHistory)

    socket.addEventListener('open', (event) => {
      let params = {
        "header": {
          "app_id": requestObj.APPID,
          "uid": requestObj.Uid
        },
        "parameter": {
          "chat": {
            "domain": "generalv2",
            "temperature": 0.5,
            "max_tokens": 1024,
          }
        },
        "payload": {
          "message": {
            "text": xinghuoHistory
          }
        }
      };
      socket.send(JSON.stringify(params))
    })

    socket.addEventListener('message', (event) => {
      let data = JSON.parse(event.data)
      requestObj.sparkResult = data.payload.choices.text[0].content
      if (data.header.code !== 0) {
        socket.close()
      }
      if (data.header.code === 0) {
        if (data.payload.choices.text && data.header.status === 2) {
          requestObj.sparkResult = data.payload.choices.text[0].content;
          setTimeout(() => {
            socket.close()
          }, 1000)
        }
      }

      assistantResponse += requestObj.sparkResult;

      addMsgToTextarea(requestObj.sparkResult);

    })

    socket.addEventListener('close', () => {
      // questionInput.value = '';
      if (continueSeparator.value == "break") {
        // fullContent += '\n';
      } else if (continueSeparator.value == "dash") {
        // fullContent += '\n\n------------\n\n';
      } else if (continueSeparator.value == "dialog") {
        // fullContent += `\n\n**小助手:** \n`;
        fullContent += '\n```\n\n';
        editor.setMarkdown(fullContent);
        scrollToBottomEditorMd();
      } else {
        // 默认拼接
      }

      console.log("assistantResponse8888", assistantResponse)
      // 更新助手的回复到历史记录
      if (assistantResponse) {
        console.log("已更新历史记录", assistantResponse)
        updatemessagesHistory("assistant", assistantResponse);
      }

      console.log("已更新messagesHistory", messagesHistory)

    });

    socket.addEventListener('error', (event) => {
      // messagesHistory = tempMessagesHistory;
      console.log('连接发送错误！！', event);
    });

    // 历史记录更新到数据库
    addMessageToHistory(messagesHistory);
  }

  const getWebsocketUrl = () => {
    return new Promise((resovle, reject) => {
      let url = "wss://spark-api.xf-yun.com/v3.1/chat";
      let host = "spark-api.xf-yun.com";
      let apiKeyName = "api_key";
      let date = new Date().toGMTString();
      let algorithm = "hmac-sha256"
      let headers = "host date request-line";
      let signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v3.1/chat HTTP/1.1`;
      let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, requestObj.APISecret);
      let signature = CryptoJS.enc.Base64.stringify(signatureSha);

      let authorizationOrigin = `${apiKeyName}="${requestObj.APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;

      let authorization = Base64.encode(authorizationOrigin);

      url = `${url}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`;

      resovle(url)
    })
  }

  const addMsgToTextarea = (text) => {
    // if (text) {
    fullContent += text;
    editor.setMarkdown(fullContent); // 实时更新编辑器内容
    scrollToBottomEditorMd();
    // }
  }


  // superAGI接口
  // async function fetchSuperAGI() {
  //     assistantResponse = "";

  //     const superagiHistory = messagesHistory.map(message => {
  //         return {
  //             role: message.role,
  //             content: message.content
  //         };
  //     });

  //     console.log(superagiHistory)

  //     const signal = controller.signal;
  //     const response = await fetch(API_URL, {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${MY_TOKEN}`
  //         },
  //         body: JSON.stringify({
  //             "system_prompt": "你是一个乐于助人的人工智能助理",
  //             "messages": superagiHistory,
  //             "max_tokens": 1024,
  //             "temperature": 0.9,
  //             "top_p": 0.1,
  //             "repetition_penalty": 0,
  //             "best_of": 1,
  //             "top_k": 10,
  //             "stream": true
  //         }),
  //         signal
  //     });

  //     if (!response.ok) {
  //         messagesHistory = tempMessagesHistory;
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder("utf-8");

  //     while (true) {
  //         const { done, value } = await reader.read();
  //         const chunk = decoder.decode(value, { stream: true });
  //         superAgiProcessStreamedResponse(chunk);

  //         if (done) {
  //             if (assistantResponse) {
  //                 updatemessagesHistory("assistant", assistantResponse);
  //             }

  //             if (!isFinished) {
  //                 continueGenerate();
  //                 return;
  //             }

  //             // Handle continueSeparator.value as needed

  //             addMessageToHistory(messagesHistory);

  //             continueBtn.disabled = false;
  //             break;
  //         }
  //     }
  // }

  // function superAgiProcessStreamedResponse(chunk) {
  //     const lines = chunk.split("\n");

  //     lines.forEach((line) => {
  //         if (line.startsWith("data: ")) {
  //             const jsonData = line.substring(6);
  //             if (jsonData.trim() !== "[DONE]") {
  //               try {
  //                 const data = JSON.parse(jsonData);
  //                 const choices = data.choices;

  //                 if (choices && choices.length > 0) {
  //                     const messageChunk = choices[0].text;
  //                     if (messageChunk) {
  //                         // 仅移除开头的 "assistant: "
  //                         // 移除文本中的 "assistant: "

  //                         assistantResponse += messageChunk;
  //                         fullContent += messageChunk;
  //                         fullContent = fullContent.replace("assistant: ", "");
  //                         editor.setMarkdown(fullContent); // 实时更新编辑器内容
  //                         scrollToBottomEditorMd();
  //                     }

  //                     const finishReason = choices[0].finish_reason;
  //                     if (finishReason !== "stop") {
  //                         isFinished = false;
  //                     } else {
  //                         isFinished = true;
  //                     }
  //                   }
  //                 } catch (jsonError) {
  //                     messagesHistory = tempMessagesHistory;
  //                     console.error("JSON parsing error:", jsonError);
  //                     showAlert("JSON parsing error:", 'danger', 3000);
  //                 }
  //             }
  //         }
  //     });
  // }






  const fetchSuperAGI = async () => {
    assistantResponse = "";

    const superagiHistory = messagesHistory.map(message => {
      return {
        role: message.role,
        content: message.content
      };
    });

    const streamURL = '/superagi/';
    console.log(SET_MAX_TOKENS, RANDOMNESS)
    const requestData = {
      "system_prompt": "你现在是一个智能小助手",
      "messages": superagiHistory,
      "max_tokens": SET_MAX_TOKENS,
      "temperature": RANDOMNESS,
      "top_p": 0.1,
      "repetition_penalty": 0,
      "best_of": 1,
      "top_k": 10,
      "stream": true
    };


    try {
      const response = await fetch(streamURL, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const messageChunk = new TextDecoder().decode(value);
        // console.log(text);
        assistantResponse += messageChunk;
        fullContent += messageChunk;
        editor.setMarkdown(fullContent); // 实时更新编辑器内容
        scrollToBottomEditorMd();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };











  // 重置UI状态
  function resetUiState() {
    // generateBtn.disabled = false;
    continueBtn.disabled = false;
    stopBtn.disabled = true;
    controller = null; // 重置 AbortController 实例
  }


  /**
   * 中断fetch请求。
   *
   * @param {type} paramName - 参数的描述
   * @return {type} 返回值的描述
   */
  const stop = () => {
    // Abort the fetch request by calling abort() on the AbortController instance
    if (controller) {
      messagesHistory = tempMessagesHistory;
      controller.abort();
      controller = null;
    }
  };


  // 计算提交的字符的tokens数
  async function countTokens(text, model) {
    try {
      const response = await fetch('count_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, model })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("真实的tokens", data.tokens);
      return data.tokens;
    } catch (error) {
      console.error('Error while counting tokens:', error);
    }
  }



  // 前端估算tokens
  function estimateTokenCount(str) {
    const words = str.split(/\s+/);
    const nonEnglishCharacters = str.match(/[\u3400-\u9FBF]/g) || [];
    return words.length + nonEnglishCharacters.length;
  }


  // 截取提交给接口的长度
  async function truncateMessagesHistory_2(messagesHistory, maxTokens, maxMessages, model) {
    // if (messagesHistory.length > maxMessages) {
    //     messagesHistory = messagesHistory.slice(-maxMessages);
    // }

    console.log("messagesHistory9988", messagesHistory)

    let currentTokenCount = 0;
    let truncatedHistory = messagesHistory;
    let needsAccurateCount = false;

    for (let i = messagesHistory.length - 1; i >= 0; i--) {
      let message = messagesHistory[i];
      let tokenCount = estimateTokenCount(message.content);

      console.log("普通计算的", tokenCount);

      // if (currentTokenCount + tokenCount > maxTokens) {
      //     needsAccurateCount = true;
      //     break;
      // }

      // truncatedHistory.unshift(message);
      currentTokenCount += tokenCount;
    }

    console.log("needsAccurateCount", needsAccurateCount);

    if (true) {
      console.log("0987678987678")
      // if(!truncatedHistory.length){
      //   showAlert("字数超出了限制，删减一些再提交吧.", 'warning', 3000);
      //   throw error; // 错误处理
      // }
      // 获取更精确的 token 数量
      let accurateTokenCount = 0;
      console.log("truncatedHistory.length", truncatedHistory.length);
      for (let i = 0; i < truncatedHistory.length; i++) {
        let message = truncatedHistory[i];
        let tokenCount = await countTokens(message.content, model);

        console.log("精确计算的currentTokenCount", currentTokenCount);
        console.log("精确计算的tokenCount", tokenCount);

        if (accurateTokenCount + tokenCount <= maxTokens) {
          accurateTokenCount += tokenCount;
        } else {
          // 精确截断
          let remainingTokens = maxTokens - accurateTokenCount;

          let truncatedContent = await truncateContentToTokensAccurately(message.content, remainingTokens, model);
          console.log("truncatedContent", truncatedContent);
          message.content = truncatedContent;
          break;
        }
      }

      return truncatedHistory;
    }

    return truncatedHistory;
  }


  async function truncateMessagesHistory(messagesHistory, maxTokens, maxMessages, model) {
    let totalTokens = 0;
    let trimmedMessages = [];

    // 其它非openai接口使用openai接口计算tokenss
    if (model == 'gemini-pro' || model == 'gemini-pro-vision' || model == 'glm-3-turbo' || model == 'glm-4' || model == 'generalv2' || model == 'cogview') {
      model = 'gpt-3.5-turbo';
    } else {
      // 可以修改
      model = 'gpt-3.5-turbo';
    }

    console.log("begin messagesHistory", messagesHistory)

    for (let i = messagesHistory.length - 1; i >= 0; i--) {
      const message = messagesHistory[i];
      const content = message.content;

      // 计算真实的 tokens
      let tokensCount = await countTokens(message.content, model);

      console.log("计算tokensCount", tokensCount)

      // 实时判断 tokens 数是否符合限制
      if (tokensCount <= totalTokens + maxTokens) {
        // 如果裁剪完全，且最后一条消息的内容为空，则移除最后一条消息
        if (totalTokens + tokensCount === totalTokens + maxTokens) {
          if (trimmedMessages.length > 0) {
            const lastMessage = trimmedMessages[0];
            if (lastMessage.content.trim() === "") {
              trimmedMessages.shift();
            }
          }
        }

        // 如果消息内容不为空，则加入到结果数组中
        if (content.trim() !== "") {
          trimmedMessages.unshift({ ...message }); // 将消息添加到数组的开头
          totalTokens += tokensCount;
        }
      } else if (tokensCount > totalTokens + maxTokens) {
        // 超过限制时，计算剩余 tokens 数，进行裁剪
        const remainingTokens = maxTokens - totalTokens;
        const trimmedContent = content.slice(0, remainingTokens);

        // 如果裁剪后的内容不为空，则加入到结果数组中
        if (trimmedContent.trim() !== "") {
          trimmedMessages.unshift({ ...message, content: trimmedContent });
        }

        break; // 达到限制后停止迭代
      }
    }

    // 如果结果数组的长度超过最大消息数量限制，从开头裁剪多余的消息
    while (trimmedMessages.length > maxMessages) {
      trimmedMessages.shift();
    }

    return trimmedMessages;
  }

  // const messages = [
  //   {
  //       "role": "user",
  //       "content": "你现在的角色定义为回答各种问题，提供准确、详尽的信息。回答应简明扼要，直接针对问"
  //   },
  //   {
  //       "role": "user",
  //       "content": "你好"
  //   },
  //   {
  //       "role": "assistant",
  //       "content": "你好！有什么我可以帮助你的吗？"
  //   }
  // ];

  // const limit = 15;
  // const maxMessages = 2;
  // const trimmedMessages = trimContent(messages, limit, maxMessages);
  // console.log(trimmedMessages);


  // async function truncateMessagesHistory(messagesHistory, maxTokens, maxMessages, model) {
  //   if (messagesHistory.length > maxMessages) {
  //       messagesHistory = messagesHistory.slice(-maxMessages);
  //   }

  //   let currentTokenCount = 0;
  //   let truncatedHistory = [];

  //   for (let i = messagesHistory.length - 1; i >= 0; i--) {
  //       let message = messagesHistory[i];
  //       let tokenCount = estimateTokenCount(message.content);

  //       if (currentTokenCount + tokenCount > maxTokens) {
  //           let remainingTokens = maxTokens - currentTokenCount;
  //           let truncatedContent = await truncateContentToTokensAccurately(message.content, remainingTokens, model);
  //           message.content = truncatedContent;
  //           truncatedHistory.unshift(message);
  //           break;
  //       }

  //       truncatedHistory.unshift(message);
  //       currentTokenCount += tokenCount;
  //   }

  //   return truncatedHistory;
  // }



  async function truncateContentToTokensAccurately(content, tokenLimit, model) {
    let left = 0;
    let right = content.length;

    while (left < right) {
      let mid = left + Math.floor((right - left) / 2);
      let partialContent = content.substring(0, mid);
      let tokenCount = await countTokens(partialContent, model);

      if (tokenCount > tokenLimit) {
        right = mid;
      } else if (tokenCount < tokenLimit) {
        left = mid + 1;
      } else {
        return partialContent;
      }
    }

    // 添加非空判断
    if (left > 0) {
      return content.substring(0, left);
    } else {
      return content; // 如果记录为空，返回原始内容
    }
  }





  // // 示例：使用函数并设置最大长度
  // let messagesHistory = [
  //     // ...（你的消息历史记录）
  // ];
  // let maxLength = 1000; // 根据你的模型限制设置这个值
  // let truncatedHistory = truncateMessagesHistory(messagesHistory, maxLength);

  // console.log(truncatedHistory);











  /*
  *功能函数开始
  *
  */
  // 获取url内容 URL网页爬虫
  var originalText = '';
  const getUrlContent = async (url) => {
    const options = {
      method: 'GET'
    };

    editorText.value = '';


    getUrlContentBtn.disabled = true;


    try {
      const response = await fetch(`/getPageContent?url=${encodeURIComponent(url)}`, options);
      const data = await response.json();
      const { body } = data;
      editorText.value = body;
      originalText = editorText.value;
      isFirstUrlText = true;  // 是否是第一次获取文本内容
      console.log(body);
      updateCharCount();

      return body;  // 返回网页内容

    } catch (err) {
      console.error(err);
      showAlert(err, 'danger', 3000);
    } finally {
      getUrlContentBtn.disabled = false;
    }
  };

  // 监听按键/快捷键
  // promptInput.addEventListener("keydown", (event) => {
  //   if (event.key === "Enter" && event.metaKey) {
  //     continueGenerate();
  //   }
  //   if (event.key === "Enter" && event.altKey) {
  //     generate();
  //   }
  // });

  // 全页面设置快捷键，而不仅仅是promptInput输入框
  document.addEventListener("keydown", function (event) {
    // 检测是否按下 Command (对于 Mac) 或 Ctrl (对于非 Mac) + Enter
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      // 调用你想要执行的函数
      continueGenerate();
    }
  });


  // 获取模型对应的tokens对应关系
  function getTokenCountForModel(modelName) {
    const tokenCount = modelTokensMapping[modelName];
    if (tokenCount === undefined) {
      return "Error: Model name not found in the mapping.";
    }
    return tokenCount;
  }


  // 字符统计
  // const charCount = document.getElementById("charCount");

  // 更新字数统计
  function updateCharCount() {
    let totalLength = 0;

    // 计算 editorText 中的字符长度
    // for (let i = 0; i < editorText.value.length; i++) {
    //   const char = editorText.value.charCodeAt(i);
    //   totalLength += (char <= 0x007f) ? 1 : 1; // 英文字符计1，中文字符计3
    // }

    console.log("editorText.value", editorText.value);

    totalLength = estimateTokenCount(editorText.value + promptInput.value);

    // 计算 promptInput 中的字符长度
    // for (let i = 0; i < promptInput.value.length; i++) {
    //   const char = promptInput.value.charCodeAt(i);
    //   totalLength += (char <= 0x007f) ? 1 : 1; // 英文字符计1，中文字符计3
    // }


    // 四舍五入总长度为整数
    totalLength = Math.round(totalLength);

    // SET_MAX_TOKENS = $('#inputValue2').val();


    console.log("SET_MAX_TOKENS totalLength", SET_MAX_TOKENS, totalLength);

    // 设置最大的字符
    // $('#maxCharCount').html(SET_MAX_TOKENS);

    if (totalLength > 30000) {
      $('#charCount').html(totalLength);
      $('#maxCharCount').html(`<span style='color:red'>&nbsp;&nbsp;已超过最大字符</span>`);
      // charCount.innerHTML = totalLength + `/${SET_MAX_TOKENS} <span style='color:red'>已超过最大字符</span>`;
    } else {
      // charCount.textContent = totalLength + `/${SET_MAX_TOKENS}`;
      $('#charCount').html(`剩余：${SET_MAX_TOKENS - totalLength}`);
    }


  }


  // 为 editorText 和 promptInput 添加 input 事件监听器
  editorText.addEventListener("input", updateCharCount);
  promptInput.addEventListener("input", updateCharCount);


  // generateBtn.addEventListener("click", generate);
  continueBtn.addEventListener("click", continueGenerate);
  stopBtn.addEventListener("click", stop);
  getUrlContentBtn.addEventListener("click", function () {
    let url = $('#urlInput').val();

    console.log("urlInput.value", url)
    getUrlContent(url)
  });


  // 清空上下文
  const clearHistory = async () => {
    messagesHistory = []; // 清空数组
    // fullContent = '';

    isRoleFist = true; // 重置标志位
    isNewImg = true;

    // generateBtn.disabled = false;
    // localStorage.setItem('historyData', JSON.stringify({}));
    // 更新数据库中的历史记录
    db.conversationHistory.put({ sessionId: currentConversationIndex, messagesHistory: JSON.stringify([]) });
    // editor.setMarkdown(''); 

    // let _historyDatas = $('#function-selete').val();
    // if (_historyDatas != 'url') {
    //   $('#editorText').val('');
    //   $('#urlInput').val('');
    // }

    console.log("上下文消息已清空");
    showAlert("上下文消息已清空", 'success', 3000);
  };

  // 清空上下文的按钮触发事件
  // clearHistoryBtn.addEventListener("click", clearHistory);

  // 清空编辑器内容
  const clearEditor = async () => {
    fullContent = '';
    editor.setMarkdown('');
    console.log("编辑内容已清空");
    showAlert("编辑内容已清空", 'success', 3000);
  }

  // 清空编辑器内容事件
  $('#clear-md').on('click', clearEditor);





  // 文本拼接方式
  const outputSeparatoSeleted = () => {
    if (continueSeparator.value == "break") {
      fullContent += '\n';
    } else if (continueSeparator.value == "dash") {
      fullContent += '\n\n------------\n\n';
    } else if (continueSeparator.value == "dialog") {
      fullContent += `\n\`\`\`User\n<span style="color:red;font-size: 16px;font-weight: bold;"><i class="bi bi-emoji-kiss"></i> 我</span> \n${promptInput.value}\n\`\`\``;
      fullContent += `\n\n\`\`\`Assistant\n<span style="color:red;font-size: 16px;font-weight: bold;"><i class="bi bi-android"></i> 小助手</span> \n`;
    } else {
      // 默认拼接
    }
  }


  function isTextChanged() {
    var currentText = $("#editorText").val();
    // console.log("currentText",currentText);
    // console.log("originalText",originalText);
    return originalText !== currentText;
  }

  // 监听url源文本框内容变化
  $("#editorText").on("input", function () {
    if (isTextChanged()) {
      console.log("文本内容已更改");
      isFirstUrlText = true;
      // 返回true或执行其他操作
    } else {
      console.log("文本内容未更改");
      isFirstUrlText = false;
      // 返回false或执行其他操作
    }
  });

  // 监听角色输入框内容变化
  function isValueChanged() {
    var RANDOMNESS = $("#roleInput").val();
    return originalValue !== RANDOMNESS;
  }
  $("#roleInput").on("input", function () {
    if (isValueChanged()) {
      console.log("角色输入框内容已更改");
      isRoleFist = true; // 重置标志位
      // 返回true或执行其他操作
    } else {
      console.log("角色输入框内容未更改");
      isRoleFist = false; // 重置标志位
      // 返回false或执行其他操作
    }
  });



  // 模板选择
  const modeSeleted = async () => {
    // 提示消息
    TEMPLATE_MSG = promptInput.value;

    // 扩展功能开关
    const extended = getSwitchValues();

    // 如果打开了url的开关，则检查是否有URL可爬取
    if (extended.reptileSelected) {
      console.log("URL爬虫开始");

      // 提取URL列表
      const urls = extractUrls(TEMPLATE_MSG);

      // 爬虫内容框
      const urlEditorText = $('#editorText').val();

      // 只有在识别到URL时才执行爬取程序
      if (urls.length > 0) {
        for (let url of urls) {
          const content = await getUrlContent(url);
          TEMPLATE_MSG += `\n【${url}页面内容为：\n${content}】`;
        }
      } else if (urlEditorText) {
        console.log("识别到爬虫框有内容");
        TEMPLATE_MSG += `\n【页面内容为：\n${urlEditorText}】`;
      } else {
        console.log("未识别到有效的URL，跳过爬取程序");
      }
    }

    // 如果打开了图片识别的开关
    if (extended.imgAnalysis) {
      // 判断模型是不是选择的gemini-pro-version
      if (MODEL != "gemini-pro-vision") {
        showAlert("图形识别目前仅支持Gemini Pro Vesion版本的模型", "warning", 3000);
        throw new Error("Unsupported Model"); // 抛出异常
      }
    }

    // 检查是否选择了本地向量文档
    if (selectedFiles.length > 0) {
      let userDoc = await fetchSearchPath(TEMPLATE_MSG, vectorModelName, 6, vectorSearchMode, selectedFiles);
      TEMPLATE_MSG = `【参考文档检索片段，回答我的问题：{${TEMPLATE_MSG}}。检索片段只是参考的一部分，如果检索片段找不到我问题的结果，请忽略检索片段参考的内容直接回答我的问题。】\n如下为文档检索参考片段：{${userDoc}}\n。`;
    }


    console.log("URL爬虫结束");

    // 显示最终组合的消息
    if (extended.reptileSelected) {
      console.log("开始处理");
      // editorText.value = TEMPLATE_MSG;
    }
  };

  // 识别提示语句中的url
  function extractUrls(text) {
    var urlRegex = /https?:\/\/[^\s]+?(?=[\s\u4e00-\u9fa5]|$)/g;
    var matches = text.match(urlRegex);
    return matches || [];
  }



  // 监听模板选择为url
  $("#function-selete").change(function () {
    var selectedValue = $(this).val();

    if (selectedValue === "url") {
      $('#editorContainer').removeClass('d-none');
      // $('#generateBtn').removeClass('d-none');
    } else {
      $('#editorContainer').addClass('d-none');
      // $('#generateBtn').addClass('d-none');
    }
  });





  // 其它事件
  // 点击 "mindmap-editor" 思维导图编辑按钮，跳转到编辑页面
  // 在DOM加载完成后获取动态插入的元素

  // 添加点击事件监听器
  $('body').on('click', '.mindmap-editor', function () {
    const mindmapId = $(this).data('mindmap-id');
    const contentBuffer = $(this).data('mindmap-content');
    const iframeElement = document.getElementById(mindmapId);

    if (iframeElement) {
      iframeElement.contentWindow.postMessage({ type: 'importMarkdown', data: contentBuffer }, '*');
      window.open('/mindmap.html');
    } else {
      console.error("Error: Invalid iframe ID.");
    }
  });



  // 展开和收起图标
  $('#sidebarToggle').click(function () {
    $('#sidebar').toggle();
    // $('#contentArea').toggleClass('col-md-8 col-lg-9');
    // $('.left-content').toggleClass('col-md-3 col-lg-2');
    // $('#resultText').toggleClass('col-md-8 col-lg-12');
    // $('.editormd').toggleClass('col-md-8 col-lg-9');

    $('#toggleIcon').toggleClass('bi-chevron-compact-left bi-chevron-compact-right');

    // 重新设置编辑器容器的宽度
    var newWidth = $('#contentArea').width();
    $('#editor').css('width', newWidth + 'px');
    editor.resize(); // 如果 editor.md 支持 resize 方法
  });



  // 提示弹框
  function showAlert(message, alertType = 'warning', duration = 3000) {
    // 创建 alert div
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${alertType} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '10px';
    alertDiv.style.right = '10px';
    alertDiv.style.zIndex = '9999';

    // 设置消息文本
    alertDiv.textContent = message;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.setAttribute('type', 'button');
    closeButton.className = 'close';
    closeButton.setAttribute('data-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');

    const closeSpan = document.createElement('span');
    closeSpan.setAttribute('aria-hidden', 'true');
    closeSpan.innerHTML = '&times;';

    closeButton.appendChild(closeSpan);
    alertDiv.appendChild(closeButton);

    // 添加到 body
    document.body.appendChild(alertDiv);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        $(alertDiv).alert('close');
      }, duration);
    }

    // 手动关闭
    closeButton.onclick = function () {
      $(alertDiv).alert('close');
    };
  }











  // 设置模型信息
  // 页面加载时，从localStorage读取配置
  // var savedConfig = localStorage.getItem("modelConfig");
  // var historyDatas = localStorage.getItem("historyData");

  // 初始化配置
  function initLoadConfig() {
    $.getJSON('/config/config.json', async function (data) {
      // 更新表单选项
      await updateFormOptions(data);

      // 设置表单的默认值
      var defaultInterfaceType = Object.keys(data)[0]; // 获取第一个接口类型作为默认值
      var defaultInterface = data[defaultInterfaceType];

      $('#interface-type').val(defaultInterfaceType).trigger('change');
      $('#interface-url').val(defaultInterface.interfaceUrl);
      $('#ai-model-type').val(defaultInterface.modelType[0]); // 假设每个接口至少有一个模型类型
      $('#token').val(""); // Token 默认为空

      $('.ai-model-view').text('未设置模型');

      // 更新其他配置
      API_URL = defaultInterface.interfaceUrl;
      MODEL = defaultInterface.modelType[0];
      MY_TOKEN = "";
      MAX_TOKENS = defaultInterface.maxTokens || 1024; // 如果没有指定，默认为 1024


      // 更新页面显示
      updatePageDisplay({
        interfaceType: defaultInterfaceType,
        interfaceUrl: defaultInterface.interfaceUrl,
        aiModelType: defaultInterface.modelType[0],
        token: "",
        maxTokens: MAX_TOKENS
      });
    });

  }


  // 更新表单选项
  async function updateFormOptions(configData) {
    // 清空接口类型选项并重新填充
    $('#interface-type').empty();
    for (let key in configData) {
      $('#interface-type').append(new Option(configData[key].name, key));
    }

    // 当接口类型改变时，更新模型类型选项
    $('#interface-type').change(function () {
      var selectedInterface = $('#interface-type').val();
      $('#ai-model-type').empty();
      configData[selectedInterface].modelType.forEach(function (model) {
        $('#ai-model-type').append(new Option(model, model));
      });

      // 更新接口地址
      $('#interface-url').val(configData[selectedInterface].interfaceUrl);
    });
  }

  // 页面显示设置
  function updatePageDisplay(config) {
    // 根据配置显示或隐藏相应的元素
    if (config.接口类型.value == "openai" || config.接口类型.value == "pandora" || config.接口类型.value == "gemini") {
      $('.openai-model').removeClass('d-none');
    } else {
      $('.interface-url-input').removeClass('d-none');
    }

    if (config.模型名称.value == 'gemini-pro-vision') {
      $('.gemini-file').removeClass('d-none');
    }



    // 获取模型对应的最大tokens
    MAX_TOKENS = getTokenCountForModel(MODEL);
    // 设置显示的UI里的值
    $('#formControlRange2').attr('max', MAX_TOKENS).val(MAX_TOKENS);
    $('#inputValue2').attr('max', MAX_TOKENS).val(MAX_TOKENS);

    console.log("SET_MAX_TOKENS", SET_MAX_TOKENS)

    // 初始设置最大的字符
    SET_MAX_TOKENS = MAX_TOKENS;

    // 初始化字数统计
    updateCharCount();


    // 设置初始的最大的字符
    // $('#maxCharCount').html(SET_MAX_TOKENS);

    console.log("MAX_TOKENS", MAX_TOKENS)

  }

  // 设置随便聊聊始终置顶
  function customizeConversationList() {
    // 找到“随便聊聊”元素
    let randomChat = $("#conversationsList").find("[data-id='1']");

    // 创建包含“我的会话”的分隔行
    let mySessionRow = $('<div class="row mb-3 mt-3"><div class="col" style="color: #a6a6a6;font-weight: bold;font-size: 14px;">我的会话</div></div>');

    // 将“随便聊聊”移到列表的第一位
    $("#conversationsList").prepend(randomChat);

    // 在第二位插入分隔行
    randomChat.after(mySessionRow);

    // 删除编辑和删除按钮
    randomChat.find(".float-right").empty();
  }






  // 角色读取和角色选择
  var roles = []; // 全局变量来存储角色数据

  function loadRoles() {
    $.getJSON('/config/roles.json', function (data) {
      roles = data.roles; // 存储角色数据到全局变量
      updateRoleSelect(roles);
    });
  }

  function updateRoleSelect(roles) {
    const roleSelect = $('#role-select');
    roleSelect.empty(); // 清空现有选项

    roles.forEach(role => {
      roleSelect.append(new Option(role.name, role.id));
    });

    // 默认选中第一个角色并更新角色规则输入框
    updateRoleInput(roles[0].rules);

    // loadFormData();
  }

  $('#role-select').change(function () {
    const selectedRoleId = $(this).val();
    const selectedRole = roles.find(role => role.id == selectedRoleId);
    updateRoleInput(selectedRole.rules);
  });

  function updateRoleInput(rules) {
    $('#roleInput').val(rules);
    console.log("角色标志位重置")
    isRoleFist = true; // 重置标志位
  }

  $(document).ready(function () {
    loadRoles();
  });







  // 保存配置
  $('#save-button').click(async function () {
    var interfaceValue = $("#interface-type").val();
    if (interfaceValue === "pandora") {
      API_URL = $('#interface-url').val();
      MODEL = $('#ai-model-type').val();
    } else if (interfaceValue === "openai") {
      API_URL = $('#interface-url').val();
      MODEL = $('#ai-model-type').val();
    } else if (interfaceValue === "custom") {
      API_URL = $('#interface-url').val();
    } else if (interfaceValue === "gemini") {
      API_URL = $('#interface-url').val();
      MODEL = $('#ai-model-type').val();
    }

    MY_TOKEN = $('#token').val();

    MODEL = $("#ai-model-type").val();

    // 设置默认页面显示
    $('.gemini-file').addClass('d-none');

    // if (MODEL === "gpt-3.5-turbo-1106" || MODEL === "gpt-3.5-turbo-16k") {
    //   MAX_TOKENS = 16385;
    // } else if (MODEL === "gpt-3.5-turbo" || MODEL === "gpt-3.5-turbo-instruct") {
    //   MAX_TOKENS = 4096;
    // } else if (MODEL === "gpt-4-1106-preview") {
    //   MAX_TOKENS = 128000;
    // } else if (MODEL === "gemini-pro-vision") {
    //   MAX_TOKENS = 4096;
    //   $('.gemini-file').removeClass('d-none');
    // }

    // 获取模型对应的最大tokens
    MAX_TOKENS = getTokenCountForModel(MODEL);

    // 重新设置最大的tokens
    SET_MAX_TOKENS = MAX_TOKENS;
    // 重新设置显示的UI里的值
    $('#formControlRange2').attr('max', MAX_TOKENS).val(SET_MAX_TOKENS);
    $('#inputValue2').attr('max', MAX_TOKENS).val(SET_MAX_TOKENS);

    // 更新字数统计
    console.log("配置保存MAX_TOKENS", MODEL, MAX_TOKENS)
    updateCharCount();


    // localStorage.setItem("modelConfig", JSON.stringify(config));


    var config = {
      interfaceType: interfaceValue,
      interfaceUrl: API_URL,
      aiModelType: MODEL,
      token: MY_TOKEN,
      maxTokens: MAX_TOKENS
    };

    // 将配置信息对象转换为 JSON 字符串
    var savedConfig = JSON.stringify(config);

    // 保存配置信息到数据库
    try {
      await saveConfig(currentConversationIndex, savedConfig);
      $('#configModal').modal('hide');
      showAlert("配置保存成功", 'success', 3000);

      // 更新UI
      $('.ai-model-view').text(MODEL);

    } catch (error) {
      console.error("保存配置到数据库时出错: ", error);
      showAlert("配置保存失败", 'danger', 3000);
    }


  });


  // 监听模型选择
  $("#interface-type").change(function () {
    var interfaceValue = $(this).val();

    if (interfaceValue === "pandora") {
      $('.interface-url-input').removeClass('d-none');
      $('.openai-model').removeClass('d-none');
    } else if (interfaceValue === "openai") {
      $('.interface-url-input').removeClass('d-none');
      $('.openai-model').removeClass('d-none');
    } else if (interfaceValue === "custom") {
      $('.interface-url-input').removeClass('d-none');
      $('.openai-model').addClass('d-none');
    } else if (interfaceValue == 'gemini') {
      $('.interface-url-input').removeClass('d-none');
      $('.openai-model').removeClass('d-none');
    }
  });

  // // 监听openai模型选择
  // $("#ai-model-type").change(function() {
  //   MODEL = $(this).val();
  //   console.log(MODEL);
  // })





  // 用户填写的表单信息自动加载和保存
  // 页面加载时从localStorage加载数据
  // loadFormData();



  // async function saveFormData() {
  //   var formData = {
  //     functionSelect: $('#function-selete').val(),
  //     editorText: $('#editorText').val(),
  //     urlInput: $('#urlInput').val(),
  //     roleSelect: $('#role-select').val(),
  //     roleInput: $('#roleInput').val(),
  //     continueSeparator: $('#continueSeparator').val(),
  //     outputSeparator: $('#outputSeparator').val(),
  //     promptInput: $('#promptInput').val()
  //   };

  //   fullContent = editor.getValue(); // 假设您有一个编辑器对象
  //   messagesHistory = getCurrentMessagesHistory(); // 假设您有一个函数来获取当前的消息历史

  //   // 保存到数据库
  //   try {
  //     await saveSessionContent(currentConversationIndex, fullContent);
  //     await saveConfig(currentConversationIndex, JSON.stringify(formData));
  //     await saveConversationHistory(currentConversationIndex, JSON.stringify(messagesHistory));
  //   } catch (error) {
  //     console.error("保存表单数据到数据库时出错: ", error);
  //   }
  // }


  // function loadFormData() {
  //   var savedData = localStorage.getItem('historyData');
  //   if (savedData) {
  //     var formData = JSON.parse(savedData);
  //     $('#function-selete').val(formData.functionSelect);
  //     $('#editorText').val(formData.editorText);
  //     $('#urlInput').val(formData.urlInput);
  //     $('#role-select').val(formData.roleSelect);
  //     $('#roleInput').val(formData.roleInput);
  //     $('#continueSeparator').val(formData.continueSeparator);
  //     $('#outputSeparator').val(formData.outputSeparator);
  //     $('#promptInput').val(formData.promptInput);
  //     fullContent = formData.fullContent;
  //     // editor.setMarkdown(fullContent); // 实时更新编辑器内容
  //     messagesHistory = formData.messagesHistory;

  //   }
  // }











  // 下载md内容事件
  $('#download-md').on('click', function () {
    var content = editor.getMarkdown();
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'output.md');
    return false;
  })







  // 处理gemini上传图片的事件
  $('#inputFile').on('change', function () {
    var input = this;
    var file = input.files[0];

    if (file) {
      // 使用FileReader读取文件
      var reader = new FileReader();

      reader.onload = function (e) {
        // 将预览图像的src设置为读取到的数据URL
        $('#previewImage').attr('src', e.target.result).show();
        IMAGEBASE64 = e.target.result;

        isNewImg = true; // 重置标志位
      };

      // 读取文件数据
      reader.readAsDataURL(file);


    }
  });



  // 历史消息
  // 更新历史记录的数组变量
  async function updatemessagesHistory(_role, _content) {
    messagesHistory.push({ role: _role, content: _content });
  }

  // 添加消息到历史记录数据库
  async function addMessageToHistory(_messagesHistory) {
    // trimMessagesHistory();
    // messagesHistory.push({ role: _role, content: _content });

    console.log("更新当前会话的历史记录", currentConversationIndex)
    try {
      // 更新数据库中的历史记录
      await db.conversationHistory.put({
        sessionId: currentConversationIndex,
        messagesHistory: JSON.stringify(_messagesHistory)
      });
    } catch (error) {
      console.error("更新历史记录到数据库时出错: ", error);
    }
  }

  // 显示历史记录
  async function displayMessagesHistory() {
    const historyContainer = $('#historyContainer');
    historyContainer.empty();

    try {
      // 从数据库获取当前会话的历史记录
      const conversationHistory = await db.conversationHistory.get(currentConversationIndex);

      // 如果找到历史记录，则解析并显示
      if (conversationHistory && conversationHistory.messagesHistory) {
        messagesHistory = JSON.parse(conversationHistory.messagesHistory);

        messagesHistory.forEach((message, index) => {
          historyContainer.append(`
              <div class="card mb-3">
                  <div class="card-body">
                      <h4 class="card-title">@${message.role}</h4>
                      <p class="card-text"><pre>${message.content}</pre></p>
                      <div class="d-flex justify-content-end">
                          <button class="btn btn-sm btn-primary mx-1 edit-btn" data-index="${index}">编辑</button>
                          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">删除</button>
                      </div>
                  </div>
              </div>
          `);
        });
      }
    } catch (error) {
      console.error("显示历史记录时出错: ", error);
    }

    updateHistoryCount();
  }



  // 编辑记录
  function editRecord(index) {
    const record = messagesHistory[index];
    $('#editInput').val(record.content);
    $('#editModal').modal('show');
    $('#saveEdit').off('click').on('click', async () => {
      record.content = $('#editInput').val();
      $('#editModal').modal('hide');
      await displayMessagesHistory(); // 更新显示

      // // 可选：更新 localStorage
      // localStorage.setItem('historyData', JSON.stringify(messagesHistory));
      // 更新数据库中的历史记录
      await db.conversationHistory.put({ sessionId: currentConversationIndex, messagesHistory: JSON.stringify(messagesHistory) });
    });
  }

  // 删除记录
  async function deleteRecord(index) {
    if (confirm('确定要删除这条记录吗？')) {
      messagesHistory.splice(index, 1);
      try {
        // 等待数据库中的历史记录更新完成
        await db.conversationHistory.put({
          sessionId: currentConversationIndex,
          messagesHistory: JSON.stringify(messagesHistory)
        });

        displayMessagesHistory(); // 更新显示

      } catch (error) {
        console.error("更新数据库时出错: ", error);
      }
    }
  }


  $('#historyContainer').on('click', '.edit-btn', function () {
    const index = $(this).data('index');
    editRecord(index);
  });

  $('#historyContainer').on('click', '.delete-btn', function () {
    const index = $(this).data('index');
    deleteRecord(index);
  });



  function openOffcanvas() {
    document.getElementById('myOffcanvas').style.right = "0";
  }

  function closeOffcanvas() {
    document.getElementById('myOffcanvas').style.right = "-100%";
  }


  // 打开侧边栏
  $('#open-off-canvas').on('click', function () {
    openOffcanvas();
    displayMessagesHistory(); // 更新历史记录显示
  })

  // 关闭侧边栏
  $('#close-off-canvas').on('click', function () {
    closeOffcanvas();
  })


  // 下载历史记录功能
  function downloadHistory() {
    const historyData = JSON.stringify(messagesHistory);
    const blob = new Blob([historyData], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'messages_history.json'; // 或者 "messages_history.csv"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 绑定下载按钮的点击事件
  $('#download-history').on('click', function () {
    downloadHistory();
  });

  // 上传历史记录功能
  function uploadHistory(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = JSON.parse(e.target.result);

        messagesHistory.length = 0; // 清空现有历史记录
        Array.prototype.push.apply(messagesHistory, data); // 添加新数据

        displayMessagesHistory(); // 更新显示
        // localStorage.setItem('historyData', JSON.stringify(messagesHistory)); // 更新 localStorage

        // 更新数据库中的历史记录
        db.conversationHistory.put({ sessionId: currentConversationIndex, messagesHistory: JSON.stringify(messagesHistory) });

        // 重置文件输入
        $('#upload-history').val('');
      };
      reader.readAsText(file);
    }
  }

  // 绑定上传文件的改变事件
  $('#upload-history').on('change', function (event) {
    uploadHistory(event);
  });



  // 清空历史记录事件
  $('#clear-history,#clear-history-tool').on('click', function () {
    clearHistory();
    displayMessagesHistory(); // 更新历史记录显示

    // 更新数据库中的历史记录
    db.conversationHistory.put({ sessionId: currentConversationIndex, messagesHistory: JSON.stringify([]) });
  });

  // 统计历史记录条数并更新显示
  function updateHistoryCount() {
    const historyCount = messagesHistory.length;
    $('.history-num').text(historyCount); // 更新显示历史记录条数
  }









  // 数据库操作
  // 数据库操作的封装
  // 添加会话的函数
  async function addSession(sessionName, gptConfigID) {
    return db.sessions.add({ name: sessionName,gptConfigID: gptConfigID })
      .then((id) => {
        console.log("会话添加成功，ID: " + id);
        return id;  // 返回新会话的 ID
      })
      .catch((error) => {
        console.error("添加会话时出错: ", error);
        throw error;  // 向外部传递错误
      });
  }

  // 保存会话内容的函数
  async function saveSessionContent(sessionId, fullContent) {
    try {
      await db.sessionContents.put({ sessionId, fullContent });
      console.log("会话内容保存成功");
    } catch (error) {
      console.error("保存会话内容时出错: ", error);
      throw error;
    }
  }


  // 保存模型接口配置信息函数
  async function saveConfig(sessionId, savedConfig) {
    try {
      await db.config.put({ sessionId, savedConfig });
      console.log("配置信息保存成功");
    } catch (error) {
      console.error("保存配置信息时出错: ", error);
      throw error;
    }
  }

  // 保存会话配置信息
  async function saveConverseConfig(sessionId, converseConfig) {
    try {
      await db.converseConfig.put({ sessionId, converseConfig });
      console.log("会话配置信息保存成功");
    }
    catch (error) {
      console.error("保存会话配置信息时出错: ", error);
      throw error;
    }
  }


  // 保存会话历史记录
  async function saveConversationHistory(sessionId, messagesHistory) {
    try {
      await db.conversationHistory.put({ sessionId, messagesHistory });
      console.log("历史对话信息保存成功");
    } catch (error) {
      console.error("保存历史对话信息时出错: ", error);
      throw error;
    }
  }

  // 更新会话标题的函数
  async function updateSessionTitle(sessionId, newTitle) {
    try {
      await db.sessions.update(sessionId, { name: newTitle });
      console.log("会话标题更新成功");
    } catch (error) {
      console.error("更新会话标题时出错: ", error);
      throw error;
    }
  }


  // 删除会话及其相关数据的函数
  async function deleteSessionAndRelatedData(sessionId) {
    try {
      await db.transaction('rw', db.sessions, db.config, db.conversationHistory, db.sessionContents, async () => {
        await db.sessions.delete(sessionId);
        await db.config.where({ sessionId }).delete();
        await db.conversationHistory.where({ sessionId }).delete();
        await db.sessionContents.where({ sessionId }).delete();
        console.log("会话及相关数据删除成功");
      });
    } catch (error) {
      console.error("删除会话及相关数据时出错: ", error);
      throw error;
    }
  }

  // 删除会话及其相关数据的函数
  async function deleteSessionAndRelatedData(sessionId) {
    try {
      await db.transaction('rw', db.sessions, db.config, db.conversationHistory, db.sessionContents, async () => {
        await db.sessions.delete(sessionId);
        await db.config.where({ sessionId }).delete();
        await db.conversationHistory.where({ sessionId }).delete();
        await db.sessionContents.where({ sessionId }).delete();
        console.log("会话及相关数据删除成功");
      });
    } catch (error) {
      console.error("删除会话及相关数据时出错: ", error);
      throw error;
    }
  }




  // 保存当前对话
  async function saveCurrentConversation(_currentConversationIndex) {
    console.log(_currentConversationIndex);
    if (_currentConversationIndex !== null) {
      var sessionId = _currentConversationIndex;

      console.log("sessionId", sessionId);

      var savedConfig = {
        // 新增接口设置表单信息
        interfaceType: $('#interface-type').val(),
        aiModelType: $('#ai-model-type').val(),
        interfaceUrl: $('#interface-url').val(),
        token: $('#token').val()
      };

      console.log("savedConfig", savedConfig);

      var converseConfig = {
        // 会话配置和记录信息
        functionSelect: $('#function-selete').val(),
        editorText: $('#editorText').val(),
        urlInput: $('#urlInput').val(),
        roleSelect: $('#role-select').val(),
        roleInput: $('#roleInput').val(),
        continueSeparator: $('#continueSeparator').val(),
        outputSeparator: $('#outputSeparator').val(),
        promptInput: $('#promptInput').val(),
      }

      console.log("converseConfig", converseConfig);

      // 保存会话信息
      await saveSessionContent(sessionId, fullContent);

      // 保存模型接口配置信息
      await saveConfig(sessionId, JSON.stringify(savedConfig));

      // 保存会话配置信息
      await saveConverseConfig(sessionId, JSON.stringify(converseConfig));

      // 保存历史对话信息，每次对话完之后已经保存了，所以这里不用再保存
      // await saveConversationHistory(sessionId, JSON.stringify(messagesHistory));
    }
  }


  // 添加新对话
  async function addNewConversation() {
    showConfigDataSel();  //刷新接口选择下拉框
    $('#newConversationModal').modal('show'); // 显示模态框

    $('#saveNewConversation').off('click').on('click', async function () {
      var title = $('#newConversationTitle').val().trim();
      title = title || "新对话";

      let gptConfigID = $('#interfaceSelector').val();

      await saveCurrentConversation(currentConversationIndex);
      var newSessionID = await addSession(title,gptConfigID);
      resetCurrentConversation();
      currentConversationIndex = newSessionID;
      console.log("currentConversationIndex", currentConversationIndex);
      await updateConversationsListUI(); // 更新 UI

      assistantResponse = ""; // 更新助手的完整回复为空

      $('#newConversationModal').modal('hide'); // 隐藏模态框
      $('#newConversationTitle').val(''); // 清空输入框
    });
  }


  // 封装函数：查询 sessions 表中指定 id 的值里的 gptConfigID
async function getGptConfigIDBySessionID(sessionID) {
  try {
    const session = await db.sessions.get(sessionID);
    if (session) {
      return session.gptConfigID;
    } else {
      console.error(`找不到 ID 为 ${sessionID} 的会话记录`);
      return null;
    }
  } catch (error) {
    console.error(`查询会话记录时出错：`, error);
    throw error;
  }
}

// // 示例调用
// const exampleSessionID = 1; // 替换为你想查询的会话 ID
// getGptConfigIDBySessionID(exampleSessionID)
//   .then(gptConfigID => {
//     console.log(`ID 为 ${exampleSessionID} 的会话记录中的 gptConfigID 为:`, gptConfigID);
//   })
//   .catch(error => {
//     console.error(`查询会话记录时出现错误：`, error);
//   });

// 查询 gptConfigData 表中的特定数据
async function getConfigDataById(id) {
  try {
    const data = await db.gptConfigData.get(id);
    return data;
  } catch (error) {
    console.error('查询数据时出现错误：', error);
    throw error;
  }
}

// 示例调用
// const exampleId = 1; // 替换为你想查询的 id
// getConfigDataById(exampleId)
//   .then(data => {
//     console.log('查询到的数据：', data);
//   })
//   .catch(error => {
//     console.error('查询数据时出现错误：', error);
//   });




  // 加载旧对话
  async function loadConversation(id) {

    if (id != currentConversationIndex) {
      console.log("开始保存", currentConversationIndex);
      await saveCurrentConversation(currentConversationIndex); // 保存当前对话数据
    }

    let gptConfigID = await getGptConfigIDBySessionID(id)

    let gptConfig = null;
    if(gptConfigID){
      gptConfig = await getConfigDataById(Number(gptConfigID));
    } else{
      // 弹窗选择接口
    }
    

    console.log("现在加载的会话是", id);
    console.log("对应的配置文件id为", gptConfigID);
    console.log("对应的配置信息为", gptConfig);

    // 从数据库加载会话内容
    var sessionContent = await db.sessionContents.get(id);

    // 从数据库加载模型接口配置信息
    var config = await db.config.get(id);

    console.log("config",config)

    // 从数据库加载会话配置信息
    var converseConfig = await db.converseConfig.get(id);

    // 从数据库加载历史对话信息
    var conversationHistory = await db.conversationHistory.get(id);

    // 更新编辑器和表单字段
    if (sessionContent) {
      fullContent = sessionContent.fullContent || '';
      editor.setMarkdown(fullContent); // 假设你有一个用于显示内容的编辑器
    }

    // 更新模型接口配置信息
    if (gptConfig && gptConfig.formData) {
      var configData = gptConfig.formData
      console.log("configData", configData)

      // AJAX 请求获取接口类型和模型类型的数据
      $.getJSON('/config/config.json', async function (data) {
        // 更新表单选项

        await updateFormOptions(data);

        // 设置接口设置表单的值
        $('#interface-type').val(configData.接口类型.value || '').trigger('change');
        $('#interface-url').val(configData.接口地址.value || '');
        $('#ai-model-type').val(configData.模型名称.value || '');
        $('#token').val(configData.Token.value || '');

        $('.ai-model-view').text(configData.模型名称.value || '未设置模型');

        // 更新其他配置信息
        API_URL = configData.接口地址.value || '';
        MODEL = configData.模型名称.value || '';
        MY_TOKEN = configData.Token.value || '';
        // MAX_TOKENS = configData.maxTokens || '';



        // 更新页面显示
        updatePageDisplay(configData);


        // 特定功能选择的处理逻辑（如果有的话）
        if (configData.functionSelect === 'url') {
          $('#editorContainer').removeClass('d-none');
          // 其他相关的 UI 更新...

        }

      });
    } else {
      initLoadConfig(); // 初始化加载配置
    }

    // 更新会话配置信息
    if (converseConfig && converseConfig.converseConfig) {
      var configData_2 = JSON.parse(converseConfig.converseConfig);
      console.log("converseConfig", configData_2)
      $('#function-select').val(configData_2.functionSelect || 'base');
      $('#editorText').val(configData_2.editorText || '');
      $('#urlInput').val(configData_2.urlInput || '');
      $('#role-select').val(configData_2.roleSelect || '1');
      $('#roleInput').val(configData_2.roleInput || '');
      $('#continueSeparator').val(configData_2.continueSeparator || 'piece');
      $('#outputSeparator').val(configData_2.outputSeparator || '');
      $('#promptInput').val(configData_2.promptInput || '');
    }


    console.log("conversationHistory", conversationHistory)
    // 更新历史对话
    if (conversationHistory) {
      assistantResponse = ""; // 更新助手的完整回复为空
      messagesHistory = JSON.parse(conversationHistory.messagesHistory) || [];
      displayMessagesHistory(); // 更新显示历史对话的 UI 部分
    } else {
      messagesHistory = []; // 如果没有历史记录，则初始化为空数组
      displayMessagesHistory(); // 清空历史对话显示
    }

    console.log(messagesHistory);

    // 更新当前会话索引
    currentConversationIndex = id;

    // 重置选择的向量文档
    // selectedFiles = [];


    // 更新侧边栏 UI
    // await updateConversationsListUI();
  }


  // 重置当前对话和表单数据
  function resetCurrentConversation() {
    messagesHistory = [];
    fullContent = '';
    editor.setMarkdown('');
    currentConversationIndex = null;

    // initLoadConfig();
    loadRoles();

    // 重置选择的向量文档
    selectedFiles = [];
  }

  // 更新侧边栏 UI
  async function updateConversationsListUI() {
    var $list = $("#conversationsList");
    $list.empty();

    var sessions = await db.sessions.toArray();
    sessions.sort((a, b) => b.id - a.id);

    var latestSessionId = sessions.length > 0 ? sessions[0].id : null;

    $.each(sessions, function (index, session) {
      var isActive = session.id === currentConversationIndex;
      var $editIcon = $('<i class="bi bi-pencil-square mr-2 icon-hidden"></i>').click(function (e) {
        e.stopPropagation();
        $('#newTitle').val(session.name || ""); // 设置当前标题
        $('#saveTitleChange').data('sessionId', session.id); // 将会话ID附加到保存按钮
        $('#editTitleModal').modal('show'); // 显示模态框
      });

      var $deleteIcon = $('<i class="bi bi-trash icon-hidden"></i>').click(function (e) {
        e.stopPropagation();
        $('#confirmDelete').data('sessionId', session.id); // 将会话ID附加到删除按钮
        $('#confirmDeleteModal').modal('show'); // 显示模态框
      });

      var $icons = $('<div class="float-right"></div>').append($editIcon).append($deleteIcon);

      var $listItem = $("<a>")
        .addClass('list-group-item list-group-item-action')
        // .addClass(isActive ? 'active' : '')
        .html('<i class="bi bi-chat-dots"></i> &nbsp;' + (session.name || "对话 " + session.id))
        .attr("data-id", session.id)
        .append($icons)
        .click(function () {
          // 添加条件检查，只有在点击的会话不是当前激活会话时才加载会话
          if (session.id !== currentConversationIndex) {
            loadConversation(session.id);
          }
        });

      $list.append($listItem);
    });

    // 设置随便聊聊始终置顶
    customizeConversationList();

    // 激活会话点击active事件
    activateOnClick();

    // if (latestSessionId && currentConversationIndex === null) {
    currentConversationIndex = latestSessionId;
    console.log("最初加载latestSessionId", latestSessionId)
    loadConversation(latestSessionId);
    $list.find('a[data-id="' + latestSessionId + '"]').addClass('active');
    // }
  }

  // 更新点击会话的active激活
  // 给每个列表项添加点击事件
  function activateOnClick() {
    // 给每个列表项添加点击事件
    $("#conversationsList a.list-group-item").on("click", function () {
      // 移除其他列表项上的 active 类
      $("#conversationsList a.list-group-item").removeClass("active");

      // 在被点击的列表项上添加 active 类
      $(this).addClass("active");
    });
  }



  // 初始化检测会话
  async function initializeConversation() {
    try {
      // 检查数据库中的会话数量
      const sessionCount = await db.sessions.count();

      if (sessionCount === 0) {
        // 如果没有会话，则创建一个新的会话
        const newSessionID = await addSession("随便聊聊");
        currentConversationIndex = newSessionID;
        await loadConversation(currentConversationIndex);
        await updateConversationsListUI(); // 更新 UI
        return 0;
      }

      // 加载对话列表
      await updateConversationsListUI();

      // 如果有当前会话，则加载它
      // if (currentConversationIndex) {
      //   await loadConversation(currentConversationIndex);
      // }
    } catch (error) {
      console.error("初始化对话时出错: ", error);
    }
  }




  // 保存会话标题更改
  $('#saveTitleChange').click(function () {
    var sessionId = $(this).data('sessionId');
    var newTitle = $('#newTitle').val();

    updateSessionTitle(sessionId, newTitle).then(() => {
      $('#editTitleModal').modal('hide');
      updateConversationsListUI(); // 刷新UI以显示新标题
    });
  });

  // 删除会话
  $('#confirmDelete').click(function () {
    var sessionId = $(this).data('sessionId');

    deleteSessionAndRelatedData(sessionId).then(() => {
      $('#confirmDeleteModal').modal('hide');
      updateConversationsListUI(); // 刷新UI以移除已删除的会话
    });
  });








  // 新建会话事件
  $("#newConversation").click(addNewConversation);



  /*
  *
  * 编辑器中的扩展功能
  *
  */

  // 获取扩展功能的开关
  function getSwitchValues() {
    const imgAnalysisSwitch = $('#img-analysis-switch');
    const reptileSelectedSwitch = $('#reptile-seleted');

    const imgAnalysisValue = imgAnalysisSwitch.is(':checked');
    const reptileSelectedValue = reptileSelectedSwitch.is(':checked');

    console.log('图像分析:', imgAnalysisValue);
    console.log('URL网页爬虫:', reptileSelectedValue);

    // 返回一个包含两个开关值的对象
    return {
      imgAnalysis: imgAnalysisValue,
      reptileSelected: reptileSelectedValue
    };
  }

  // console.log(getSwitchValues())



  // 获取随机性、最大字符、对话论数的值
  /*
  * id:1 随机性
  * id:2 最大字符
  * id:3 最大对话轮数
  */
  function setParameter(id, value) {
    // 根据ID更新不同的参数
    switch (id) {
      case "1": // 随机性
        RANDOMNESS = value;
        break;
      case "2": // 最大字符
        SET_MAX_TOKENS = value;
        console.log("SET_MAX_TOKENS", SET_MAX_TOKENS);
        // 设置最大的字符
        // $('#maxCharCount').html(SET_MAX_TOKENS);
        // 同步更新数字输入框
        $('#inputValue2').val(SET_MAX_TOKENS);
        updateCharCount();
        break;
      case "3": // 最大对话轮数
        MAX_MSG_NUM = value;
        break;
    }
  }

  // 优化后的事件监听器
  $('[id^=formControlRange],[id^=inputValue]').on('input', function () {
    const id = this.id.match(/\d+$/)[0]; // 从ID中提取数字
    const value = parseFloat($(this).val());
    setParameter(id, value);
    console.log("value", value);
  });



  // 检测展开和折叠图标的状态
  function setupSidebarToggle() {
    let timeout;

    $('#sidebar, .left-menu, #sidebarToggle').hover(
      function () {
        // 鼠标进入，设置延迟后显示图标
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          $('#sidebarToggle').fadeIn();
        }, 250);
      },
      function () {
        // 鼠标离开，设置延迟后隐藏图标
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          $('#sidebarToggle').fadeOut();
        }, 250);
      }
    );

    // 切换图标
    $('#sidebarToggle').click(function () {
      $('#toggleIcon').toggleClass('bi-chevron-compact-left bi-chevron-compact-right');
    });
  }

  setupSidebarToggle();



  // 页面即将卸载时保存表单数据
  $(window).on('beforeunload', async function () {
    // alert(999);
    await saveCurrentConversation(currentConversationIndex);
  });









  // 用户文件夹操作
  async function getListOfFiles(_dir, parentElement = null) {
    try {
      const response = await fetch(`/list_folder_files?folder_path=${_dir}`, {
        method: 'GET',
      });

      if (!response.ok) {
        showAlert(response.json().detail, 'warning', 3000);
        throw new Error('请求失败');
      }

      const data = await response.json();

      console.log(data);

      // 处理成功返回的数据
      updateFilesList(data.files, parentElement, _dir);
    } catch (error) {
      // 处理请求失败
      console.error('请求失败:', error);
    }
  }

  let currentFileName = ''; // 用于存储旧文件名的变量
  function updateFilesList(files, parentElement, currentPath) {
    const filesListElement = parentElement || $('#filesList');

    if (!parentElement) {
      filesListElement.empty();
    }

    $.each(files, function (index, file) {
      const listItem = $('<li>').addClass('list-group-item');
      const contentDiv = $('<div>').addClass('file-item-content d-flex justify-content-between align-items-center'); // 创建一个包裹内容的div

      // 文件夹或文件的名称和图标
      if (file.type === 'folder') {
        contentDiv.append(`<span class="folder-toggle"><i class="bi bi-chevron-right"></i></span>`);
      }
      contentDiv.append(`<span class="file-name">${file.name}</span>`); // 文件夹或文件名称

      // 下拉菜单的构建
      const dropdownDiv = $('<div>').addClass('dropdown');
      dropdownDiv.append(`
        <button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
        <div class="dropdown-menu">
          <a class="dropdown-item rename-file" href="#" data-toggle="modal" data-target="#renameModal">重命名</a>
          <a class="dropdown-item delete-file" href="#">删除</a>
        </div>
      `);

      // 将下拉菜单添加到内容div中
      contentDiv.append(dropdownDiv);

      dropdownDiv.find('.rename-file').on('click', function () {
        // 设置模态框中的输入框为当前文件名
        currentFileName = file.name;
        $('#newFileName').val(file.name);
      });

      // 将内容div添加到列表项中
      listItem.append(contentDiv);

      if (file.type === 'folder') {
        const childListId = 'folder_' + Math.random().toString(36).substr(2, 9);
        listItem.append(`<div id="${childListId}" class="collapse"></div>`);

        contentDiv.find('.folder-toggle').click(async function (event) {
          event.stopPropagation();

          const childList = $('#' + childListId);
          const folderPath = currentPath + '/' + file.name;

          if (!childList.hasClass('show')) {
            childList.empty();
            await getListOfFiles(folderPath, childList);
          }
          childList.collapse('toggle');
        });
      }

      filesListElement.append(listItem);
    });
  }

  // 打开重命名模态框
  function openRenameModal(fileName) {
    // 设置文本框的值为当前文件或文件夹的名称
    $('#newFileName').val(fileName);

    // 监听保存按钮点击事件
    $('#saveRename').off('click').on('click', function () {
      const newFileName = $('#newFileName').val();
      saveRename(fileName, newFileName);
      $('#renameModal').modal('hide');
    });

    // 显示模态框
    $('#renameModal').modal('show');
  }

  // 假设保存按钮的 ID 是 'saveRenameButton'
  $('#saveRename').on('click', function () {
    const newName = $('#newFileName').val(); // 获取新文件名

    if (newName && currentFileName !== newName) {
      saveRename(currentFileName, newName);
    } else {
      showAlert('文件名无效或未更改', 'warning', 3000);
    }
  });

  // 保存重命名
  function saveRename(oldName, newName) {
    // 执行重命名的逻辑，可以使用 fetch 发送请求
    fetch(`/rename_file?folder_path=${USERDIR}&old_name=${oldName}&new_name=${newName}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
      body: ''
    })
      .then(response => {
        if (!response.ok) {
          showAlert(response.json().detail, 'warning', 3000);
          throw new Error('保存失败');
        }
        // 处理成功的逻辑
        showAlert('保存成功', 'success', 3000);
        console.log('保存成功');
        // 重新获取文件列表
        getListOfFiles(USERDIR);

        // 关闭模态框
        $('#renameModal').modal('hide');
      })
      .catch(error => {
        // 处理保存失败
        showAlert(error, 'danger', 3000);
        console.error('保存失败:', error);
      });
  }

  // 删除文件的函数
  function deleteFile(fileName) {
    // 打开确认删除的模态框
    $('#deleteConfirmationModal').modal('show');

    // 确认删除按钮点击事件
    $('#confirmDelete').off('click').on('click', function () {
      // 关闭确认删除的模态框
      $('#deleteConfirmationModal').modal('hide');

      // 执行删除文件的逻辑，可以使用 fetch 发送请求
      fetch(`/delete_file?folder_path=${USERDIR}&filename=${fileName}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            showAlert(response.json().detail, 'warning', 3000);
            throw new Error('删除失败');
          }
          // 处理成功的逻辑
          showAlert('删除成功', 'success', 3000);
          console.log('删除成功');
          // 重新获取文件列表
          getListOfFiles(USERDIR);
        })
        .catch(error => {
          // 处理删除失败
          showAlert(error, 'danger', 3000);
          console.error('删除失败:', error);
        });
    });
  }




  // 上传文件的函数
  function uploadFile(file, modelName, searchMode, uploadDir) {
    const formData = new FormData();
    formData.append('files', file, file.name); // Assuming 'file' is a File object

    const url = `/upload-files/?model_name=${encodeURIComponent(
      modelName
    )}&search_mode=${searchMode}&upload_dir=${uploadDir}`;

    fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('上传失败');
        }
        return response.json(); // Parse JSON response
      })
      .then(data => {
        // Handle success
        showAlert('上传成功: ' + data.status, 'success', 3000);
        console.log('上传成功', data);
        // Additional success logic
      })
      .catch(error => {
        // Handle failure
        if (error.json) {
          error.json().then(errorMessage => {
            showAlert(errorMessage.detail, 'warning', 3000);
          });
        } else {
          showAlert(error.message, 'danger', 3000);
        }
        console.error('上传失败:', error);
      });
  }

  // 监听文件选择变化
  // 监听文件选择变化
  $('#fileInput').on('change', function () {
    const file = this.files[0];
    if (file) {
      // 调用 uploadFile 函数，并传递必要的参数
      uploadFile(file, vectorModelName, vectorSearchMode, USERDIR);
    }
  });

  // 调用函数
  getListOfFiles(USERDIR);





  // 文本框@输入的设置
  $('#promptInput').on('input', function () {
    // const caretCoords = getCaretCoordinates();
    const inputValue = $(this).val();
    const caretPos = $(this).get(0).selectionStart;
    const textBeforeCaret = inputValue.substring(0, caretPos);

    // 检查最后一个 "@" 符号后是否紧跟着一个空格
    const lastAtIndex = textBeforeCaret.lastIndexOf('@');
    if (lastAtIndex !== -1 && textBeforeCaret[lastAtIndex + 1] !== ' ' && textBeforeCaret.substring(lastAtIndex).indexOf(' ') === -1) {
      // showFileListPopup(caretCoords);
      $('.docfile-selete').addClass('show');
    } else {
      closeFileListPopup();
      $('.docfile-selete').removeClass('show');
    }
  });

  $('#promptInput').on('keydown', function (e) {
    if (e.key === ' ' && isAfterAtSymbol()) {
      closeFileListPopup();
    }
  });

  function isAfterAtSymbol() {
    const textarea = $('#promptInput');
    const caretPos = textarea.get(0).selectionStart;
    const inputValue = textarea.val();
    const textBeforeCaret = inputValue.substring(0, caretPos);

    const lastAtIndex = textBeforeCaret.lastIndexOf('@');
    return lastAtIndex >= 0 && textBeforeCaret[lastAtIndex + 1] !== ' ';
  }

  function showFileListPopup(caretCoords) {
    console.log('Updating popup with files:');
    const popup = $('#fileListPopup');
    popup.empty(); // 清空旧内容

    // 设置弹窗位置并显示
    popup.css({
      'top': `-${$('#promptInput').position().top + $('#promptInput').outerHeight()}px`,
      'left': $('#promptInput').position().left,
      'display': 'block',
      'height': '200px',
      'width': '200px',
      'border': '1px solid black', // 添加边框以便可见
      'background': 'white', // 添加背景色以便可见
      'position': 'absolute', // 确保使用绝对定位
      'z-index': '1060' // 确保弹窗位于其他元素之上
    });
  }

  function closeFileListPopup() {
    // 关闭悬浮弹窗
    const popup = $('#fileListPopup');
    popup.css({
      'display': 'none',
    });
  }




  // 文件选择下拉框
  // 显示文件列表

  function showFileList(files) {
    const fileListContainer = document.getElementById('fileListContainer');
    fileListContainer.innerHTML = ''; // 清空旧内容

    // 构建文件列表
    files.forEach(file => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'form-check-input';
      checkbox.value = file.name;
      checkbox.id = 'fileCheckbox' + file.name.replace(/\s/g, ''); // 用文件名作为唯一标识符

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = 'fileCheckbox' + file.name.replace(/\s/g, '');
      label.appendChild(document.createTextNode(file.name));

      const fileItem = document.createElement('div');
      fileItem.className = 'form-check';
      fileItem.appendChild(checkbox);
      fileItem.appendChild(label);

      fileListContainer.appendChild(fileItem);
    });


    // 监听文件列表复选框的变化
    var tempSelectedFiles = [];
    $('.docfile-selete input[type="checkbox"]').change(function () {
      var checkboxValue = $(this).val(); // 获取选中的复选框的值

      // 判断复选框的状态
      if ($(this).is(':checked')) {
        // 如果复选框被选中，将值添加到数组中
        selectedFiles.push(USERDIR + checkboxValue);
        tempSelectedFiles.push(checkboxValue);
      } else {
        // 如果复选框被取消选中，将值从数组中移除
        selectedFiles = selectedFiles.filter(function (file) {
          return file !== USERDIR + checkboxValue;
        });
        tempSelectedFiles = tempSelectedFiles.filter(function (file) {
          return file !== checkboxValue;
        });
      }

      // 打印或进行其他处理
      console.log(selectedFiles);
      // 更新显示选择的文档
      updateSelectedDocuments();
    });


    // 更新显示选择的文档函数
    function updateSelectedDocuments() {
      // 获取显示文档的父容器
      var selectedDocumentsContainer = $('.seleted-document');

      // 清空容器中的内容
      selectedDocumentsContainer.empty();

      // 遍历选中的文件数组，将每个文件值添加到容器中的 span 元素
      tempSelectedFiles.forEach(function (file) {
        selectedDocumentsContainer.append('<span>' + file + '</span>');
      });
    }

  }

  // 获取文件夹接口
  function fetchFiles(folderPath) {
    fetch(`/list_folder_files?folder_path=${folderPath}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('获取文件列表失败');
        }
        return response.json();
      })
      .then(data => {
        // 处理成功返回的数据
        showFileList(data.files);
      })
      .catch(error => {
        // 处理请求失败
        console.error('获取文件列表失败:', error);
      });
  }

  fetchFiles(USERDIR);

  // 在按钮点击时触发获取文件列表
  // $('#docfile-selete').on('click', function () {
  //   fetchFiles(USERDIR);
  // });

  // 在下拉框展开时触发获取文件列表
  // document.querySelector('.dropup').addEventListener('show.bs.dropdown', function () {
  //   fetchFiles();
  // });


  // 使用关键字请求向量检索最相似的内容
  async function fetchSearchPath(query, modelName, k, searchMode, filePaths) {
    // 构建请求的URL
    const apiUrl = '/search-path/';
    const queryParams = new URLSearchParams({
      query: query,
      model_name: modelName,
      k: k,
      search_mode: searchMode,
      file_paths: filePaths.join('&file_paths=') // 将文件路径数组连接为字符串
    });

    const urlWithParams = apiUrl + '?' + queryParams;

    // 发送fetch请求并返回Promise
    return fetch(urlWithParams, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: '' // 这里可以添加请求体，根据实际需要
    })
      .then(response => response.json())
      .then(data => {
        // 处理返回的数据
        const resultsAsString = data.results.map(result => {
          const fileName = Object.keys(result)[0];
          const content = result[fileName];
          return `${fileName}: ${content}`;
        }).join('\n');

        return resultsAsString;
      })
      .catch(error => {
        console.error('Error:', error);
        return 'Error occurred during the fetch.';
      });
  }


  // 查询 gptConfigData 表中的所有数据
function getConfigDataSel() {
  return db.gptConfigData.toArray();
}

// 在下拉框中显示接口名称和对应的id
function showInterfaceSelector(data) {
  const interfaceSelector = $("#interfaceSelector");
  interfaceSelector.empty(); // 清空下拉框选项，防止重复添加

  data.forEach(item => {
    interfaceSelector.append(`<option value="${item.id}">${item.formData["接口名称"]?.value || item.formData["接口名称"]}</option>`);
  });
}

// 读取并展示 gptConfigData 表数据到下拉框
function showConfigDataSel() {
  getConfigDataSel().then(data => {
    showInterfaceSelector(data);
  }).catch(error => {
    console.error('读取数据时出现错误：', error);
  });
}



});

