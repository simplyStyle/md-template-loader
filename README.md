<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# md-template-loader

support multiple vue template in a markdown doc.

## Getting Started

To begin, you'll need to install `md-template-loader`:

```console
$ npm install md-template-loader --save-dev
```

Then add the loader to your `webpack` config. For example:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          {
            loader: "vue-loader",
          },
          {
            loader: "md-template-loader",
          },
        ],
      },
    ],
  },
};
```

And run `webpack` via your preferred method.

## can use vue template mode
you need create a `demo-block.vue` and register
```js
<template>
    <div>
        <div>
            <slot name="source"></slot>
        </div>
        <div @click="showCode=!showCode">
            <span
              :class="[showCode ? 'icon-base-arrow-up-bold' : 'icon-base-arrow-down-bold']"
              >
              </span>
        </div>
        <div v-show="showCode">
            <slot name="highlight"></slot>
        </div>
    </div>
</template>
<script>

export default {
  data() {
    return {
      showCode: false
    };
  }
};
</script>
```

Then start writing the markdown document：
```md

<!-- start -->
::: demo test1
``html

<template>
    <button @click="showToast()">click1</button>
</template>

<script>
export default {
    methods: {
        showToast() {
           window.alert(1)
        }
    }
};
</script>
``
:::
<!-- end -->

::: demo test1
``html

<template>
    <button @click="showToast()">click2</button>
</template>

<script>
export default {
    methods: {
        showToast() {
           window.alert(2)
        }
    }
};
</script>
``
:::
```
We will find that writing two `Vue templates` in the same markdown will not cause an error in the click event
