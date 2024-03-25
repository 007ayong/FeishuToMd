// ==UserScript==
// @name         FeishuToMd
// @namespace    https://www.winapps.cc
// @version      0.2
// @description  将飞书文档复制为 Markdown 格式的纯文本
// @author       ayong
// @homepageURL  https://github.com/007ayong/FeishuToMd
// @updateURL    https://github.com/007ayong/FeishuToMd/raw/master/FeishuToMd.user.js
// @match        https://*.feishu.cn/docx/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAwCAYAAABNPhkJAAAAAXNSR0IArs4c6QAAA4tJREFUaEPtmk9IFFEcx7+/MfAgoTt7CC9FtKNRlyAipSg9FJhE4SGPRQdhZ1vqUHQp1IqIPHjQHU2IoCBCkECQDh40AgtRokORzqqHqEO4sxXRpd35xfivdXd2Z3Zddx1n57TMvPf7vs/7vvd7b98MwWUXuYwXJeDt7ri7HfYo4Sbi+NGCuCwIXAgdPYbXP4LS+KrWksMeJdwGcBsBhwvRiEJrMDAN0EBU9g2Qt3+uhXV9qNCNKIYe63oziUr4DcDHi9GAImhOkKiovwDsLIJ4MSR/G8AFSR7FoDPTLAFvFSc2qx0lh5N7loFxjqMz+T4JXE1Ez205QRjVY7hvVlYow5hlDNY7dV1Y2zysbSLK0E5Ag2X9hAKWDhvAUVlqNAsqKrN3AbplIfgVTPVawPcluVxVj9pgF1gL1HYk1/co6lhBgY0GiEp4COCWtNA6n9au1IyaPXck8K6uDxV/KyqmAa5NGfZMwUjA15uuMxwJbMB4Q3NHmPTJRDAC90fkGn+m4e5Y4GXo2UtM9GQFcEKTpWNWycTRwCvz+SHAfjAdMEtS2yJppWbOcFNU9r2yctd47iiHxdBMh9lSYQZa2fN578/g/gVHOyz2qcaiPx/xS8+s3BRDsyNaoKbZ8cBgXBVApxZl33Q6aFEJdwF8XZOllPOzNEO6XpOld1admF5PvQagO93znHdahsNgdIBoSvPuq8MFiieLiH3qZTAeG/ezAI4J8fI9i8Hd37KF9ioz5xnCy0z1Ng5sRGcMagGpNVFIVNQ6AG9X72UBbFSZ1777atFBMbvQVaHZQwLRe6vy+QFeVmnXZOmO8cPzaK4SMX2KCL4cgZFpD5+SC7oXqoTy+CeAqwsJDAE4tyhLw15FHWbgbKJ4lg4vVWXgaVSWLlpBiIpqjCRjRFle+XTYEPsDcAigG8nKuQAvx6B7muy7nSFJvQCwbjpt/hy27NesklZKNCIKRvypf0K8ivqAgZs25NeK5NvhtNq5O7wSktCq+aXBVQFPn+onhpIN7NJ4sTq1TJc81pYlm4obBgYgEBoX/dK4p3fmDAnCiE3pdcVsAZsd8Qg7cHJpHbZ56XGYnprYOvH4rxGBgBOI8ySIKmxKZwecS9BNrvMRwMFcNSwdzjXwVq1XAt6qzuSrXW58meay16WueyFuzA1XffKQmAxc81FLvjKgE+K4+zstJzi00TaWHN5oD271+v8A7zodk7v3YDQAAAAASUVORK5CYII=
// @grant        none
// ==/UserScript==

