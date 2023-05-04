let saveAsTxtButton = document.getElementById('saveAsTxtButton');
let saveAsMarkdownButton = document.getElementById('saveAsMarkdownButton');
let saveAsPDFButton = document.getElementById('saveAsPDFButton');

saveAsTxtButton.addEventListener("click", async () => {
    // Get current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // Execute script to parse chat on page and save as TXT
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: saveAsTxt,
    });
});

saveAsMarkdownButton.addEventListener("click", async () => {
    // Get current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // Execute script to parse chat on page and save as Markdown
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: saveAsMarkdown,
    });
});

saveAsPDFButton.addEventListener("click", async () => {
    // Get current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // Execute script to parse chat on page and save as PDF
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: saveAsPDF,
    });
});


// Function to save text to chatData as TXT
async function saveAsTxt() {
    let element = document.querySelector(".pr-14.bg-gray-800");
    if (!element || element.innerText === undefined) {
        alert("Nothing found");
        return;
    }  
    const elements = document.querySelectorAll(".text-gray-800");
    let chatData = "";
    for (const element of elements) {
        if (element.querySelector('.whitespace-pre-wrap')) {
            let innerText = element.querySelector(".whitespace-pre-wrap").innerText;
            chatData += `${element.querySelectorAll('img').length > 1 ? '**You:**' : '**ChatGPT:**'}\n\n\n${innerText}\n------------------\n`;
        }
    }    
    let handle = await window.showSaveFilePicker({ suggestedName: "Saved_ChatGPT_.txt" });
    let stream = await handle.createWritable();
    await stream.write(chatData);
    await stream.close();
}

//Function to save text to chatData as pdf
function saveAsPDF() {
    const elements = document.querySelectorAll(".text-base");
    let content = "";
    for (const element of elements) {
        if (element.querySelector('.whitespace-pre-wrap')) {
            let innerHtml = element.querySelector(".whitespace-pre-wrap").innerHTML;
            content += `${element.querySelectorAll('img').length > 1 ? `**You:**` : `**ChatGPT:**`}<br><br><br>${innerHtml}<br>------------------<br>`
        }
    }
    
    if (content.trim() === "") {
        alert("Nothing found");
        return;
    }


    // Create a new printable HTML
    function createPrintableHtml(content) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @media print {
                        body {
                            font-size: 12pt;
                        }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }
    const printableHtml = createPrintableHtml(content);

    // Create a new hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Set up a listener for the iframe load event
    iframe.onload = function() {
        // Invoke the print functionality of the browser
        try {
            iframe.contentWindow.print();
        } catch (error) {
            console.error('Printing failed:', error);
        }

        // Remove the hidden iframe after a short delay
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 100);
    };

    // Write the printable HTML to the iframe
    iframe.contentDocument.write(printableHtml);
    iframe.contentDocument.close();
}



