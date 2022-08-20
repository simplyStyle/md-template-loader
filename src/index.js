const cheerio = require("cheerio");
const markdown = require("markdown-it");
const path = require("path");

var componentIndex = 0;

const renderMd = function (html, fileName) {
    var $ = cheerio.load(html, {
        decodeEntities: false,
        lowerCaseAttributeNames: false,
        lowerCaseTags: false,
    });
    let componenetsString = "";
    let id = 0;
    let styleStr = "";

    $("style").each((index, item) => {
        styleStr += $(item).html();
    });

    $("div.source").each((index, item) => {
        let componentName = `source${id}`;
        let vueTeml = renderVueTemplate($(item).html(), componentName);

        $(item).replaceWith(
            `<template slot="source"><${componentName} /></template>`
        );

        componenetsString += `${JSON.stringify(componentName)}: ${vueTeml},`;
        id++;
    });

    let pageScript = `<script>
      export default {
        name: "component-doc${componentIndex}",
        components: {
          ${componenetsString}
        }
      }
    </script>`;

    let htmlStr = $.html();
    var result = `<template> <div class="demo-${fileName}">${htmlStr}</div> </template> \n  ${pageScript} \n  <style lang="scss"  >${styleStr}</style>`;
    return result;
};

const renderVueTemplate = function (content, componentName) {
    let $ = cheerio.load(content, {
        decodeEntities: false,
    });

    let $style = $("style");
    $style.remove();

    let $script = $("script");
    let componentOptionsStr = "";
    if ($script) {
        let execResult = /export[\s]+?default[\s]*?{([\s\S]*)}/.exec(
            $script.html()
        );
        componentOptionsStr = execResult ? execResult[1] : "";
    }

    $script.remove();

    let templateExecResult = /^\s*<template>([\s\S]*)<\/template>\s*$/.exec(
        $("template").html()
    );

    let templateStr = "";
    templateStr = templateExecResult ? templateExecResult[1] : $("template").html();

    let componentStr = `{template: \`<div class="${componentName}"><template>${templateStr}</template></div>\`,${componentOptionsStr}}`;
    return componentStr;
};

const parser = markdown("default");

const defaultRender = parser.renderer.rules.fence;
parser.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // judge whether the fence is in :::demo
    const prevToken = tokens[idx - 1];
    const isInDemoContainer =
        prevToken &&
        prevToken.nesting === 1 &&
        prevToken.info.trim().match(/^demo\s*(.*)$/);
    if (token.info === "html" && isInDemoContainer) {
        return `<template>
					${defaultRender(tokens, idx, options, env, self)}
				</template>`;
    }
};

parser.renderer.rules.table_open = function () {
    return '<table class="example-table">';
};

parser.use(require("markdown-it-container"), "demo", {
    validate: function (params) {
        return params.trim().match(/^demo\s+(.*)$/);
    },

    render: function (tokens, idx) {
        if (tokens[idx].nesting === 1) {
            // 1.Get the content of the first line, and use markdown to render HTML as the description of the component
            let demoInfo = tokens[idx].info.trim().match(/^demo\s+(.*)$/);
            let description = demoInfo && demoInfo.length > 1 ? demoInfo[1] : "";
            let descriptionHTML = description ? markdown().render(description) : "";
            // 2.Get the HTML and JS code in the code block
            let content = tokens[idx + 1].content;
            // 3.Use the custom development component 【DemoBlock】 to wrap the content and render it into cases and code examples
            return `<demo-block>
                  <div class="source" slot="source">${content}</div>
                  ${descriptionHTML}
                  <div class="highlight" slot="highlight">`;
        } else {
            return "</div></demo-block>\n";
        }
    },
});

module.exports = function (source) {
    this.cacheable && this.cacheable();
    const { resourcePath = "" } = this;
    const fileName = path.basename(resourcePath, ".md");
    // This @ symbol is a special symbol in markdown
    source = source.replace(/@/g, "__at__");

    const content = parser.render(source).replace(/__at__/g, "@");

    const result = renderMd(content, fileName);
    return result;
};