(function () {

    // 创建一个悬浮按钮
    const button = document.createElement("button");
    button.textContent = "一键复制";
    button.classList.add("ud__button", "ud__button--filled", "ud__button--filled-default", "ud__button--size-md", "suite-share", "layout-row", "layout-cross-center", "layout-main-center", "note-btn", "note-title__share");
    button.style.position = "fixed";
    button.style.right = "60px";
    button.style.top = "120px";
    button.style.zIndex = "9999";

    // 将按钮添加到页面中
    document.body.appendChild(button);

    // 全选文章，滑动至最底端后继续

    button.addEventListener("click", convertToMarkdown);

    function convertToMarkdown() {

        // 选择需要处理的节点
        const nodesToProcess = document.querySelectorAll('.heading-h2, .heading-h3, .text-block, .image-block, table, .list-content, .inline-code');

        // 定义一个空的 Map 对象来保存节点信息
        const nodes = new Map();

        // 遍历节点，将节点信息保存到 nodes 中
        nodesToProcess.forEach((node) => {
            let type, content;
            switch (true) {
                case node.classList.contains('heading-h2'):
                    type = 'heading-h2';
                    content = node.textContent.trim().replace(/\u200B/g, '');
                    break;
                case node.classList.contains('heading-h3'):
                    type = 'heading-h3';
                    content = node.textContent.trim().replace(/\u200B/g, '');
                    break;
                case node.classList.contains('text-block'):
                    // 排除表格
                    if (!node.closest || !node.closest('table')) {
                        const spans = node.querySelectorAll('span');
                        let textSet = new Set(); // 使用 Set 存储内容，确保不重复
                        spans.forEach(span => {
                            if (span.style.fontWeight === 'bold') {
                                textSet.add('**' + span.textContent.replace(/\u200B/g, '') + '**');
                            } else if (span.classList.contains('inline-code')) {
                                // 如果是行内代码，将其文本内容用 `` 符号包裹起来
                                textSet.add('`' + span.textContent.replace(/\u200B/g, '') + '`');
                            } else if (
                                // 没有子元素且任意父元素中不含.inline-code的类名
                                span.childElementCount === 0 &&
                                !span.closest('.inline-code')
                            ) {
                                textSet.add(span.textContent.replace(/\u200B/g, ''));
                            }
                        });
                        type = 'text-block';
                        content = Array.from(textSet).join(''); // 转换 Set 为数组，并用 join 方法连接成字符串
                    }
                    break;
                case node.classList.contains('image-block'):
                    type = 'img';
                    content = 'https://';
                    break;
                case node.tagName.toLowerCase() === 'table':
                    type = 'table-block';
                    content = { rows: [] };

                    // 将表格中的行和列数据保存到 content.rows 中
                    const rows = node.querySelectorAll('tr');
                    rows.forEach((row) => {
                        const rowData = [];
                        const cells = row.querySelectorAll('td, th');
                        cells.forEach((cell) => {
                            rowData.push(cell.textContent.trim().replace(/\u200B/g, ''));
                        });
                        content.rows.push(rowData);
                    });
                    break;
                case node.classList.contains('list-content'):
                    type = 'list';
                    content = node.textContent.trim().replace(/\u200B/g, '');
                    break;
                default:
                    break;
            }

            if (content) {
                const nodeId = nodes.size + 1;
                const nodeObj = { type: type, content: content, order: nodeId };
                nodes.set(nodeId, nodeObj);
            }
        });

        // 将节点信息转换为 Markdown 格式的文本
        let markdownContent = '';
        for (let i = 1; i <= nodes.size; i++) {
            const node = nodes.get(i);
            switch (node.type) {
                case 'heading-h2':
                    markdownContent += '## ' + node.content + '\n\n';
                    break;
                case 'heading-h3':
                    markdownContent += '### ' + node.content + '\n\n';
                    break;
                case 'text-block':
                    // 判断文本节点是否在表格中
                    if (!node.closest || !node.closest('table')) {
                        // 节点不在表格中
                        markdownContent += node.content + '\n\n';
                    }
                    break;
                case 'img':
                    markdownContent += '![](https://)' + '\n<br />\n\n';
                    break;
                case 'list':
                    markdownContent += '- ' + node.content + '\n\n'
                    break;
                // case 'inline-code':
                //     markdownContent += '`' + node.content + '`' + '\n\n'
                //     break;
                case 'table-block':
                    const table = node.content;
                    const rows = table.rows;
                    const columnCount = rows[0].length;
                    const rowCount = rows.length;

                    // 表头
                    markdownContent += '|';
                    for (let i = 0; i < columnCount; i++) {
                        markdownContent += rows[0][i] + '|';
                    }
                    markdownContent += '\n|';
                    for (let i = 0; i < columnCount; i++) {
                        markdownContent += ':---:|';
                    }
                    markdownContent += '\n';

                    // 表格内容
                    for (let i = 1; i < rowCount; i++) {
                        const row = rows[i];
                        markdownContent += '|';
                        for (let j = 0; j < columnCount; j++) {
                            markdownContent += row[j] + '|';
                        }
                        markdownContent += '\n';
                    }
                    markdownContent += '\n';
                    break;
                default:
                    break;
            }
        }
        console.log(markdownContent);
        navigator.clipboard.writeText(markdownContent).then(() => {
            console.log("Markdown content copied to clipboard.");
        }, () => {
            console.error("Failed to copy Markdown content to clipboard.");
        });
    }
})();