// Function to save text to chatData as Markdown
async function saveAsMarkdown() {

    // Function to convert HTML to Markdown
function htmlToMarkdown(html) {
    let markdown = html;
    markdown = markdown.replace(/<\/?div[^>]*>/g, '');
    markdown = markdown.replace(/<br[^>]*>/g, '\n');

    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<u>(.*?)<\/u>/g, '__$1__');
    markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');
    markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
    markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, '#### $1\n');
    markdown = markdown.replace(/<h5>(.*?)<\/h5>/g, '##### $1\n');
    markdown = markdown.replace(/<h6>(.*?)<\/h6>/g, '###### $1\n');
    markdown = markdown.replace(/<code class="[^"]*">/g, '\n'); // remove code tags
    markdown = markdown.replace(/<\/code>/g, ''); // remove pre tags
    markdown = markdown.replace(/<pre><span class="">(.*?)<\/span>/g, '<pre>$1\n'); // remove language tag portion
    markdown = markdown.replace(/<pre>/g, '```'); // replace pre tags with code blocks
    markdown = markdown.replace(/<\/pre>/g, '\n```\n'); // replace pre tags with code blocks
    markdown = markdown.replace(/<button class="flex ml-auto gap-2">(.*?)<\/button>/g, ''); // Remove copy button SVG
    markdown = markdown.replace(/<span(?: class="[^"]*")?>|<\/span>/g, ''); // Remove span tags with or without a class
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n');

    // Add these lines to convert &lt; and &gt; to < and >, respectively
    markdown = markdown.replace(/&lt;/g, '<');
    markdown = markdown.replace(/&gt;/g, '>');

    const unorderedRegex = /<ul>(.*?)<\/ul>/gs;
    let match;
    let indent = 0;
    while ((match = unorderedRegex.exec(markdown))) {
        const list = match[1];
        const items = list.split('<li>');
        let itemStr = '';
        items.forEach((item, i) => {
            if (i === 0) return;
            item = item.replace('</li>', '');
            if (item.indexOf('<ul>') !== -1) {
                indent++;
            }
            itemStr += `${'  '.repeat(indent)}* ${item}`;
            if (item.indexOf('</ul>') !== -1) {
                indent--;
            }
        });
        markdown = markdown.replace(match[0], `${itemStr}`);
    }

    const orderedRegex = /<ol.*?>(.*?)<\/ol>/gs;
    const orderedLists = markdown.match(orderedRegex);
    if (orderedLists) {
        orderedLists.forEach((orderedList) => {
            let mdOrderedList = '';
            const listItems = orderedList.match(/<li.*?>(.*?)<\/li>/g);
            if (listItems) {
                listItems.forEach((listItem, index) => {
                    if (listItem.indexOf('<ul>') !== -1) {
                        indent++;
                    }
                    mdOrderedList += `${'  '.repeat(indent)}${index + 1
                        }. ${listItem.replace(/<li.*?>(.*?)<\/li>/g, '$1\n')}`;
                    if (listItem.indexOf('</ul>') !== -1) {
                        indent--;
                    }
                });
            }
            markdown = markdown.replace(orderedList, mdOrderedList);
        });
    }

    markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, function (match, p1) {
        return (
            '\n' +
            p1.replace(/<li>(.*?)<\/li>/g, function (match, p2) {
                return '\n- ' + p2;
            })
        );
    });
    const tableRegex = /<table>.*?<\/table>/g;
    const tableRowRegex = /<tr>.*?<\/tr>/g;
    const tableHeaderRegex = /<th.*?>(.*?)<\/th>/g;
    const tableDataRegex = /<td.*?>(.*?)<\/td>/g;

    const tables = html.match(tableRegex);
    if (tables) {
        tables.forEach((table) => {
            let markdownTable = '\n';
            const rows = table.match(tableRowRegex);
            if (rows) {
                rows.forEach((row) => {
                    let markdownRow = '\n';
                    const headers = row.match(tableHeaderRegex);
                    if (headers) {
                        headers.forEach((header) => {
                            markdownRow += `| ${header.replace(tableHeaderRegex, '$1')} `;
                        });
                        markdownRow += '|\n';
                        markdownRow += '| --- '.repeat(headers.length) + '|';
                    }
                    const data = row.match(tableDataRegex);
                    if (data) {
                        data.forEach((d) => {
                            markdownRow += `| ${d.replace(tableDataRegex, '$1')} `;
                        });
                        markdownRow += '|';
                    }
                    markdownTable += markdownRow;
                });
            }
            markdown = markdown.replace(table, markdownTable);
        });
    }
    return markdown;
}


    let element = document.querySelector(".pr-14.bg-gray-800");
    if (!element || element.innerText === undefined) {
        alert("Nothing found");
        return;
    }    
    const e = document.querySelectorAll(".text-base");
    let t = "";
    for (const s of e) {
        if (s.querySelector('.whitespace-pre-wrap')) {
            let innerHtml = s.querySelector(".whitespace-pre-wrap").innerHTML;
            t += `${htmlToMarkdown(s.querySelectorAll('img').length > 1 ? `**You:**` : `**ChatGPT:**`)}\n\n\n${htmlToMarkdown(innerHtml)}\n------------------\n`
        }
    }
    let handle = await window.showSaveFilePicker({ suggestedName: "Saved_ChatGPT_.md" });
    let stream = await handle.createWritable();
    await stream.write(t);
    await stream.close();
}
